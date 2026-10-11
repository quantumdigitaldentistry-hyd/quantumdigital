import { z } from 'zod';

import { phoneSchema } from './patient';

/** "Book an appointment" request from the website's contact form. */
export const appointmentRequestSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  phone: phoneSchema,
  /** Treatment slug, or empty when the visitor isn't sure yet. */
  treatment: z.string().trim().max(40).optional(),
  /** YYYY-MM-DD, today or later. */
  preferredDate: z.iso
    .date('Choose a date')
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || value >= new Date().toISOString().slice(0, 10), {
      message: 'Choose today or a later date',
    }),
  /** Part of the day that suits the visitor best. */
  preferredTime: z.enum(['morning', 'afternoon', 'evening']).optional(),
  message: z.string().trim().max(500, 'Please keep it under 500 characters').optional(),
});

export type AppointmentRequest = z.infer<typeof appointmentRequestSchema>;
