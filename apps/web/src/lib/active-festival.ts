import { useEffect } from 'react';

import { useFestival } from '@/lib/festival';
import { findFestivalPack, type FestivalPack } from '@/lib/festival-packs';
import { useSiteSettings } from '@/lib/site-settings';

/** The festival package the clinic has switched on, or null on ordinary days. */
export function useActiveFestival(): FestivalPack | null {
  return findFestivalPack(useSiteSettings((s) => s.festivalId));
}

/**
 * Applies the active festival site-wide: its colour palette (festive tokens and the 3D
 * logo) and the browser tab icon. Mounted once in the root layout.
 */
export function useFestivalSync() {
  const pack = useActiveFestival();
  const setFestival = useFestival((s) => s.setFestival);

  useEffect(() => {
    void useSiteSettings.getState().load();
  }, []);

  useEffect(() => {
    setFestival(pack?.palette ?? 'clinic');
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    const original = link.dataset.original ?? link.href;
    link.dataset.original = original;
    link.href = pack ? pack.icon.small : original;
  }, [pack, setFestival]);
}
