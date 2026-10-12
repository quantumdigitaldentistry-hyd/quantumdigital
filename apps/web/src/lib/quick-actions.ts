import { create } from 'zustand';

/**
 * The site-wide pop-up actions (call back, chat). Booking has its own page
 * (lib/booking.ts). Any button anywhere can open one; the
 * panels themselves are mounted once in the root layout.
 */
export type QuickAction = 'callback' | 'chat';

/** Where a panel was opened from (the button's box on screen), so it can grow out of it. */
export type ActionOrigin = { x: number; y: number; width: number; height: number };

export const useQuickActions = create<{
  open: QuickAction | null;
  /** The opening button's box, kept after closing so the panel can shrink back into it. */
  origin: ActionOrigin | null;
  /** True after the first open: the panels' code is only loaded from then on. */
  used: boolean;
  show: (action: QuickAction, origin?: ActionOrigin) => void;
  close: () => void;
}>((set) => ({
  open: null,
  origin: null,
  used: false,
  show: (action, origin) => set({ open: action, origin: origin ?? null, used: true }),
  close: () => set({ open: null }),
}));
