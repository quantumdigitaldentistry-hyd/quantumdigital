import {
  ArrowSquareOutIcon,
  BookOpenTextIcon,
  CalendarDotsIcon,
  ImagesIcon,
  ListIcon,
  SignOutIcon,
  SparkleIcon,
  SplitHorizontalIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router';

import { LogoMark } from '@/components/brand/logo';
import { PageLoader } from '@/components/ui/page-loader';
import { cx } from '@/lib/cx';
import { useSiteSettings } from '@/lib/site-settings';

import { useStaffDocument } from './document';
import { backend, canManageTeam, roleLabel, useMe, useSession, type TeamMember } from './session';
import { Notice } from './ui';

const nav: { to: string; label: string; Icon: typeof CalendarDotsIcon; managers?: boolean }[] = [
  { to: '/staff', label: 'Appointments', Icon: CalendarDotsIcon },
  { to: '/staff/festival', label: 'Festival & hours', Icon: SparkleIcon },
  { to: '/staff/articles', label: 'Dental knowledge', Icon: BookOpenTextIcon },
  { to: '/staff/results', label: 'Before & after', Icon: SplitHorizontalIcon },
  { to: '/staff/gallery', label: 'Gallery', Icon: ImagesIcon },
  { to: '/staff/team', label: 'Team', Icon: UsersThreeIcon, managers: true },
  { to: '/staff/account', label: 'My account', Icon: UserCircleIcon },
];

function Shell({ me, children }: { me: TeamMember; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const signOut = async () => {
    await backend?.auth.signOut();
    queryClient.clear();
  };

  const links = nav.filter((item) => !item.managers || canManageTeam(me.role));

  return (
    <div className="min-h-dvh bg-canvas text-ink lg:grid lg:grid-cols-[16rem_1fr]">
      <aside
        className={cx(
          'border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r',
          menuOpen ? 'flex flex-col border-b' : 'border-b lg:border-b-0',
        )}
      >
        <div className="flex items-center justify-between gap-3 p-4">
          <Link to="/staff" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-auto" />
            <span className="font-display leading-tight font-semibold">
              Quantum
              <span className="block text-caption font-medium text-ink-muted">Staff area</span>
            </span>
          </Link>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="staff-nav"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-11 place-items-center rounded-full hover:bg-sunken lg:hidden"
          >
            <ListIcon size={22} aria-hidden />
            <span className="sr-only">Menu</span>
          </button>
        </div>
        <nav
          id="staff-nav"
          aria-label="Staff"
          className={cx('flex-col gap-1 px-3 pb-3 lg:flex lg:flex-1', menuOpen ? 'flex' : 'hidden')}
        >
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/staff'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cx(
                  'flex min-h-11 items-center gap-3 rounded-2xl px-3 text-small font-medium transition-colors',
                  isActive
                    ? 'bg-brand-soft text-on-brand-soft'
                    : 'text-ink-muted hover:bg-sunken hover:text-ink',
                )
              }
            >
              <Icon size={20} weight="duotone" aria-hidden />
              {label}
            </NavLink>
          ))}
          <div className="mt-auto flex flex-col gap-1 border-t border-line pt-3">
            <p className="px-3 text-caption text-ink-muted">
              {me.full_name || me.email}
              <span className="block font-semibold text-ink">{roleLabel[me.role]}</span>
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-small text-ink-muted hover:bg-sunken hover:text-ink"
            >
              <ArrowSquareOutIcon size={20} aria-hidden />
              View website
            </a>
            <button
              type="button"
              onClick={signOut}
              className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-left text-small text-ink-muted hover:bg-sunken hover:text-ink"
            >
              <SignOutIcon size={20} aria-hidden />
              Sign out
            </button>
          </div>
        </nav>
      </aside>
      <main id="main" className="min-w-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}

/**
 * Everything under /staff except sign-in: requires a session AND an active team record.
 * The database enforces the same rules (RLS), so this guard is about a sensible UI, not
 * the security boundary.
 */
export default function StaffLayout() {
  useStaffDocument('Staff');
  useEffect(() => {
    void useSiteSettings.getState().load();
  }, []);
  const session = useSession();
  const me = useMe(session);
  const location = useLocation();

  if (!backend) {
    return (
      <div className="mx-auto max-w-md p-8">
        <Notice tone="error">
          The staff area needs the backend. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
        </Notice>
      </div>
    );
  }
  if (session === undefined || (session && me.isPending))
    return <PageLoader label="Opening the staff area" />;
  if (!session) return <Navigate to="/staff/login" replace state={{ from: location.pathname }} />;
  if (session.user.user_metadata?.must_change_password)
    return <Navigate to="/staff/set-password" replace />;
  if (me.isError) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 p-8">
        <Notice tone="error">
          Couldn’t reach the clinic server. Check the connection and try again.
        </Notice>
        <button
          type="button"
          className="self-start text-small font-semibold text-brand"
          onClick={() => void me.refetch()}
        >
          Try again
        </button>
      </div>
    );
  }
  if (!me.data) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 p-8">
        <Notice tone="error">
          This account isn't on the clinic team, or it has been switched off. Ask a doctor to add
          you.
        </Notice>
        <button
          type="button"
          className="text-small font-semibold text-brand"
          onClick={() => void backend?.auth.signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <Shell me={me.data}>
      <Outlet context={me.data} />
    </Shell>
  );
}
