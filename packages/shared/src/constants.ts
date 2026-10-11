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

/**
 * Festival themes a clinic campaign (offer or greeting) can use. Order is roughly the
 * calendar year. Colours live in @quantam/ui (festive-themes.ts); `clinic` is the
 * everyday brand look used when no festival is running.
 */
export const FESTIVAL_KEYS = [
  'clinic',
  'new-year',
  'sankranti',
  'holi',
  'ugadi',
  'oral-health',
  'eid',
  'national',
  'raksha',
  'janmashtami',
  'onam',
  'ganesh',
  'dasara',
  'diwali',
  'christmas',
] as const;

export type FestivalKey = (typeof FESTIVAL_KEYS)[number];
