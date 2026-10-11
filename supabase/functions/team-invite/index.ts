// Add a doctor or staff member. Only doctors and the super admin may call it.
//   mode "invite":   Supabase emails them a link to set their own password.
//   mode "password": creates the account with a one-time temporary password, returned
//                    once to the caller to pass on; they change it on first sign-in.
// Nobody can be added as super admin: that role belongs to the clinic account only.

import { z } from 'npm:zod@4.1.5';

import { adminClient, json, preflight, teamCaller } from '../_shared/http.ts';

const bodySchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  fullName: z.string().trim().min(2).max(80),
  role: z.enum(['doctor', 'staff']),
  doctorSlug: z
    .string()
    .regex(/^[a-z0-9-]{1,60}$/)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  mode: z.enum(['invite', 'password']).default('invite'),
});

/** 16 characters with upper, lower, digit and symbol (meets the project's policy). */
function temporaryPassword() {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%^&*?'];
  const all = sets.join('');
  const pick = (chars: string) =>
    chars[crypto.getRandomValues(new Uint32Array(1))[0]! % chars.length]!;
  const chars = [...sets.map(pick), ...Array.from({ length: 12 }, () => pick(all))];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0]! % (i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join('');
}

Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;

  const admin = adminClient();
  const caller = await teamCaller(request, admin);
  if (!caller || (caller.role !== 'super_admin' && caller.role !== 'doctor')) {
    return json(request, 403, {
      error: 'Only doctors and the clinic account can add team members.',
    });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json(request, 422, { error: 'Check the name, email and role.' });
  const { email, fullName, role, doctorSlug, mode } = parsed.data;

  const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';
  let userId: string | undefined;
  let password: string | undefined;

  if (mode === 'invite') {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/staff/set-password`,
      data: { full_name: fullName },
    });
    if (error) {
      const exists = /already|registered|exists/i.test(error.message);
      return json(request, exists ? 409 : 500, {
        error: exists ? 'That email already has an account.' : 'Could not send the invite.',
      });
    }
    userId = data.user?.id;
  } else {
    password = temporaryPassword();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, must_change_password: true },
    });
    if (error) {
      const exists = /already|registered|exists/i.test(error.message);
      return json(request, exists ? 409 : 500, {
        error: exists ? 'That email already has an account.' : 'Could not create the account.',
      });
    }
    userId = data.user?.id;
  }
  if (!userId) return json(request, 500, { error: 'Could not create the account.' });

  const { error: memberError } = await admin.from('team_members').upsert({
    id: userId,
    email,
    full_name: fullName,
    role,
    doctor_slug: role === 'doctor' ? (doctorSlug ?? null) : null,
    invited_by: caller.id,
    active: true,
  });
  if (memberError) {
    console.error('team row', memberError);
    return json(request, 500, { error: 'Account created, but adding it to the team failed.' });
  }

  return json(request, 200, { ok: true, id: userId, temporaryPassword: password });
});
