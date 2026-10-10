import type { CallbackRequest } from '@quantam/shared';

/** Thrown until call-back requests are stored and routed to the front desk. */
export class CallbackNotConnectedError extends Error {
  constructor() {
    super('Call-back requests are not connected yet');
    this.name = 'CallbackNotConnectedError';
  }
}

/**
 * Sends an "Instant call back" request.
 * TODO(backend): insert into a Supabase `callback_requests` table (with RLS allowing
 * anonymous inserts only) and notify the front desk. Until then this rejects, and the UI
 * tells the visitor to call instead of pretending the request went through.
 */
export async function requestCallback(request: CallbackRequest): Promise<void> {
  void request;
  await new Promise((resolve) => setTimeout(resolve, 600));
  throw new CallbackNotConnectedError();
}
