// Import each weight from its own subpath: the package root `require`s every weight and
// italic, which would ship dozens of font files inside the .apk/.ipa instead of these 8.
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono/400Regular';
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono/500Medium';
import { InstrumentSans_400Regular } from '@expo-google-fonts/instrument-sans/400Regular';
import { InstrumentSans_500Medium } from '@expo-google-fonts/instrument-sans/500Medium';
import { InstrumentSans_600SemiBold } from '@expo-google-fonts/instrument-sans/600SemiBold';
import { InstrumentSans_700Bold } from '@expo-google-fonts/instrument-sans/700Bold';
import { Sora_600SemiBold } from '@expo-google-fonts/sora/600SemiBold';
import { Sora_700Bold } from '@expo-google-fonts/sora/700Bold';

/**
 * Family names must match the --font-* tokens in src/global.css.
 * Each weight is its own family so Android renders the correct file.
 */
export const appFonts = {
  'Sora-SemiBold': Sora_600SemiBold,
  'Sora-Bold': Sora_700Bold,
  'InstrumentSans-Regular': InstrumentSans_400Regular,
  'InstrumentSans-Medium': InstrumentSans_500Medium,
  'InstrumentSans-SemiBold': InstrumentSans_600SemiBold,
  'InstrumentSans-Bold': InstrumentSans_700Bold,
  'IBMPlexMono-Regular': IBMPlexMono_400Regular,
  'IBMPlexMono-Medium': IBMPlexMono_500Medium,
};
