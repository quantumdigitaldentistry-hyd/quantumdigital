import { create } from 'zustand';

/**
 * The site-wide actions (book, call back, chat). Any button anywhere can open one; the
 * panels themselves are mounted once in the root layout.
 */
export type QuickAction = 'book' | 'callback' | 'chat';

export const useQuickActions = create<{
  open: QuickAction | null;
  /** True after the first open: the panels' code is only loaded from then on. */
  used: boolean;
  show: (action: QuickAction) => void;
  close: () => void;
}>((set) => ({
  open: null,
  used: false,
  show: (action) => set({ open: action, used: true }),
  close: () => set({ open: null }),
}));
