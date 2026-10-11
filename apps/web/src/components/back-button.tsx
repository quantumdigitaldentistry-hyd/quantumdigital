import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router';

import { cx } from '@/lib/cx';
import { goBack } from '@/lib/navigation';

/**
 * Back to exactly where you were: the previous page, scrolled to the spot you left it,
 * with the page transition played in reverse. Opened directly, it goes to `fallback`.
 */
export function BackButton({
  fallback = '/',
  label = 'Back',
  className,
}: {
  fallback?: string;
  label?: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <button
      type="button"
      onClick={() => goBack(navigate, location, fallback)}
      className={cx(
        'group inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-surface/70 py-2 pr-4 pl-3 text-small font-semibold text-ink shadow-sm shadow-elevation/10 backdrop-blur-md transition-colors hover:bg-surface',
        className,
      )}
    >
      <ArrowLeftIcon
        size={18}
        aria-hidden
        className="transition-transform duration-300 ease-out group-hover:-translate-x-1"
      />
      {label}
    </button>
  );
}
