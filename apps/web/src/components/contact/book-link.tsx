import type { MouseEvent } from 'react';
import { Link, type LinkProps } from 'react-router';

import { bookingPath, nearestBookingSection, selectBookingTreatment } from '@/lib/booking';
import { scrollToElement } from '@/lib/scroll';

/**
 * "Book" link. Glides to the nearest booking form on this page when there is one, and
 * otherwise opens the booking page. Still a real link, so open-in-new-tab works.
 */
export function BookLink({
  treatment,
  onClick,
  ...rest
}: Omit<LinkProps, 'to'> & { treatment?: string }) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const section = nearestBookingSection();
    if (!section) return;
    event.preventDefault();
    selectBookingTreatment(treatment);
    scrollToElement(section);
  };
  return <Link viewTransition {...rest} to={bookingPath(treatment)} onClick={handleClick} />;
}
