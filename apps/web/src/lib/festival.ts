import type { FestivalKey } from '@quantam/shared';
import { create } from 'zustand';

/**
 * Which festival theme the site shows. Today it's set by the /design preview; once
 * campaigns live in Supabase, set it from `activeCampaign(campaigns, today)?.festival`.
 */
export const useFestival = create<{
  festival: FestivalKey;
  setFestival: (festival: FestivalKey) => void;
}>((set) => ({
  festival: 'clinic',
  setFestival: (festival) => set({ festival }),
}));
