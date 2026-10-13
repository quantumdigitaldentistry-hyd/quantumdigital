import { cx } from '@/lib/cx';

/**
 * Holds the booking form's place while its code loads: the same height as the form at
 * each width (measured), so nothing below it jumps when it arrives.
 */
export function FormPlaceholder({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cx(
        'h-254 rounded-4xl border border-line bg-surface shadow-xl shadow-elevation/10 sm:h-216 lg:h-223 xl:h-216',
        className,
      )}
    />
  );
}
