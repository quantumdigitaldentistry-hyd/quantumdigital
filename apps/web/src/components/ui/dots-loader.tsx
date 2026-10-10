import type { CSSProperties } from 'react';

import { cx } from '@/lib/cx';

/**
 * Brand kit loader "F · Dots": three dots rise and brighten in turn, 150ms apart, on an
 * 1100ms loop (keyframes `dot-rise` in styles.css). Pure CSS, so it costs no JavaScript.
 *
 * tone="brand": the kit's blue-to-aqua sequence, for plain backgrounds.
 * tone="current": the surrounding text colour, so inside a button it is exactly as
 * readable as the label it replaces.
 */
const tones = {
  brand: ['bg-brand-strong', 'bg-brand', 'bg-aqua'],
  current: ['bg-current', 'bg-current', 'bg-current'],
} as const;

const sizes = {
  sm: { dot: 'size-1.5', gap: 'gap-1.5', lift: '-5px' },
  md: { dot: 'size-[9px]', gap: 'gap-2', lift: '-8px' },
} as const;

export function DotsLoader({
  tone = 'brand',
  size = 'md',
  label = 'Loading',
  className,
}: {
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  label?: string;
  className?: string;
}) {
  const { dot, gap, lift } = sizes[size];
  return (
    <span
      role="status"
      aria-label={label}
      className={cx('inline-flex items-center', gap, className)}
      style={{ '--dot-lift': lift } as CSSProperties}
    >
      {tones[tone].map((colour, index) => (
        <span
          key={index}
          aria-hidden
          className={cx(
            'rounded-full animate-[dot-rise_1100ms_var(--ease-in-out)_infinite_both]',
            'motion-reduce:animate-none motion-reduce:opacity-100',
            dot,
            colour,
          )}
          style={{ animationDelay: `${index * 150}ms` }}
        />
      ))}
    </span>
  );
}
