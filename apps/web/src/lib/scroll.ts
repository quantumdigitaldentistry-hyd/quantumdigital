import { prefersReducedMotion } from '@/lib/gsap';

type Lenis = InstanceType<typeof import('lenis').default>;
let active: Lenis | null = null;

/**
 * Scrolls the page to `element`, leaving room for the sticky header. Goes through Lenis
 * when it is running (so the two never fight), and native smooth scrolling otherwise.
 */
export function scrollToElement(element: HTMLElement, offset = 80) {
  if (active) {
    active.scrollTo(element, { offset: -offset, duration: 1.2 });
    return;
  }
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/** Set by components/smooth-scroll.tsx while Lenis runs. */
export function setActiveLenis(lenis: Lenis | null) {
  active = lenis;
}

/** Scrolls the page to `y` (px from the top), through Lenis when it is running. */
export function scrollToY(y: number) {
  if (active) {
    active.scrollTo(y, { duration: 0.8 });
    return;
  }
  window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}
