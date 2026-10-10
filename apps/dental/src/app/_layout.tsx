import '../global.css';

import { useFestiveTheme } from '@quantam/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useFestival } from '@/theme/festival';
import { appFonts } from '@/theme/fonts';
import { ThemeSync } from '@/theme/theme-sync';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded, fontError] = useFonts(appFonts);
  useFestiveTheme(useFestival((s) => s.festival));
  // Web is pre-rendered to static HTML and swaps fonts in itself; only native waits.
  const ready = Platform.OS === 'web' || fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Keep the native splash up until fonts are in, so app text never flashes in a fallback face.
  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeSync>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeSync>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
