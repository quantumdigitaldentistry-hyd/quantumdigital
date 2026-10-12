/**
 * Booking. Every "Book" button links to the booking page; when the page you're on already
 * has a booking form (sections marked `data-booking`), the button glides to the nearest
 * one instead. A treatment chosen by the button travels with it either way.
 */
export const bookingPath = (treatment?: string) =>
  treatment ? `/book-appointment?treatment=${encodeURIComponent(treatment)}` : '/book-appointment';

/** A treatment handed to the next booking form that mounts (forms load lazily). */
const intent = { treatment: '' };
export const BOOKING_TREATMENT_EVENT = 'booking:treatment';

/** Takes the pending treatment, once. */
export function takeBookingTreatment() {
  const { treatment } = intent;
  intent.treatment = '';
  return treatment;
}

/** The booking form section closest to the current view, if the page has one. */
export function nearestBookingSection(): HTMLElement | null {
  const sections = [...document.querySelectorAll<HTMLElement>('[data-booking]')];
  let best: HTMLElement | null = null;
  let bestDistance = Infinity;
  for (const section of sections) {
    const distance = Math.abs(section.getBoundingClientRect().top);
    if (distance < bestDistance) {
      best = section;
      bestDistance = distance;
    }
  }
  return best;
}

/** Hands `treatment` to the form, both a mounted one (event) and one still loading. */
export function selectBookingTreatment(treatment?: string) {
  if (!treatment) return;
  intent.treatment = treatment;
  window.dispatchEvent(new CustomEvent(BOOKING_TREATMENT_EVENT, { detail: treatment }));
}
