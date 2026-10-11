import { create } from 'zustand';

import { defaultHours, type DayHours } from '@/config/site';
import { supabase } from '@/lib/supabase';

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
    validUntil: /^\d{4}-\d{2}-\d{2}$/.test(String(raw.validUntil ?? ''))
      ? String(raw.validUntil)
      : '',
    popup: raw.popup !== false,
  };
  if (!offer.title && !offer.discount) return null;
  if (offer.validUntil && offer.validUntil < new Date().toISOString().slice(0, 10)) return null;
  return offer;
}

type SiteSettings = {
  festivalId: string | null;
  offer: FestivalOffer | null;
  hours: DayHours[];
  loaded: boolean;
  load: () => Promise<void>;
  /** Used by the staff area after saving, so the change shows immediately. */
  setFestival: (id: string | null, offer: FestivalOffer | null) => void;
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
  offer: null,
  hours: defaultHours,
  loaded: false,
  load: () => {
    if (loading) return loading;
    loading = (async () => {
      if (!supabase) return set({ loaded: true });
      const { data, error } = await supabase.from('site_settings').select('key, value');
      if (error || !data) return set({ loaded: true });
      const byKey = Object.fromEntries(data.map((row) => [row.key, row.value]));
      const festival = byKey.festival as { theme?: unknown; offer?: unknown } | undefined;
      set({
        loaded: true,
        festivalId: typeof festival?.theme === 'string' ? festival.theme : null,
        offer: parseOffer(festival?.offer),
        hours: parseHours(byKey.clinic_hours),
      });
    })();
    return loading;
  },
  setFestival: (festivalId, offer) => set({ festivalId, offer }),
  setHours: (hours) => set({ hours }),
}));
