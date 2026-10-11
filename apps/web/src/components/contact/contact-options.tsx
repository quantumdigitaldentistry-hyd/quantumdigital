import { PhoneCallIcon, PhoneIcon } from '@phosphor-icons/react';

import { buttonClass } from '@/components/ui/button-class';
import { clinic, clinicTelHref } from '@/config/site';
import { cx } from '@/lib/cx';
import { useQuickActions } from '@/lib/quick-actions';

/**
 * The ways to reach the clinic right now: call (when the number is configured) and the
 * Instant call back. Shared by the booking, chat and contact surfaces.
 */
export function ContactOptions({ className }: { className?: string }) {
  const show = useQuickActions((s) => s.show);
  return (
    <div className={cx('flex flex-col gap-3 sm:flex-row', className)}>
      <button
        type="button"
        className={buttonClass('callback', 'w-full sm:w-auto')}
        onClick={() => show('callback')}
      >
        <PhoneCallIcon size={20} aria-hidden />
        Instant call back
      </button>
      {clinicTelHref ? (
        <a href={clinicTelHref} className={buttonClass('secondary', 'w-full sm:w-auto')}>
          <PhoneIcon size={20} aria-hidden />
          Call {clinic.phone.display}
        </a>
      ) : null}
    </div>
  );
}
