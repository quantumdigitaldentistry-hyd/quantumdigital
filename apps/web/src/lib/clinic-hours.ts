import type { DayHours } from '@/config/site';
import { useSiteSettings } from '@/lib/site-settings';

/**
 * This week's opening hours (Sunday = 0): what the team saved in the staff area, or the
 * config defaults until then.
 */
export function useClinicHours(): DayHours[] {
  return useSiteSettings((s) => s.hours);
}
