import { PlusIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

/**
 * Disclosure built on <details>/<summary>: keyboard and screen-reader support for free,
 * and it works without JavaScript. Items sharing a `group` name behave as an exclusive
 * accordion (opening one closes the others). Opening animates its height where the
 * browser supports it (`.accordion` in styles.css); elsewhere it simply opens.
 */
export function AccordionItem({
  title,
  children,
  group,
  defaultOpen = false,
  className,
  variant = 'card',
}: {
  title: ReactNode;
  children: ReactNode;
  /** Same name on several items = only one open at a time. */
  group?: string;
  defaultOpen?: boolean;
  className?: string;
  /** card: bordered FAQ row. plain: menu groups. */
  variant?: 'card' | 'plain';
}) {
  return (
    <details
      name={group}
      open={defaultOpen}
      className={cx(
        'accordion group/acc',
        variant === 'card' &&
          'rounded-container border border-line bg-surface transition-colors open:border-brand/40',
        className,
      )}
    >
      <summary
        className={cx(
          'flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden',
          variant === 'card' ? 'min-h-16 px-5 py-4 md:px-6' : 'min-h-12 px-3',
        )}
      >
        <span
          className={cx(
            'font-medium',
            variant === 'card' && 'font-display text-body font-semibold md:text-heading',
          )}
        >
          {title}
        </span>
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-on-brand-soft transition-transform duration-300 ease-out group-open/acc:rotate-45"
        >
          <PlusIcon size={16} weight="bold" />
        </span>
      </summary>
      <div className={variant === 'card' ? 'px-5 pb-5 md:px-6' : 'px-3 pb-2'}>{children}</div>
    </details>
  );
}

/** A list of accordion items, spaced for FAQs. */
export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('flex flex-col gap-3', className)}>{children}</div>;
}
