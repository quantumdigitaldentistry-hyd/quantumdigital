import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * Brand kit loader "F · Dots": three dots rise 8px and brighten in turn,
 * 150ms apart, on an 1100ms loop (30% up, 30% down, 40% rest).
 */
const CYCLE = 1100;
const STAGGER = 150;

/**
 * `brand` uses the brand kit's blue-to-aqua sequence, for standalone use on plain
 * backgrounds. The other colours match a button label, so the dots stay as readable
 * as the text they replace.
 */
const colours = {
  brand: ['bg-brand-strong', 'bg-brand', 'bg-aqua'],
  'on-brand': ['bg-on-brand', 'bg-on-brand', 'bg-on-brand'],
  ink: ['bg-ink', 'bg-ink', 'bg-ink'],
  'on-danger': ['bg-on-danger', 'bg-on-danger', 'bg-on-danger'],
  'on-festive': ['bg-on-festive', 'bg-on-festive', 'bg-on-festive'],
} as const;

export type DotsColour = keyof typeof colours;

const sizes = {
  sm: { dot: 'size-1.5', gap: 'gap-1.5', lift: 5 },
  md: { dot: 'size-[9px]', gap: 'gap-2', lift: 8 },
} as const;

function Dot({
  index,
  className,
  lift,
  reduceMotion,
}: {
  index: number;
  className: string;
  lift: number;
  reduceMotion: boolean;
}) {
  const progress: SharedValue<number> = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const ease = Easing.inOut(Easing.ease);
    progress.value = withDelay(
      index * STAGGER,
      withRepeat(
        withSequence(
          withTiming(1, { duration: CYCLE * 0.3, easing: ease }),
          withTiming(0, { duration: CYCLE * 0.3, easing: ease }),
          withTiming(0, { duration: CYCLE * 0.4 }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(progress);
  }, [index, progress, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 1 : 0.4 + 0.6 * progress.value,
    transform: [{ translateY: -lift * progress.value }],
  }));

  return (
    <Animated.View style={style}>
      <View className={`rounded-full ${className}`} />
    </Animated.View>
  );
}

/** Inline loader for buttons and small areas. With reduced motion on, the dots hold still. */
export function DotsLoader({
  colour = 'brand',
  size = 'md',
  className = '',
}: {
  colour?: DotsColour;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const { dot, gap, lift } = sizes[size];
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      className={`flex-row items-center ${gap} ${className}`}
    >
      {colours[colour].map((bg, index) => (
        <Dot
          key={index}
          index={index}
          className={`${dot} ${bg}`}
          lift={lift}
          reduceMotion={reduceMotion}
        />
      ))}
    </View>
  );
}
