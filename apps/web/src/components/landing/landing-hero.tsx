import { ArrowRightIcon, CalendarPlusIcon, PhoneCallIcon } from '@phosphor-icons/react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

import { HeroVisual } from '@/components/three/hero-visual';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { BookLink } from '@/components/contact/book-link';
import { featuredTreatments } from '@/content/clinic';
import { cx } from '@/lib/cx';
import { useQuickActions } from '@/lib/quick-actions';
import { vtNames } from '@/lib/transition-names';

const HEADLINE = 'Your Dream Smile Designed Digitally & Delivered Affordably';

/** Where each treatment chip sits around the 3D logo (md and up). */
const chipPlacement: Record<string, string> = {
  braces: '-left-4 top-[10%]',
  implants: '-right-2 top-[30%]',
  aligners: 'left-[2%] bottom-[22%]',
  'smile-design': 'right-[6%] bottom-[8%]',
};

const chipClass =
  'group inline-flex items-center gap-1.5 rounded-full border border-surface/60 bg-surface/75 px-3.5 py-2 text-label font-semibold text-ink shadow-lg shadow-elevation/15 backdrop-blur-md transition-[background-color,translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-surface hover:shadow-xl md:text-small';

/** A treatment chip: opens the treatment page, its label morphing into the page title. */
function TreatmentChip({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  return (
    <Link to={`/treatments/${slug}`} viewTransition className={cx(chipClass, className)}>
      <span style={{ viewTransitionName: vtNames.treatmentTitle(slug) }}>{name}</span>
      <ArrowRightIcon
        size={14}
        weight="bold"
        aria-hidden
        className="text-brand transition-transform duration-300 group-hover:translate-x-0.5"
      />
    </Link>
  );
}

export function LandingHero() {
  const show = useQuickActions((s) => s.show);

  return (
    <section className="relative isolate overflow-clip bg-linear-to-br from-hero-from to-hero-to text-on-hero">
      {/* Soft light behind the tooth: decorative. */}
      <div
        aria-hidden
        className="absolute top-1/4 right-[-25%] -z-10 size-[80vmax] md:right-[-12%] md:size-[56vmax]"
        style={{
          backgroundImage: 'radial-gradient(closest-side, var(--color-surface), transparent)',
          opacity: 0.45,
        }}
      />
      <Container className="grid min-h-[calc(100svh-7rem)] items-center gap-2 pt-10 pb-4 md:grid-cols-[1.2fr_1fr] md:gap-8 md:py-16">
        <div className="hero-text-scroll flex flex-col gap-6">
          <p className="text-label font-semibold tracking-[0.14em] text-on-hero-muted uppercase">
            Quantum Digital Dentistry
          </p>
          <h1
            className="word-reveal font-display text-[clamp(2.4rem,9vw,4rem)] leading-[1.02] font-bold tracking-[-0.035em] text-balance"
            aria-label={HEADLINE}
          >
            {HEADLINE.split(' ').map((word, index) => (
              <span key={index} aria-hidden style={{ '--i': index } as CSSProperties}>
                {word}&nbsp;
              </span>
            ))}
          </h1>
          <p className="max-w-[46ch] text-body text-on-hero-muted md:text-heading md:font-normal">
            Implant, orthodontic, laser and cosmetic care under one roof, with a specialist leading
            each treatment.
          </p>
          <div className="flex flex-wrap gap-3">
            <BookLink className={buttonClass()}>
              <CalendarPlusIcon size={20} aria-hidden />
              Book appointment
            </BookLink>
            <button
              type="button"
              className={buttonClass('callback')}
              onClick={() => show('callback')}
            >
              <PhoneCallIcon size={20} aria-hidden />
              Instant call back
            </button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[min(100%,30rem)] md:max-w-none">
          <HeroVisual />
          {/* Desktop: chips around the logo. */}
          {featuredTreatments.map(({ slug, name }) => (
            <div key={slug} className={cx('absolute hidden md:block', chipPlacement[slug])}>
              <TreatmentChip slug={slug} name={name} />
            </div>
          ))}
        </div>
        {/* Phones: the same chips in a row under the logo, clear of the floating buttons. */}
        <nav
          aria-label="Treatments"
          className="-mt-2 flex flex-wrap justify-center gap-2 md:hidden"
        >
          {featuredTreatments.map(({ slug, name }) => (
            <TreatmentChip key={slug} slug={slug} name={name} />
          ))}
        </nav>
      </Container>

      <a
        href="#treatments"
        className="mx-auto mb-6 hidden w-fit flex-col items-center gap-2 text-caption font-medium text-on-hero-muted md:flex"
      >
        Scroll to explore
        <span className="relative h-10 w-px overflow-hidden bg-on-hero/20">
          <span
            data-loop
            className="absolute inset-x-0 top-0 h-1/3 animate-[cue_1.8s_var(--ease-in-out)_infinite] bg-on-hero motion-reduce:animate-none"
          />
        </span>
      </a>
    </section>
  );
}
