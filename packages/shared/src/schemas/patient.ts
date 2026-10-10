import { z } from 'zod';

import { REMINDER_CHANNELS } from '../constants';

/** E.164 phone format, e.g. +919876543210 — required by WhatsApp/SMS/voice providers. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, 'Use international format, e.g. +919876543210');

export const patientContactSchema = z.object({
  fullName: z.string().trim().min(2, 'Name is required'),
  phone: phoneSchema,
  email: z.email().optional().or(z.literal('')),
  preferredChannel: z.enum(REMINDER_CHANNELS).default('whatsapp'),
  notes: z.string().max(1000).optional(),
});

export type PatientContact = z.infer<typeof patientContactSchema>;
