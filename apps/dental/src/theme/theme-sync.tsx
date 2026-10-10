import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo, type ReactNode } from 'react';
import { useCSSVariable, useUniwind } from 'uniwind';

type NavColor = Theme['colors']['background'];

const asColor = (value: string | number | undefined, fallback: NavColor): NavColor =>
  typeof value === 'string' ? value : fallback;

/**
 * Bridges the CSS tokens to the parts of iOS/Android that className can't reach:
 * the root window colour (seen behind keyboards and during screen transitions),
 * the status bar icons, and React Navigation's headers/tab bars.
 */
export function ThemeSync({ children }: { children: ReactNode }) {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const [canvas, surface, ink, line, brand, danger] = useCSSVariable([
    '--color-canvas',
    '--color-surface',
    '--color-ink',
    '--color-line',
    '--color-brand',
    '--color-danger',
  ]);

  const base = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = useMemo<Theme>(
    () => ({
      ...base,
      colors: {
        ...base.colors,
        background: asColor(canvas, base.colors.background),
        card: asColor(surface, base.colors.card),
        text: asColor(ink, base.colors.text),
        border: asColor(line, base.colors.border),
        primary: asColor(brand, base.colors.primary),
        notification: asColor(danger, base.colors.notification),
      },
    }),
    [base, canvas, surface, ink, line, brand, danger],
  );

  useEffect(() => {
    if (typeof canvas === 'string') SystemUI.setBackgroundColorAsync(canvas);
  }, [canvas]);

  return (
    <ThemeProvider value={navigationTheme}>
      {children}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
