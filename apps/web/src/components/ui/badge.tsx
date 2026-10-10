import { cx } from '@/lib/cx';

const tones = {
  neutral: 'bg-sunken text-ink-muted',
  brand: 'bg-brand-soft text-on-brand-soft',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  /** "New", "Featured": the signage yellow pill. */
  highlight: 'bg-highlight text-on-highlight',
  /** Follows the running festival, e.g. "Deepavali offer". */
  festive: 'bg-festive-soft text-on-festive-soft',
} as const;

export type BadgeTone = keyof typeof tones;

/** Short status label. Text always carries the meaning; colour only reinforces it. */
export function Badge({
  label,
  tone = 'neutral',
  className,
}: {
  label: string;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-label font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
