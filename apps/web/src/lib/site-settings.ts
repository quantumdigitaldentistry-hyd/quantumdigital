import { create } from 'zustand';

import { defaultHours, type DayHours } from '@/config/site';
import { getSupabase } from '@/lib/backend';

/**
 * Site-wide settings the clinic team controls from the staff area: the active festival
 * package and the weekly opening hours. Loaded once per visit (public, read-only); the
 * site falls back to config defaults if the backend isn't connected or the read fails.
 */
/** A festival offer set by the team (shown on the banner and the festival popup). */
export type FestivalOffer = {
  title: string;
  discount: string;
  details: string;
  /** YYYY-MM-DD, last day of the offer, or empty for no end date. */
  validUntil: string;
  popup: boolean;
};

/** Today as YYYY-MM-DD in the visitor's own time zone (not UTC, which lags India by 5½ hours). */
export const localToday = () => new Date().toLocaleDateString('en-CA');

const isDate = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.slice(0, max) : '';

/** Only the expected shape; an offer past its end date counts as no offer. */
export function parseOffer(value: unknown): FestivalOffer | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const offer: FestivalOffer = {
    title: text(raw.title, 60),
    discount: text(raw.discount, 20),
    details: text(raw.details, 200),
    validUntil: isDate(raw.validUntil) ? raw.validUntil : '',
    popup: raw.popup !== false,
  };
  if (!offer.title && !offer.discount) return null;
  if (offer.validUntil && offer.validUntil < localToday()) return null;
  return offer;
}

type SiteSettings = {
  festivalId: string | null;
  /** YYYY-MM-DD, the festival theme's last day, or '' to stay on until it's removed. */
  festivalUntil: string;
  offer: FestivalOffer | null;
  hours: DayHours[];
  loaded: boolean;
  load: () => Promise<void>;
  /** Used by the staff area after saving, so the change shows immediately. */
  setFestival: (id: string | null, offer: FestivalOffer | null, until?: string) => void;
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
  festivalUntil: '',
  offer: null,
  hours: defaultHours,
  loaded: false,
  load: () => {
    if (loading) return loading;
    loading = (async () => {
      const supabase = await getSupabase();
      if (!supabase) return set({ loaded: true });
      const { data, error } = await supabase.from('site_settings').select('key, value');
      if (error || !data) return set({ loaded: true });
      const byKey = Object.fromEntries(data.map((row) => [row.key, row.value]));
      const festival = byKey.festival as
        { theme?: unknown; until?: unknown; offer?: unknown } | undefined;
      const until = isDate(festival?.until) ? festival.until : '';
      // After its last day the theme switches itself off: everyone sees the everyday look.
      const live = typeof festival?.theme === 'string' && (!until || until >= localToday());
      set({
        loaded: true,
        festivalId: live ? (festival.theme as string) : null,
        festivalUntil: live ? until : '',
        offer: live ? parseOffer(festival?.offer) : null,
        hours: parseHours(byKey.clinic_hours),
      });
    })();
    return loading;
  },
  setFestival: (festivalId, offer, until = '') =>
    set({ festivalId, offer, festivalUntil: festivalId ? until : '' }),
  setHours: (hours) => set({ hours }),
}));
