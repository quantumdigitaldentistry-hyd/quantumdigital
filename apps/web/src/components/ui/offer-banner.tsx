import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

/** Decorative rangoli-style dot row in the festival accent. Hidden from assistive tech. */
export function FestiveDots({ count = 14, className }: { count?: number; className?: string }) {
  return (
    <span aria-hidden className={cx('flex items-center gap-1.5', className)}>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={cx(
            'rounded-full',
            index % 3 === 1 ? 'size-2 bg-festive-accent' : 'size-1.5 bg-on-festive opacity-60',
          )}
        />
      ))}
    </span>
  );
}

export type OfferBannerProps = {
  /** Festival greeting, e.g. "Happy Deepavali". */
  greeting: string;
  /** What the offer is for, e.g. "Teeth whitening". */
  title: string;
  /** The headline number, kept short: "20% off", "₹999". */
  offer: string;
  /** Validity in plain words, e.g. "Till 15 Nov". */
  validity: string;
  /** Call to action, usually a secondary Button or Link (surface pill: readable on any festival). */
  action?: ReactNode;
  className?: string;
};

/**
 * Festival offer. Colours come from the festive tokens, so the same banner turns saffron
 * for Sankranti or indigo and gold for Deepavali without code changes. All text uses
 * on-festive, which passes AA on both gradient stops.
 */
export function OfferBanner({
  greeting,
  title,
  offer,
  validity,
  action,
  className,
}: OfferBannerProps) {
  return (
    <section
      aria-label={`${greeting}: ${offer} ${title}`}
      className={cx(
        'relative overflow-hidden rounded-container bg-linear-to-br from-festive to-festive-end p-5 text-on-festive md:p-8',
        className,
      )}
    >
      <FestiveDots />
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-label font-medium tracking-[0.08em] uppercase">{greeting}</p>
          <p className="font-display text-display font-bold md:text-display-lg">{offer}</p>
          <p className="font-display text-heading font-semibold">{title}</p>
          <p className="mt-1 text-small">{validity}</p>
        </div>
        {action}
      </div>
    </section>
  );
}
