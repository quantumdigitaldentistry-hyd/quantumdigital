import type { ButtonHTMLAttributes, MouseEvent } from 'react';

import { cx } from '@/lib/cx';

import { buttonClass, type ButtonVariant } from './button-class';
import { DotsLoader } from './dots-loader';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Shows the dots loader in place of the label. Width stays the same; clicks are ignored. */
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  loading = false,
  type = 'button',
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) event.preventDefault();
    else onClick?.(event);
  };
  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      className={buttonClass(variant, className)}
      onClick={handleClick}
      {...rest}
    >
      {/* The label keeps its space while loading so the button doesn't change width. */}
      <span className={cx('inline-flex items-center gap-2', loading && 'invisible')}>
        {children}
      </span>
      {loading ? (
        <span className="absolute inset-0 grid place-items-center">
          <DotsLoader tone="current" size="sm" />
        </span>
      ) : null}
    </button>
  );
}
