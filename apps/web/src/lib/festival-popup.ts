import { create } from 'zustand';

/** Whether the festival greeting/offer popup is open (opened by the navbar medallion too). */
export const useFestivalPopup = create<{ open: boolean; setOpen: (open: boolean) => void }>(
  (set) => ({
    open: false,
    setOpen: (open) => set({ open }),
  }),
);

const SEEN_KEY = 'qd-festival-popup-seen';

/** Shown automatically once per visit (per festival), never again after it's closed. */
export function popupSeen(festivalId: string) {
  try {
    return sessionStorage.getItem(SEEN_KEY) === festivalId;
  } catch {
    return false;
  }
}

export function markPopupSeen(festivalId: string) {
  try {
    sessionStorage.setItem(SEEN_KEY, festivalId);
  } catch {
    // Storage blocked: it may show again next page load, which is acceptable.
  }
}
