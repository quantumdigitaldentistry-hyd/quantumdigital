export const APP_NAME = 'Quantam Dental';

export const APPOINTMENT_STATUSES = [
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Channels the reminder agents will use in later phases. */
export const REMINDER_CHANNELS = ['whatsapp', 'sms', 'voice'] as const;

export type ReminderChannel = (typeof REMINDER_CHANNELS)[number];
