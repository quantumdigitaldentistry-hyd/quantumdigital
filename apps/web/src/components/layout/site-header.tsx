import { ListIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router';

import { Logo } from '@/components/brand/logo';
import { ContactOptions } from '@/components/contact/contact-options';
import { PhoneLink } from '@/components/contact/phone-link';
import { SocialLinks } from '@/components/contact/social-links';
import { Container } from '@/components/ui/container';
import { Dialog } from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { navItems } from '@/config/site';
import { cx } from '@/lib/cx';

/** Inline links from lg up (five links need the room); a menu drawer below that. */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      // Named so page transitions leave the header in place.
      style={{ viewTransitionName: 'site-header' }}
      className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur-md"
    >
      <Container className="flex h-16 items-center gap-3">
        <Link to="/" viewTransition aria-label="Quantum Digital Dentistry, home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              viewTransition
              className={({ isActive }) =>
                cx(
                  'rounded-full px-3.5 py-2 text-small font-medium whitespace-nowrap transition-colors',
                  isActive ? 'bg-brand-soft text-on-brand-soft' : 'text-ink-muted hover:text-ink',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        {/* Wrapper owns visibility: the switcher sets its own display. */}
        <div className="ml-2 hidden lg:block">
          <ThemeSwitcher />
        </div>

        <IconButton
          label="Open menu"
          variant="outline"
          className="ml-auto lg:hidden"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <ListIcon size={22} aria-hidden />
        </IconButton>
      </Container>

      <Dialog open={menuOpen} onClose={closeMenu} title="Menu" variant="drawer">
        <nav aria-label="Main">
          <ul className="flex flex-col gap-1">
            {navItems.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  viewTransition
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cx(
                      'flex min-h-12 items-center gap-3 rounded-control px-3 font-medium transition-colors',
                      isActive ? 'bg-brand-soft text-on-brand-soft' : 'text-ink hover:bg-sunken',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={22} weight={isActive ? 'fill' : 'regular'} aria-hidden />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-4 border-t border-line pt-5">
          <PhoneLink className="text-brand" />
          <ContactOptions />
          <SocialLinks className="-ml-2.5 text-brand" />
          <ThemeSwitcher className="self-start" />
        </div>
      </Dialog>
    </header>
  );
}
