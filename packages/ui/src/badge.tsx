import { View } from 'react-native';

import { Text, type TextTone } from './text';

const tones = {
  neutral: { container: 'bg-sunken', label: 'muted' },
  brand: { container: 'bg-brand-soft', label: 'on-brand-soft' },
  success: { container: 'bg-success-soft', label: 'success' },
  warning: { container: 'bg-warning-soft', label: 'warning' },
  danger: { container: 'bg-danger-soft', label: 'danger' },
  /** "New", "Featured": the signage yellow pill. */
  highlight: { container: 'bg-highlight', label: 'on-highlight' },
  /** Follows the running festival, e.g. "Deepavali offer". */
  festive: { container: 'bg-festive-soft', label: 'on-festive-soft' },
} as const satisfies Record<string, { container: string; label: TextTone }>;

export type BadgeTone = keyof typeof tones;

/** Short status label. Text always carries the meaning; colour only reinforces it. */
export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const styles = tones[tone];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${styles.container}`}>
      <Text variant="label" tone={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
