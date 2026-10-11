import { PhoneIcon } from '@phosphor-icons/react';

import { clinic, clinicTelHref } from '@/config/site';
import { cx } from '@/lib/cx';

/**
 * The clinic number. A tap-to-call link once the number is configured in config/site.ts;
 * plain text until then, so nobody dials a placeholder.
 */
export function PhoneLink({ className, iconSize = 16 }: { className?: string; iconSize?: number }) {
  const content = (
    <>
      <PhoneIcon size={iconSize} weight="fill" aria-hidden />
      <span className="font-medium tabular-nums">{clinic.phone.display}</span>
    </>
  );
  const classes = cx('inline-flex items-center gap-2 whitespace-nowrap', className);
  return clinicTelHref ? (
    <a href={clinicTelHref} className={cx(classes, 'hover:underline')}>
      {content}
    </a>
  ) : (
    <span className={classes}>{content}</span>
  );
}
