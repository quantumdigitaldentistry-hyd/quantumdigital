import type { Location, NavigateFunction } from 'react-router';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Animated "back" navigation. React Router animates links (`viewTransition`), but not
 * history pops, so going back wraps navigate(-1) in a view transition ourselves and marks
 * it as a back navigation (`html[data-nav="back"]`) so the CSS plays it in reverse.
 *
 * The transition waits until the previous page has rendered and its scroll position has
 * been restored (RootLayout calls `markNavigated` after every location change).
 */
let resolvePending: (() => void) | null = null;

export function markNavigated() {
  const resolve = resolvePending;
  resolvePending = null;
  if (resolve) requestAnimationFrame(() => resolve());
}

export function goBack(navigate: NavigateFunction, location: Location, fallback: string) {
  // Opened directly (no in-app history): go to the parent page instead of leaving the site.
  const hasHistory = location.key !== 'default';
  const go = () => (hasHistory ? navigate(-1) : navigate(fallback));

  if (!document.startViewTransition || prefersReducedMotion()) {
    go();
    return;
  }
  const root = document.documentElement;
  root.dataset.nav = 'back';
  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        resolvePending = resolve;
        void go();
        // Never hold the page frozen if something goes wrong.
        setTimeout(resolve, 1200);
      }),
  );
  void transition.finished.finally(() => {
    delete root.dataset.nav;
  });
}
