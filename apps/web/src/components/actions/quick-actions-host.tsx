import { lazy, Suspense, useEffect } from 'react';

import { useQuickActions } from '@/lib/quick-actions';

const loadPanels = () => import('./quick-action-panels');
const QuickActionPanels = lazy(() =>
  loadPanels().then((module) => ({ default: module.QuickActionPanels })),
);

/**
 * Keeps the Book / Call back / Chat panels (and the form validation they need) out of the
 * first download. The chunk is prefetched once the browser is idle, so the first tap
 * still opens instantly, and the panels mount on first use.
 */
export function QuickActionsHost() {
  const used = useQuickActions((s) => s.used);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => void loadPanels(), { timeout: 4000 });
      return () => cancelIdleCallback(handle);
    }
    const timer = setTimeout(() => void loadPanels(), 2500);
    return () => clearTimeout(timer);
  }, []);

  return used ? (
    <Suspense fallback={null}>
      <QuickActionPanels />
    </Suspense>
  ) : null;
}
