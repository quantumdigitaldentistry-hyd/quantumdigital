// Send the "appointment confirmed" SMS automatically through MSG91 (team only).
//
// India's DLT rules only allow automatic SMS that match a pre-approved template, so this
// sends the confirmation template only. Custom messages (e.g. offering available slots)
// are sent from the staff member's own phone via WhatsApp/SMS, which the dashboard opens
// pre-filled and logs.
//
// Secrets: MSG91_AUTH_KEY, MSG91_CONFIRM_TEMPLATE_ID (a DLT-approved flow template with
// variables name, date, time, doctor). Without them it answers { status: "not_configured" }
// and the dashboard falls back to the phone.

import { z } from 'npm:zod@4.1.5';

import { adminClient, json, preflight, teamCaller } from '../_shared/http.ts';

const bodySchema = z.object({ appointmentId: z.uuid() });

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));

Deno.serve(async (request) => {
  const early = preflight(request);
  if (early) return early;

  const admin = adminClient();
  const caller = await teamCaller(request, admin);
  if (!caller) return json(request, 403, { error: 'Sign in again.' });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json(request, 422, { error: 'Unknown appointment.' });

  const { data: appointment } = await admin
    .from('appointments')
    .select('id, patient_name, patient_phone, status, starts_at, doctor:team_members(full_name)')
    .eq('id', parsed.data.appointmentId)
    .maybeSingle();
  if (!appointment) return json(request, 404, { error: 'Unknown appointment.' });
  if (appointment.status !== 'confirmed' || !appointment.starts_at) {
    return json(request, 409, { error: 'Confirm a time before sending the confirmation.' });
  }

  const authKey = Deno.env.get('MSG91_AUTH_KEY');
  const templateId = Deno.env.get('MSG91_CONFIRM_TEMPLATE_ID');
  if (!authKey || !templateId) return json(request, 200, { status: 'not_configured' });

  const doctor = (appointment.doctor as { full_name?: string } | null)?.full_name ?? 'our doctor';
  const variables = {
    name: appointment.patient_name,
    date: fmtDate(appointment.starts_at),
    time: fmtTime(appointment.starts_at),
    doctor,
  };
  const response = await fetch('https://control.msg91.com/api/v5/flow', {
    method: 'POST',
    headers: { authkey: authKey, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      template_id: templateId,
      short_url: '0',
      recipients: [{ mobiles: appointment.patient_phone.replace(/^\+/, ''), ...variables }],
    }),
  });
  const result = await response.json().catch(() => ({}));
  const ok = response.ok && result?.type !== 'error';

  await admin.from('appointment_messages').insert({
    appointment_id: appointment.id,
    channel: 'sms',
    to_phone: appointment.patient_phone,
    body: `Confirmation: ${variables.date} ${variables.time} with ${doctor}`,
    status: ok ? 'sent' : 'failed',
    provider_ref: typeof result?.message === 'string' ? result.message.slice(0, 120) : null,
    sent_by: caller.id,
  });

  return json(
    request,
    ok ? 200 : 502,
    ok ? { status: 'sent' } : { error: 'The SMS provider rejected the message.' },
  );
});
