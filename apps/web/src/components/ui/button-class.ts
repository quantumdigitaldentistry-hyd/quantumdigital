import { cx } from '@/lib/cx';

/**
 * primary:   the one main action in a view (brand blue)
 * secondary: alternatives next to a primary
 * ghost:     low-emphasis actions in lists and toolbars
 * danger:    destructive actions
 * festive:   offer CTAs inside festive banners only, never for clinical actions
 */
const variants = {
  primary: 'bg-brand text-on-brand hover:bg-brand-strong',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-sunken',
  ghost: 'text-brand hover:bg-sunken',
  danger: 'bg-danger text-on-danger hover:opacity-90',
  festive: 'bg-festive text-on-festive hover:opacity-90',
} as const;

export type ButtonVariant = keyof typeof variants;

/**
 * Pill-shaped like the clinic signage, 44px minimum touch target, flat fills only (text
 * on a gradient button is hard to read). Also styles links: <Link className={buttonClass()}>.
 */
export const buttonClass = (variant: ButtonVariant = 'primary', className?: string) =>
  cx(
    'relative inline-flex min-h-11 select-none items-center justify-center gap-2 rounded-full px-5',
    'font-medium text-body whitespace-nowrap',
    'transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-45 aria-busy:cursor-progress',
    variants[variant],
    className,
  );
