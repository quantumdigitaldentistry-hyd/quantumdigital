import type { AppointmentRequest, CallbackRequest } from '@quantam/shared';

import { getSupabase } from '@/lib/backend';

/** Thrown when the site has no backend configured (no VITE_SUPABASE_* values). */
export class CallbackNotConnectedError extends Error {
  constructor() {
    super('Requests are not connected yet');
    this.name = 'CallbackNotConnectedError';
  }
}

/** Thrown when the clinic's server refuses or can't take the request. */
export class RequestFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestFailedError';
  }
}

type Payload = {
  kind: 'appointment' | 'callback';
  name: string;
  phone: string;
  treatment?: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
  /** Honeypot: a hidden field that only bots fill in. */
  website?: string;
};

/**
 * Sends a request to the book-appointment Edge Function, which validates it, stores it
 * for the team and emails the clinic. Rejects with a readable message on failure.
 */
async function send(payload: Payload) {
  const supabase = await getSupabase();
  if (!supabase) throw new CallbackNotConnectedError();
  const { data, error } = await supabase.functions.invoke<{ ok?: boolean; error?: string }>(
    'book-appointment',
    { body: payload },
  );
  if (error) {
    // FunctionsHttpError carries the server's JSON body.
    let message = 'Your request could not be sent.';
    try {
      const body = await (error as { context?: Response }).context?.json();
      if (body?.error) message = body.error;
    } catch {
      // keep the generic message
    }
    throw new RequestFailedError(message);
  }
  if (!data?.ok) throw new RequestFailedError(data?.error ?? 'Your request could not be sent.');
}

/** "Instant call back". */
export function requestCallback(request: CallbackRequest, website?: string) {
  return send({ kind: 'callback', name: request.name, phone: request.phone, website });
}

/** "Book an appointment". */
export function requestAppointment(request: AppointmentRequest, website?: string) {
  return send({
    kind: 'appointment',
    name: request.name,
    phone: request.phone,
    treatment: request.treatment || undefined,
    preferredDate: request.preferredDate || undefined,
    preferredTime: request.preferredTime,
    message: request.message || undefined,
    website,
  });
}
