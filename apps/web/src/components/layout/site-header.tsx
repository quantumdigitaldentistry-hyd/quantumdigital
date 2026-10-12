import { ListIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router';

import { Logo } from '@/components/brand/logo';
import { ContactOptions } from '@/components/contact/contact-options';
import { FestivalMedallion } from '@/components/brand/festival-experience';
import { PhoneLink } from '@/components/contact/phone-link';
import { SocialLinks } from '@/components/contact/social-links';
import { AccordionItem } from '@/components/ui/accordion';
import { Container } from '@/components/ui/container';
import { Dialog } from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { navItems } from '@/config/site';
import { cx } from '@/lib/cx';

import { MobileMenuGroup, NavMenu } from './nav-menu';

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
        {/* Festival deity/symbol medallion: opens the greeting and offer. */}
        <FestivalMedallion />

        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const { to, label } = item;
            if (item.menu) return <NavMenu key={to} item={item} />;
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                viewTransition
                className={({ isActive }) =>
                  cx(
                    'rounded-full px-2.5 py-2 text-small font-medium whitespace-nowrap xl:px-3.5 transition-colors',
                    isActive ? 'bg-brand-soft text-on-brand-soft' : 'text-ink-muted hover:text-ink',
                  )
                }
              >
                {label}
              </NavLink>
            );
          })}
        </nav>
        {/* Wrapper owns visibility: the switcher sets its own display. */}
        <div className="ml-2 hidden lg:block">
          <ThemeSwitcher />
        </div>
        {/* Team entry: looks like a decorative dot on purpose. Security is the sign-in and
            the database rules, not this; it just keeps the public menu uncluttered. */}
        <Link
          to="/staff/login"
          aria-label="Team sign in"
          className="ml-1 hidden size-6 place-items-center rounded-full lg:grid"
        >
          <span className="size-1.5 rounded-full bg-line-strong/70 transition-colors hover:bg-brand" />
        </Link>

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
            {navItems.map((item) => {
              const { to, label, Icon } = item;
              if (item.menu) {
                return (
                  <li key={to}>
                    <AccordionItem
                      variant="plain"
                      title={
                        <span className="flex items-center gap-3">
                          <Icon size={22} aria-hidden />
                          {label}
                        </span>
                      }
                    >
                      <MobileMenuGroup item={item} onNavigate={closeMenu} />
                    </AccordionItem>
                  </li>
                );
              }
              return (
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
              );
            })}
          </ul>
        </nav>
        <div className="flex flex-col gap-4 border-t border-line pt-5">
          <PhoneLink className="text-brand" />
          <ContactOptions />
          <SocialLinks className="-ml-2.5 text-brand" />
          <div className="flex items-center justify-between">
            <ThemeSwitcher />
            <Link
              to="/staff/login"
              aria-label="Team sign in"
              onClick={() => setMenuOpen(false)}
              className="grid size-8 place-items-center rounded-full"
            >
              <span className="size-1.5 rounded-full bg-line-strong/70" />
            </Link>
          </div>
        </div>
      </Dialog>
    </header>
  );
}
