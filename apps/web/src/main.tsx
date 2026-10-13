import '@fontsource-variable/sora/wght.css';
import '@fontsource-variable/instrument-sans/wght.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import 'lenis/dist/lenis.css';
import './styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, redirect } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { PageLoader } from '@/components/ui/page-loader';
import { RootLayout } from '@/routes/root-layout';
import { RouteError } from '@/routes/route-error';

const staffPage = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
});

// Every page is its own chunk: visitors download only the route they open. The staff
// area is separate (own layout, own chunks), so visitors never download any of it.
const router = createBrowserRouter([
  {
    path: 'staff/login',
    lazy: staffPage(() => import('@/staff/login')),
    HydrateFallback: () => <PageLoader />,
  },
  {
    path: 'staff/set-password',
    lazy: staffPage(() => import('@/staff/set-password')),
    HydrateFallback: () => <PageLoader />,
  },
  {
    path: 'staff',
    lazy: staffPage(() => import('@/staff/layout')),
    HydrateFallback: () => <PageLoader />,
    ErrorBoundary: RouteError,
    children: [
      { index: true, lazy: staffPage(() => import('@/staff/appointments')) },
      { path: 'patients', lazy: staffPage(() => import('@/staff/patients')) },
      { path: 'festival', lazy: staffPage(() => import('@/staff/festival')) },
      { path: 'articles', lazy: staffPage(() => import('@/staff/articles')) },
      { path: 'results', lazy: staffPage(() => import('@/staff/results')) },
      { path: 'gallery', lazy: staffPage(() => import('@/staff/gallery')) },
      { path: 'team', lazy: staffPage(() => import('@/staff/team')) },
      { path: 'account', lazy: staffPage(() => import('@/staff/account')) },
    ],
  },
  {
    Component: RootLayout,
    ErrorBoundary: RouteError,
    // Shown while the first route chunk loads (brand kit Fill loader).
    HydrateFallback: () => <PageLoader />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/routes/home')).default }),
      },
      {
        path: 'treatments',
        lazy: async () => ({ Component: (await import('@/routes/treatments')).default }),
      },
      // Old address: aligners were listed as 'Invisalign provider'.
      { path: 'treatments/invisalign', loader: () => redirect('/treatments/aligners') },
      {
        path: 'treatments/:slug',
        lazy: async () => {
          const page = await import('@/routes/treatment');
          return { Component: page.default, loader: page.loader };
        },
      },
      {
        path: 'about-us',
        lazy: async () => ({ Component: (await import('@/routes/about')).default }),
      },
      {
        path: 'studio',
        lazy: async () => ({ Component: (await import('@/routes/studio')).default }),
      },
      {
        path: 'dental-tourism',
        lazy: async () => ({ Component: (await import('@/routes/dental-tourism')).default }),
      },
      {
        path: 'patient-safety',
        lazy: async () => ({ Component: (await import('@/routes/patient-safety')).default }),
      },
      {
        path: 'dental-knowledge/:slug',
        lazy: async () => ({ Component: (await import('@/routes/article')).default }),
      },
      {
        path: 'dental-knowledge',
        lazy: async () => ({ Component: (await import('@/routes/dental-knowledge')).default }),
      },
      {
        path: 'book-appointment',
        lazy: async () => ({ Component: (await import('@/routes/book-appointment')).default }),
      },
      {
        path: 'contact-us',
        lazy: async () => ({ Component: (await import('@/routes/contact-us')).default }),
      },
      {
        path: 'gallery',
        lazy: async () => ({ Component: (await import('@/routes/gallery')).default }),
      },
      {
        path: 'results',
        lazy: async () => ({ Component: (await import('@/routes/results')).default }),
      },
      {
        path: 'doctors/:slug',
        lazy: async () => {
          const page = await import('@/routes/doctor');
          return { Component: page.default, loader: page.loader };
        },
      },
      {
        path: 'design',
        lazy: async () => ({ Component: (await import('@/routes/design')).default }),
      },
      {
        path: '*',
        ErrorBoundary: RouteError,
        loader: () => {
          throw new Response('', { status: 404 });
        },
      },
    ],
  },
]);

// Clicking quickly between pages starts a new view transition before the last one has
// finished; the browser then rejects the old one with this AbortError. That's expected,
// so it shouldn't surface as an uncaught error.
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason as Error | undefined;
  if (reason?.name === 'AbortError' && /transition was skipped/i.test(reason.message)) {
    event.preventDefault();
  }
});

/*
 * After a deploy, a tab that was already open still references the previous build's code
 * files, which no longer exist. When loading one fails, reload once to pick up the new
 * build instead of showing an error. The flag stops a reload loop if the network is down.
 */
window.addEventListener('vite:preloadError', (event) => {
  const key = 'qdd-reloaded-for-update';
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});
window.addEventListener('load', () => {
  // A successful load clears the flag, so a later deploy can recover the same way.
  window.setTimeout(() => {
    try {
      sessionStorage.removeItem('qdd-reloaded-for-update');
    } catch {
      // ignore
    }
  }, 10_000);
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
