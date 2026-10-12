import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { useQuickActions, type QuickAction } from '@/lib/quick-actions';

const RETRY = 5_000;
const BOOKING_SEEN = 'qdd-booking-prompt';

const seen = (key: string) => {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
};
const markSeen = (key: string) => {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // Storage blocked: it may show again next visit, which is fine.
  }
};

/**
 * Opens `action` after `delay` ms, never over another open panel (it waits and retries).
 * `once`: only once per visit, checked again when the time comes, since another prompt
 * may have shown meanwhile. Either way, showing it counts as this visit's booking prompt.
 */
function useTimedPrompt(action: QuickAction, delay: number, enabled: boolean, once: boolean) {
  useEffect(() => {
    if (!enabled || (once && seen(BOOKING_SEEN))) return;
    let timer = window.setTimeout(function attempt() {
      if (once && seen(BOOKING_SEEN)) return;
      const busy =
        useQuickActions.getState().open !== null || document.querySelector('dialog[open]');
      if (busy) {
        timer = window.setTimeout(attempt, RETRY);
        return;
      }
      markSeen(BOOKING_SEEN);
      useQuickActions.getState().show(action);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [action, delay, enabled, once]);
}

/**
 * Offers the booking form once per visit, 15 seconds after the visitor arrives. Never on
 * the booking page itself, and never over another open panel: if one is open it waits
 * and tries again a few seconds later.
 */
export function BookingPrompt() {
  const { pathname } = useLocation();
  useTimedPrompt('book', 15_000, !pathname.startsWith('/book-appointment'), true);
  return null;
}

/**
 * On the clear aligners page: offers a free Invisalign consultation 5 seconds after every
 * arrival on the page. It stands in for the general booking prompt on that visit, so the
 * two never follow one another.
 */
export function AlignerOfferPrompt() {
  useTimedPrompt('aligner-offer', 5_000, true, false);
  return null;
}
