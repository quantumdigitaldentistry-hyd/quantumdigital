import type { DayHours } from '@/config/site';
import { useSiteSettings } from '@/lib/site-settings';

/**
 * This week's opening hours (Sunday = 0): what the team saved in the staff area, or the
 * config defaults until then.
 */
export function useClinicHours(): DayHours[] {
  return useSiteSettings((s) => s.hours);
}

/** "09:30" → "9:30 am", "21:00" → "9 pm". */
export function formatClock(value: string) {
  const [h = 0, m = 0] = value.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
}

/** A day's hours as text: "9:30 am – 9 pm", "Closed" or "Call to confirm". */
export function describeHours(hours: DayHours | undefined) {
  return hours === 'closed'
    ? 'Closed'
    : hours
      ? `${formatClock(hours.open)} – ${formatClock(hours.close)}`
      : 'Call to confirm';
}
