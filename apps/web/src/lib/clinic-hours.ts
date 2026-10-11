import { defaultHours, type DayHours } from '@/config/site';

/**
 * This week's opening hours (Sunday = 0). Comes from the site config for now; once the
 * backend is connected, staff edit them in the dashboard and this reads the saved value.
 */
export function useClinicHours(): DayHours[] {
  return defaultHours;
}
