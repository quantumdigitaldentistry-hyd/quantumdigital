import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

import { buttonClass } from '@/components/ui/button-class';

/**
 * Shown for unknown URLs and for failed route loads. The common real-world failure is a
 * stale tab after a deploy (old chunk names are gone), which a reload fixes.
 */
export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-title font-semibold">
        {notFound ? 'Page not found' : 'This page did not load'}
      </h1>
      <p className="text-ink-muted">
        {notFound
          ? 'The link may be old or mistyped.'
          : 'Check your connection and try again. If the site was just updated, a reload fixes it.'}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {notFound ? null : (
          <button type="button" className={buttonClass()} onClick={() => location.reload()}>
            Reload
          </button>
        )}
        <Link to="/" className={buttonClass(notFound ? 'primary' : 'secondary')}>
          Go to home
        </Link>
      </div>
    </div>
  );
}
