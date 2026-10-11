import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router';

import { QuickActionsHost } from '@/components/actions/quick-actions-host';
import { FestivalLayer } from '@/components/brand/festival-experience';
import { ChatBubble } from '@/components/chat/chat-bubble';
import { FloatingActions } from '@/components/layout/floating-actions';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { TopBar } from '@/components/layout/top-bar';
import { SmoothScroll } from '@/components/smooth-scroll';
import { useFestivalSync } from '@/lib/active-festival';
import { cx } from '@/lib/cx';
import { useFestival } from '@/lib/festival';
import { useFestiveTheme } from '@/lib/festive-themes';
import { markNavigated } from '@/lib/navigation';

/** Thin bar while a lazy route is loading, so navigation always feels acknowledged. */
function NavigationProgress() {
  const busy = useNavigation().state !== 'idle';
  return (
    <div
      aria-hidden
      className={cx(
        'fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand transition-[transform,opacity] duration-500 ease-out',
        busy ? 'scale-x-75 opacity-100' : 'scale-x-100 opacity-0',
      )}
    />
  );
}

/**
 * Every page: contact bar, sticky navigation, the page, footer, and the floating
 * Book / Call / Chat actions with their panels.
 */
export function RootLayout() {
  useFestivalSync();
  useFestiveTheme(useFestival((s) => s.festival));
  const location = useLocation();
  // Lets an animated "back" finish once the previous page is rendered and scrolled.
  useEffect(() => markNavigated(), [location.key]);

  return (
    <div className="flex min-h-dvh flex-col">
      <NavigationProgress />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <TopBar />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingActions />
      <ChatBubble />
      <FestivalLayer />
      <QuickActionsHost />
      <SmoothScroll />
      {/*
        One saved position per history entry, so Back returns to the exact spot. Fresh page
        loads all share the key "default", so those fall back to the path.
      */}
      <ScrollRestoration
        getKey={(entry) => (entry.key === 'default' ? entry.pathname : entry.key)}
      />
    </div>
  );
}
