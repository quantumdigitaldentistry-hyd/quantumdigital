import type { CSSProperties, ReactNode } from 'react';

import { cx } from '@/lib/cx';

/**
 * Fades content up as it scrolls into view, using CSS scroll-driven animations (`.reveal`
 * in styles.css). No JavaScript runs, and content is never hidden waiting for a script:
 * browsers without scroll timelines, and reduced-motion users, simply see it in place.
 */
export function Reveal({
  children,
  step = 0,
  variant = 'rise',
  className,
}: {
  children: ReactNode;
  /** Position among siblings (0, 1, 2…) for a slight stagger. */
  step?: number;
  /** rise: fade up. tilt: tilt up into place (cards). */
  variant?: 'rise' | 'tilt';
  className?: string;
}) {
  return (
    <div
      className={cx(variant === 'tilt' ? 'tilt-in' : 'reveal', className)}
      style={{ '--reveal-start': `${step * 6}%` } as CSSProperties}
    >
      {children}
    </div>
  );
}
