import type { HTMLAttributes } from 'react';

import { cx } from '@/lib/cx';

/** The page column: full width with a 16px gutter on phones, capped and centred on wide screens. */
export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('mx-auto w-full max-w-6xl px-4 md:px-6', className)} {...rest} />;
}
