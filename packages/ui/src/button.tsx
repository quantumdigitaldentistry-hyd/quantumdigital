import { Pressable, View, type PressableProps } from 'react-native';

import { DotsLoader, type DotsColour } from './dots-loader';
import { Text, type TextTone } from './text';

/**
 * primary:   the one main action on a screen (brand blue)
 * secondary: alternatives next to a primary
 * ghost:     low-emphasis actions in lists and toolbars
 * danger:    destructive actions
 * festive:   offer CTAs inside festive banners only, never for clinical actions
 *
 * `dots` is the loader colour: it matches the label, so it is as readable as the text.
 */
const variants = {
  primary: { container: 'bg-brand active:bg-brand-strong', label: 'on-brand', dots: 'on-brand' },
  secondary: {
    container: 'border border-line-strong bg-surface active:bg-sunken',
    label: 'default',
    dots: 'ink',
  },
  ghost: { container: 'bg-transparent active:bg-sunken', label: 'brand', dots: 'brand' },
  danger: { container: 'bg-danger active:opacity-90', label: 'on-danger', dots: 'on-danger' },
  festive: { container: 'bg-festive active:opacity-90', label: 'on-festive', dots: 'on-festive' },
} as const satisfies Record<string, { container: string; label: TextTone; dots: DotsColour }>;

export type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: keyof typeof variants;
  /** Shows the dots loader in place of the label and blocks presses. Width stays the same. */
  loading?: boolean;
  className?: string;
};

/** Pill-shaped like the clinic signage. Flat fills only: text on a gradient button is hard to read. */
export function Button({
  title,
  variant = 'primary',
  loading = false,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const styles = variants[variant];
  const inactive = !!disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={loading ? `${title}, loading` : title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      className={`min-h-11 flex-row items-center justify-center rounded-full px-5 active:scale-[0.98] ${styles.container} ${
        disabled && !loading ? 'opacity-45' : ''
      } ${className}`}
      {...rest}
    >
      {/* The label stays in the layout while loading so the button doesn't change width. */}
      <Text
        variant="body-strong"
        tone={styles.label}
        numberOfLines={1}
        className={loading ? 'opacity-0' : ''}
      >
        {title}
      </Text>
      {loading ? (
        <View className="absolute inset-0 items-center justify-center">
          <DotsLoader colour={styles.dots} size="sm" />
        </View>
      ) : null}
    </Pressable>
  );
}
