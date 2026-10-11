import { create } from 'zustand';

import { defaultHours, type DayHours } from '@/config/site';
import { supabase } from '@/lib/supabase';

/**
 * Site-wide settings the clinic team controls from the staff area: the active festival
 * package and the weekly opening hours. Loaded once per visit (public, read-only); the
 * site falls back to config defaults if the backend isn't connected or the read fails.
 */
type SiteSettings = {
  festivalId: string | null;
  hours: DayHours[];
  loaded: boolean;
  load: () => Promise<void>;
  /** Used by the staff area after saving, so the change shows immediately. */
  setFestivalId: (id: string | null) => void;
  setHours: (hours: DayHours[]) => void;
};

const isTime = (value: unknown) =>
  typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

/** Accepts only the shapes the database allows; anything else becomes "not confirmed". */
export function parseHours(value: unknown): DayHours[] {
  if (!Array.isArray(value) || value.length !== 7) return defaultHours;
  return value.map((day) => {
    if (day === 'closed') return 'closed';
    if (
      day &&
      typeof day === 'object' &&
      isTime((day as { open?: unknown }).open) &&
      isTime((day as { close?: unknown }).close)
    ) {
      return { open: (day as { open: string }).open, close: (day as { close: string }).close };
    }
    return null;
  });
}

let loading: Promise<void> | null = null;

export const useSiteSettings = create<SiteSettings>((set) => ({
  festivalId: null,
  hours: defaultHours,
  loaded: false,
  load: () => {
    if (loading) return loading;
    loading = (async () => {
      if (!supabase) return set({ loaded: true });
      const { data, error } = await supabase.from('site_settings').select('key, value');
      if (error || !data) return set({ loaded: true });
      const byKey = Object.fromEntries(data.map((row) => [row.key, row.value]));
      const festival = byKey.festival as { theme?: unknown } | undefined;
      set({
        loaded: true,
        festivalId: typeof festival?.theme === 'string' ? festival.theme : null,
        hours: parseHours(byKey.clinic_hours),
      });
    })();
    return loading;
  },
  setFestivalId: (festivalId) => set({ festivalId }),
  setHours: (hours) => set({ hours }),
}));
