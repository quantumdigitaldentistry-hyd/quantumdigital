import { Text } from '@quantam/ui';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

// Brand kit loader "C · Fill": the logo fills bottom to top, 240×240, 40 frames.
const fillGif = require('@/assets/gifs/fill.gif');

/**
 * Full-page loader for screens waiting on data. The GIF has a solid white background,
 * so it sits on a white tile (like the iOS app icon) and looks deliberate on the light
 * canvas and in dark mode. With reduced motion on, the GIF holds its first frame.
 */
export function PageLoader({ label = 'Loading' }: { label?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      className="flex-1 items-center justify-center gap-5 bg-canvas p-6"
    >
      <View className="size-32 overflow-hidden rounded-[28px] border border-line bg-logo-tile">
        <Image
          source={fillGif}
          autoplay={!reduceMotion}
          contentFit="contain"
          style={{ width: '100%', height: '100%' }}
          accessible={false}
        />
      </View>
      <Text variant="small" tone="muted">
        {label}
      </Text>
    </View>
  );
}
