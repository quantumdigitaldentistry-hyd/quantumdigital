import type { HTMLAttributes } from 'react';

import { cx } from '@/lib/cx';

/** Grouped content. Hierarchy comes from the border, not a drop shadow. Don't nest cards. */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('rounded-container border border-line bg-surface p-4 md:p-6', className)}
      {...rest}
    />
  );
}
