import { Link, NavLink, Outlet, ScrollRestoration, useNavigation } from 'react-router';

import logoWebp from '@/assets/brand/logo-mark.webp';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { cx } from '@/lib/cx';
import { useFestival } from '@/lib/festival';
import { useFestiveTheme } from '@/lib/festive-themes';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/design', label: 'Design system' },
];

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

export function RootLayout() {
  useFestiveTheme(useFestival((s) => s.festival));

  return (
    <div className="flex min-h-dvh flex-col">
      <NavigationProgress />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6">
          <Link to="/" viewTransition className="flex items-center gap-2.5" aria-label="Home">
            <img src={logoWebp} alt="" width={36} height={34} className="h-8.5 w-9" />
            <span className="font-display text-body leading-tight font-semibold">
              Quantum
              <span className="block text-caption font-medium tracking-[0.12em] text-ink-muted uppercase">
                Digital Dentistry
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 sm:flex">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end
                viewTransition
                className={({ isActive }) =>
                  cx(
                    'rounded-full px-4 py-2 text-small font-medium transition-colors',
                    isActive ? 'bg-brand-soft text-on-brand-soft' : 'text-ink-muted hover:text-ink',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <ThemeSwitcher className="ml-auto sm:ml-2" />
        </div>
        {/* Phones: links sit under the bar instead of hiding behind a menu (there are only two). */}
        <nav aria-label="Main" className="flex gap-1 px-4 pb-2 sm:hidden">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              viewTransition
              className={({ isActive }) =>
                cx(
                  'flex min-h-11 items-center rounded-full px-4 text-small font-medium',
                  isActive ? 'bg-brand-soft text-on-brand-soft' : 'text-ink-muted',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-small text-ink-muted md:flex-row md:justify-between md:px-6">
          <p>© {new Date().getFullYear()} Quantum Digital Dentistry</p>
          <p>Invisalign · Implants · Laser dentistry · Smile design</p>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
