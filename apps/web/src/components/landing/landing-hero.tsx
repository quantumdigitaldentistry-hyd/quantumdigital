import { CalendarPlusIcon, PhoneCallIcon } from '@phosphor-icons/react';
import type { CSSProperties } from 'react';

import { HeroVisual } from '@/components/three/hero-visual';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { cx } from '@/lib/cx';
import { useQuickActions } from '@/lib/quick-actions';

const HEADLINE = 'Implants, aligners and smile design, planned digitally.';

/** Facts from the clinic signage, floating around the 3D tooth. */
const chips = [
  { label: 'Invisalign provider', className: 'left-0 top-[12%] md:-left-4', delay: '0s' },
  // Right-hand chips only from md: on phones they would sit under the floating buttons.
  {
    label: 'Implant center',
    className: 'hidden md:block right-0 top-[30%] md:-right-2',
    delay: '-2s',
  },
  { label: 'Laser dentistry', className: 'left-[4%] bottom-[22%]', delay: '-4s' },
  { label: 'Smile design', className: 'hidden md:block right-[6%] bottom-[8%]', delay: '-1s' },
];

export function LandingHero() {
  const show = useQuickActions((s) => s.show);

  return (
    <section className="relative isolate overflow-hidden bg-linear-to-br from-hero-from to-hero-to text-on-hero">
      {/* Soft light behind the tooth: decorative. */}
      <div
        aria-hidden
        className="absolute top-1/3 right-[-20%] -z-10 size-[70vmax] rounded-full bg-surface/30 blur-3xl md:right-[-10%] md:size-[48vmax]"
      />
      <Container className="grid min-h-[calc(100svh-7rem)] items-center gap-2 pt-10 pb-4 md:grid-cols-[1.2fr_1fr] md:gap-8 md:py-16">
        <div className="flex flex-col gap-6">
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
            <button type="button" className={buttonClass()} onClick={() => show('book')}>
              <CalendarPlusIcon size={20} aria-hidden />
              Book appointment
            </button>
            <button
              type="button"
              className={buttonClass('secondary')}
              onClick={() => show('callback')}
            >
              <PhoneCallIcon size={20} aria-hidden />
              Instant call back
            </button>
          </div>
        </div>

        <div className="hero-exit relative mx-auto w-full max-w-[min(100%,30rem)] md:max-w-none">
          <HeroVisual />
          {chips.map(({ label, className, delay }) => (
            <span
              key={label}
              aria-hidden
              style={{ animationDelay: delay }}
              className={cx(
                'float-y absolute rounded-full border border-surface/60 bg-surface/70 px-3 py-1.5 text-label font-semibold text-ink shadow-lg shadow-elevation/10 backdrop-blur-md md:px-4 md:py-2 md:text-small',
                className,
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </Container>

      <a
        href="#implant-story"
        className="mx-auto mb-6 hidden w-fit flex-col items-center gap-2 text-caption font-medium text-on-hero-muted md:flex"
      >
        Scroll to explore
        <span className="relative h-10 w-px overflow-hidden bg-on-hero/20">
          <span className="absolute inset-x-0 top-0 h-1/3 animate-[cue_1.8s_var(--ease-in-out)_infinite] bg-on-hero motion-reduce:animate-none" />
        </span>
      </a>
    </section>
  );
}
