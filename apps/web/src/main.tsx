import '@fontsource-variable/sora/wght.css';
import '@fontsource-variable/instrument-sans/wght.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import 'lenis/dist/lenis.css';
import './styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { PageLoader } from '@/components/ui/page-loader';
import { RootLayout } from '@/routes/root-layout';
import { RouteError } from '@/routes/route-error';

// Every page is its own chunk: visitors download only the route they open.
const router = createBrowserRouter([
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
      {
        path: 'patient-safety',
        lazy: async () => ({ Component: (await import('@/routes/patient-safety')).default }),
      },
      {
        path: 'dental-knowledge',
        lazy: async () => ({ Component: (await import('@/routes/dental-knowledge')).default }),
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
