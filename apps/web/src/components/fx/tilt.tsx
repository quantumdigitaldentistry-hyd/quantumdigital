import { useRef, type ReactNode } from 'react';

import { cx } from '@/lib/cx';
import { usePointerTilt } from '@/lib/use-pointer-fx';

/**
 * Wraps a card so it tilts toward the pointer in 3D with a soft light sheen. Mouse and
 * trackpad only; on touch or with reduced motion it renders as a plain wrapper.
 */
export function Tilt({
  children,
  className,
  max = 7,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees. */
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  usePointerTilt(ref, max);
  return (
    <div ref={ref} className={cx('tilt relative', className)}>
      {children}
      {glare ? <span aria-hidden className="tilt-glare" /> : null}
    </div>
  );
}
