import { ArrowRightIcon, CaretDownIcon } from '@phosphor-icons/react';
import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router';

import { Photo } from '@/components/ui/photo';
import type { NavItem, NavLinkItem } from '@/config/site';
import { treatments } from '@/content/clinic';
import { cx } from '@/lib/cx';

const OPEN_DELAY = 80;
const CLOSE_DELAY = 180;

/** Whether the current page belongs to this menu (for the active style on the trigger). */
function useMenuActive(item: NavItem) {
  const { pathname } = useLocation();
  if (item.menu === 'treatments') return pathname.startsWith('/treatments');
  if (Array.isArray(item.menu)) return item.menu.some((link) => link.to === pathname);
  return false;
}

/** Treatments: illustration, name and one-line description, two columns. */
function TreatmentsPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="w-[min(44rem,calc(100vw-3rem))]">
      <ul className="grid grid-cols-2 gap-1">
        {treatments.map((treatment) => (
          <li key={treatment.slug}>
            <Link
              to={`/treatments/${treatment.slug}`}
              viewTransition
              onClick={onNavigate}
              className="group/item flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-sunken focus-visible:bg-sunken"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-aqua-soft transition-transform duration-300 group-hover/item:-rotate-6">
                <Photo
                  photo={treatment.illustration}
                  sizes="48px"
                  fit="contain"
                  className="block size-[68%]"
                />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-display font-semibold">{treatment.name}</span>
                <span className="truncate text-small text-ink-muted">{treatment.menuLine}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-line px-3 pt-3">
        <Link
          to="/treatments"
          viewTransition
          onClick={onNavigate}
          className="group/all inline-flex items-center gap-2 text-small font-semibold text-brand"
        >
          View all treatments
          <ArrowRightIcon
            size={16}
            aria-hidden
            className="transition-transform duration-300 group-hover/all:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}

/** A simple list of links with icons and one-line descriptions. */
function LinksPanel({ links, onNavigate }: { links: NavLinkItem[]; onNavigate: () => void }) {
  return (
    <ul className="flex w-72 flex-col gap-1">
      {links.map(({ to, label, description, Icon }) => (
        <li key={to}>
          <Link
            to={to}
            viewTransition
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-sunken focus-visible:bg-sunken"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-on-brand-soft">
              <Icon size={20} weight="duotone" aria-hidden />
            </span>
            <span className="flex flex-col">
              <span className="font-medium">{label}</span>
              <span className="text-small text-ink-muted">{description}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Desktop dropdown: opens on hover (with small delays so it doesn't flicker), on click or
 * tap, and from the keyboard (Enter/Space on the trigger). Escape or moving focus away
 * closes it. The trigger is a button with aria-expanded (disclosure pattern).
 */
export function NavMenu({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const active = useMenuActive(item);

  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };
  const close = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      close();
      trigger.current?.focus();
    }
  };

  return (
    <div
      className="relative"
      onPointerEnter={(event) => event.pointerType === 'mouse' && schedule(true, OPEN_DELAY)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && schedule(false, CLOSE_DELAY)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(event) => {
          window.clearTimeout(timer.current);
          // With a mouse, hovering has usually opened the menu already, so a click
          // shouldn't close it again. Touch and keyboard (pointerType '') toggle.
          if ((event.nativeEvent as PointerEvent).pointerType === 'mouse') setOpen(true);
          else setOpen((current) => !current);
        }}
        className={cx(
          'flex items-center gap-1 rounded-full px-3.5 py-2 text-small font-medium whitespace-nowrap transition-colors',
          active || open ? 'bg-brand-soft text-on-brand-soft' : 'text-ink-muted hover:text-ink',
        )}
      >
        {item.label}
        <CaretDownIcon
          size={14}
          weight="bold"
          aria-hidden
          className={cx('transition-transform duration-300', open && 'rotate-180')}
        />
      </button>
      {/* Positioning wrapper (centred under the trigger); the panel inside animates. */}
      <div
        id={panelId}
        className={cx(
          'absolute top-full left-1/2 z-50 -translate-x-1/2 pt-3',
          !open && 'pointer-events-none',
        )}
      >
        <div
          className={cx(
            'origin-top rounded-3xl border border-line bg-surface/95 p-2 shadow-2xl shadow-elevation/20 backdrop-blur-xl transition-[opacity,translate,scale,visibility] duration-200 ease-out',
            open
              ? 'visible translate-y-0 scale-100 opacity-100'
              : 'invisible -translate-y-1 scale-[0.98] opacity-0',
          )}
        >
          {item.menu === 'treatments' ? (
            <TreatmentsPanel onNavigate={close} />
          ) : Array.isArray(item.menu) ? (
            <LinksPanel links={item.menu} onNavigate={close} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Phone menu: the same groups as expandable lists. */
export function MobileMenuGroup({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const links: { to: string; label: string; detail: string }[] =
    item.menu === 'treatments'
      ? [
          ...treatments.map((treatment) => ({
            to: `/treatments/${treatment.slug}`,
            label: treatment.name,
            detail: treatment.menuLine,
          })),
          { to: '/treatments', label: 'All treatments', detail: 'Overview' },
        ]
      : Array.isArray(item.menu)
        ? item.menu.map((link) => ({ to: link.to, label: link.label, detail: link.description }))
        : [];
  return (
    <ul className="flex flex-col gap-0.5 border-l-2 border-line pl-3">
      {links.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            viewTransition
            onClick={onNavigate}
            className="flex min-h-11 flex-col justify-center rounded-control px-3 py-1.5 hover:bg-sunken"
          >
            <span className="font-medium">{link.label}</span>
            <span className="text-caption text-ink-muted">{link.detail}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
