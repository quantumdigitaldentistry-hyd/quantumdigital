// "Forgot password?" on the staff sign-in page. Public (verify_jwt = false): the caller
// is, by definition, signed out.
//
// For an active team member it sets a new temporary password, flags the account
// (must_change_password, so the staff area sends them to "Choose your password" right
// after they sign in with it) and emails it from the clinic's Gmail. The answer is the
// same whether or not the email is on the team, and the work happens after the reply,
// so neither the message nor the timing tells anyone which emails have accounts.
//
// Rate limits (the booking limiter, under separate keys): 5 requests per 30 minutes per
// client, and one reset per 15 minutes per email, so nobody can keep resetting a
// colleague's password.
//
// Secrets: SMTP_USER, SMTP_PASS, SITE_URL, RATE_LIMIT_SALT, ALLOWED_ORIGINS.

import { z } from 'npm:zod@4.1.5';

import { adminClient, clientIp, escapeHtml, json, preflight, saltedHash } from '../_shared/http.ts';
import { gmail, inBackground } from '../_shared/mail.ts';
import { temporaryPassword } from '../_shared/password.ts';

const bodySchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
});

type Admin = ReturnType<typeof adminClient>;

async function resetAndEmail(admin: Admin, email: string) {
  const mail = gmail();
  if (!mail) {
    // Without email the new password would reach nobody, so leave the old one working.
    console.warn('password-reset: SMTP_USER / SMTP_PASS not set, reset skipped');
    return;
  }

  const { data: member } = await admin
    .from('team_members')
    .select('id, full_name, active')
    .eq('email', email)
    .maybeSingle();
  if (!member?.active) return;

  const { data: existing, error: getError } = await admin.auth.admin.getUserById(member.id);
  if (getError || !existing.user) {
    console.error('password-reset: user lookup', getError);
    return;
  }
  const password = temporaryPassword();
  const { error: updateError } = await admin.auth.admin.updateUserById(member.id, {
    password,
    user_metadata: { ...existing.user.user_metadata, must_change_password: true },
  });
  if (updateError) {
    console.error('password-reset: update', updateError);
    return;
  }

  const signIn = `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/staff/login`;
  const name = member.full_name || 'there';
  await mail.transport.sendMail({
    from: `"Quantum Digital Dentistry" <${mail.from}>`,
    to: email,
    subject: 'Your temporary password',
    text: [
      `Hi ${name},`,
      '',
      'Someone asked to reset the password for your Quantum staff account.',
      '',
      `Temporary password: ${password}`,
      '',
      `Sign in at ${signIn} with this password. You'll be asked to choose a new one straight away.`,
      '',
      'If you didn’t ask for this, sign in with the password above, choose a new one, and tell the clinic.',
    ].join('\n'),
    html: `<div style="font-family:sans-serif;line-height:1.5;color:#111">
<p>Hi ${escapeHtml(name)},</p>
<p>Someone asked to reset the password for your Quantum staff account.</p>
<p>Temporary password:<br><strong style="font-family:monospace;font-size:18px;letter-spacing:1px">${escapeHtml(password)}</strong></p>
<p><a href="${escapeHtml(signIn)}">Sign in</a> with this password. You’ll be asked to choose a new one straight away.</p>
<p style="color:#555">If you didn’t ask for this, sign in with the password above, choose a new one, and tell the clinic.</p>
</div>`,
  });
}

Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json(request, 422, { error: 'Enter your email address.' });
  const { email } = parsed.data;

  const admin = adminClient();
  const { data: clientAllowed, error: limitError } = await admin.rpc('allow_booking', {
    hash: await saltedHash(`reset-client:${clientIp(request)}`),
  });
  if (limitError) {
    console.error('password-reset: rate limit', limitError);
    return json(request, 500, { error: 'Something went wrong. Try again in a minute.' });
  }
  if (!clientAllowed) {
    return json(request, 429, { error: 'Too many attempts. Wait a few minutes and try again.' });
  }
  // A repeat for the same email inside 15 minutes gets the same reply but changes nothing,
  // so the password that was just emailed keeps working.
  const { data: emailAllowed } = await admin.rpc('allow_booking', {
    hash: await saltedHash(`reset-email:${email}`),
    max_per_window: 1,
    window_minutes: 15,
  });

  if (emailAllowed) {
    await inBackground(
      resetAndEmail(admin, email).catch((error) => console.error('password-reset', error)),
    );
  }
  return json(request, 200, { ok: true });
});
