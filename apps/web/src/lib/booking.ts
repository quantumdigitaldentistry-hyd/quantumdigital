/**
 * The booking page, optionally with a treatment already chosen. Every "Book" button on
 * the site links here, so booking always happens in one place.
 */
export const bookingPath = (treatment?: string) =>
  treatment ? `/book-appointment?treatment=${encodeURIComponent(treatment)}` : '/book-appointment';
