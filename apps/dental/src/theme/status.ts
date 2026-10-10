import type { AppointmentStatus } from '@quantam/shared';
import type { BadgeTone } from '@quantam/ui';

/** One mapping for appointment status → badge, used by every list, calendar and detail view. */
export const appointmentStatusBadge: Record<AppointmentStatus, { label: string; tone: BadgeTone }> =
  {
    scheduled: { label: 'Scheduled', tone: 'brand' },
    confirmed: { label: 'Confirmed', tone: 'success' },
    completed: { label: 'Completed', tone: 'neutral' },
    cancelled: { label: 'Cancelled', tone: 'danger' },
    no_show: { label: 'No-show', tone: 'warning' },
  };
