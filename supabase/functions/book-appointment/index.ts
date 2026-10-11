// Public endpoint for the website's "Book an appointment" and "Instant call back" forms.
// Validates input, drops bots (honeypot), rate-limits per client, stores the request
// and emails the clinic. No JWT needed (verify_jwt = false in config.toml); everything
// it writes goes through the service role after validation.
//
// Secrets (supabase secrets set …):
//   CLINIC_EMAIL      where new requests are emailed (default quantumdigitaldentistry@gmail.com)
//   SMTP_USER         the Gmail address that sends (the clinic account)
//   SMTP_PASS         a Google app password for it (not the account password)
//   RATE_LIMIT_SALT   any long random string
//   ALLOWED_ORIGINS   comma-separated site origins

import { z } from 'npm:zod@4.1.5';

import { adminClient, clientIp, escapeHtml, json, preflight, saltedHash } from '../_shared/http.ts';
import { gmail, inBackground } from '../_shared/mail.ts';

const today = () => new Date().toISOString().slice(0, 10);

const requestSchema = z.object({
  kind: z.enum(['appointment', 'callback']).default('appointment'),
  name: z.string().trim().min(2).max(80),
  // Indian mobile in E.164, as the site sends it.
  phone: z
    .string()
    .trim()
    .regex(/^\+91[6-9]\d{9}$/),
  treatment: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{1,60}$/)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  preferredDate: z.iso
    .date()
    .refine((value) => value >= today())
    .optional()
    .or(z.literal('').transform(() => undefined)),
  preferredTime: z.enum(['morning', 'afternoon', 'evening']).optional(),
  message: z.string().trim().max(500).optional(),
  /** Honeypot: hidden on the site, so only bots fill it. */
  website: z.string().max(200).optional(),
});

const label = (slug?: string) =>
  slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Not sure yet';

async function emailClinic(details: z.infer<typeof requestSchema>, id: string) {
  const mail = gmail();
  const to = Deno.env.get('CLINIC_EMAIL') ?? 'quantumdigitaldentistry@gmail.com';
  if (!mail) {
    console.warn('book-appointment: SMTP_USER / SMTP_PASS not set, email skipped for', id);
    return false;
  }
  const rows: [string, string][] = [
    ['Request', details.kind === 'callback' ? 'Call back' : 'Appointment'],
    ['Name', details.name],
    ['Mobile', details.phone],
    ['Treatment', label(details.treatment)],
    ['Preferred date', details.preferredDate ?? 'Any'],
    ['Time of day', details.preferredTime ?? 'Any'],
    ['Note', details.message || '—'],
  ];
  const html = `<h2 style="font-family:sans-serif">New ${details.kind === 'callback' ? 'call back' : 'appointment'} request</h2>
<table style="font-family:sans-serif;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#555">${k}</td><td style="padding:6px 12px"><strong>${escapeHtml(v)}</strong></td></tr>`,
    )
    .join('')}</table>
<p style="font-family:sans-serif;color:#555">Open the staff area to confirm a time. Reference: ${id}</p>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\nReference: ${id}`;

  await mail.transport.sendMail({
    from: `"Quantum website" <${mail.from}>`,
    to,
    subject: `New ${details.kind === 'callback' ? 'call back' : 'appointment'} request: ${details.name}`,
    text,
    html,
  });
  return true;
}

Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;

  let parsed;
  try {
    parsed = requestSchema.safeParse(await request.json());
  } catch {
    return json(request, 400, { error: 'Invalid request' });
  }
  if (!parsed.success) return json(request, 422, { error: 'Please check the form and try again.' });
  const details = parsed.data;
  // Bots get a quiet success, so they don't learn anything.
  if (details.website) return json(request, 200, { ok: true });

  const admin = adminClient();
  const { data: allowed, error: limitError } = await admin.rpc('allow_booking', {
    hash: await saltedHash(clientIp(request)),
  });
  if (limitError) {
    console.error('rate limit', limitError);
    return json(request, 500, { error: 'Something went wrong. Please call the clinic.' });
  }
  if (!allowed) {
    return json(request, 429, { error: 'Too many requests. Please call the clinic instead.' });
  }

  const { data: row, error } = await admin
    .from('appointments')
    .insert({
      kind: details.kind,
      source: 'website',
      patient_name: details.name,
      patient_phone: details.phone,
      treatment_slug: details.treatment ?? null,
      preferred_date: details.preferredDate ?? null,
      preferred_time: details.preferredTime ?? null,
      message: details.message || null,
    })
    .select('id')
    .single();
  if (error || !row) {
    console.error('insert', error);
    return json(request, 500, { error: 'Something went wrong. Please call the clinic.' });
  }

  // The request is saved and visible to staff, so answer the patient now and send the
  // clinic email in the background (Gmail SMTP can take several seconds).
  const email = emailClinic(details, row.id).catch((mailError) => {
    console.error('email', mailError);
    return false;
  });
  await inBackground(email);
  return json(request, 200, { ok: true, id: row.id });
});
