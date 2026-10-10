import { create } from 'zustand';

/**
 * Light/dark mode. index.html applies the saved choice before first paint; this store
 * keeps <html data-theme>, the browser theme-color and localStorage in sync afterwards.
 */
export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'qd-theme';
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

const readMode = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return 'system';
  }
};

const resolve = (mode: ThemeMode) =>
  mode === 'system' ? (darkQuery.matches ? 'dark' : 'light') : mode;

function apply(mode: ThemeMode) {
  const theme = resolve(mode);
  document.documentElement.dataset.theme = theme;
  // Matches --color-canvas so the mobile browser bar blends into the page.
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0a121a' : '#f4f8fa');
}

export const useTheme = create<{ mode: ThemeMode; setMode: (mode: ThemeMode) => void }>((set) => ({
  mode: readMode(),
  setMode: (mode) => {
    try {
      if (mode === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Private mode or blocked storage: the choice lasts for this visit only.
    }
    apply(mode);
    set({ mode });
  },
}));

// Follow the device when the user hasn't picked a mode.
darkQuery.addEventListener('change', () => {
  if (useTheme.getState().mode === 'system') apply('system');
});
