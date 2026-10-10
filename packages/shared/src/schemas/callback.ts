import { z } from 'zod';

import { phoneSchema } from './patient';

/** "Instant call back" request from the website. */
export const callbackRequestSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  phone: phoneSchema,
});

export type CallbackRequest = z.infer<typeof callbackRequestSchema>;

/**
 * Turns what people type for an Indian mobile number ("98480 21573", "+91 98480-21573",
 * "098480 21573") into E.164 (+919848021573), or null if it isn't a valid mobile number.
 */
export function toIndianE164(input: string): string | null {
  const digits = input.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}
