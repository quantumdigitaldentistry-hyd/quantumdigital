// Email from the clinic's Gmail account (SMTP_USER + a Google app password in SMTP_PASS).

import nodemailer from 'npm:nodemailer@6.9.16';

/** A Gmail transport, or null when SMTP_USER / SMTP_PASS aren't set. */
export function gmail() {
  const user = Deno.env.get('SMTP_USER');
  const pass = Deno.env.get('SMTP_PASS');
  if (!user || !pass) return null;
  // Port 465 (implicit TLS): Supabase Edge Functions block outbound 587.
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  return { transport, from: user };
}

/** Supabase Edge Runtime: keeps background work alive after the reply. */
declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void } | undefined;

/** Run `work` after the response is sent (awaited when served outside the Edge Runtime). */
export async function inBackground(work: Promise<unknown>) {
  if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(work);
  else await work;
}
