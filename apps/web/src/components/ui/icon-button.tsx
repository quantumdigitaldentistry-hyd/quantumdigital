import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cx } from '@/lib/cx';

const variants = {
  ghost: 'text-ink-muted hover:bg-sunken hover:text-ink',
  outline: 'border border-line-strong bg-surface text-ink hover:bg-sunken',
};

/** Square-round button holding only an icon. `label` is required: it is the accessible name. */
export function IconButton({
  label,
  variant = 'ghost',
  className,
  children,
  type = 'button',
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
  label: string;
  variant?: keyof typeof variants;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'grid size-11 shrink-0 place-items-center rounded-full transition-[background-color,color,transform] duration-150 active:scale-95',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
