import { CalendarPlusIcon, PhoneIcon, type Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { BookLink } from '@/components/contact/book-link';
import { clinicTelHref } from '@/config/site';
import { cx } from '@/lib/cx';
import { useQuickActions } from '@/lib/quick-actions';

type Fab = {
  id: string;
  label: string;
  Icon: Icon;
  tone: string;
  /** Book (nearest booking form, else the booking page), a link (tel:), or an action. */
  book?: boolean;
  href?: string;
  onClick?: () => void;
};

const fabClass = cx(
  'group relative grid size-13 place-items-center rounded-full shadow-lg shadow-elevation/25',
  'transition-transform duration-150 ease-out hover:scale-105 active:scale-95',
  'animate-[fab-in_420ms_var(--ease-out)_both] motion-reduce:animate-none',
);

/** Label that slides out to the left on hover or keyboard focus (pointer devices, md up). */
function FabLabel({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className={cx(
        'pointer-events-none absolute right-full mr-3 hidden rounded-full bg-ink px-3 py-1.5 text-small font-medium whitespace-nowrap text-canvas md:block',
        'translate-x-1 opacity-0 transition-[opacity,translate] duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100',
      )}
    >
      {children}
    </span>
  );
}

/**
 * Right-side floating actions on every page: call and book an appointment. (The chat
 * assistant is its own draggable bubble, components/chat/chat-bubble.tsx.)
 * Book sits lowest, nearest the thumb. Call dials directly once the number is configured,
 * and offers the call back until then.
 */
export function FloatingActions() {
  const show = useQuickActions((s) => s.show);

  const fabs: Fab[] = [
    {
      id: 'call',
      label: clinicTelHref ? 'Call the clinic' : 'Request a call back',
      Icon: PhoneIcon,
      tone: 'bg-highlight text-on-highlight',
      ...(clinicTelHref ? { href: clinicTelHref } : { onClick: () => show('callback') }),
    },
    {
      id: 'book',
      label: 'Book an appointment',
      Icon: CalendarPlusIcon,
      tone: 'bg-brand text-on-brand',
      book: true,
    },
  ];

  return (
    <div
      role="group"
      aria-label="Quick actions"
      style={{ viewTransitionName: 'quick-actions' }}
      className="fixed right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex flex-col items-end gap-3 md:right-5 md:bottom-6"
    >
      {fabs.map(({ id, label, Icon, tone, book, href, onClick }, index) => {
        const style = { animationDelay: `${300 + index * 70}ms` };
        const inner = (
          <>
            <Icon size={24} weight="fill" aria-hidden />
            <FabLabel>{label}</FabLabel>
          </>
        );
        if (book) {
          return (
            <BookLink key={id} aria-label={label} className={cx(fabClass, tone)} style={style}>
              {inner}
            </BookLink>
          );
        }
        return href ? (
          <a key={id} href={href} aria-label={label} className={cx(fabClass, tone)} style={style}>
            {inner}
          </a>
        ) : (
          <button
            key={id}
            type="button"
            aria-label={label}
            onClick={onClick}
            className={cx(fabClass, tone)}
            style={style}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
