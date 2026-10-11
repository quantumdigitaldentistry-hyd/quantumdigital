import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';

import { DepthBackdrop } from '@/components/fx/depth-field';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { treatments } from '@/content/clinic';
import { cx } from '@/lib/cx';
import { useScrollScene } from '@/lib/gsap';
import { vtNames } from '@/lib/transition-names';

/**
 * All of the clinic's treatments, in its own order, as a stack of cards. Each card sticks a
 * little lower than the one before, so they pile up as you scroll. As a card arrives its
 * photo settles out of a slight zoom and its words rise into place; as the next one covers
 * it, it eases back and dims. A counter (beside the heading on desktop, a pill pinned to the
 * bottom on phones) follows the card you're on. Without scripts (or with reduced motion)
 * the cards still stack, just without the motion or the counter.
 */
export function TreatmentShowcase() {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);

  useScrollScene(section, ({ gsap, ScrollTrigger }, element) => {
    // A short lag on the scrub smooths touch scrolling, where Lenis doesn't run.
    const scrub = 0.6;
    const cards = gsap.utils.toArray<HTMLElement>('[data-stack-card]', element);
    cards.forEach((card, index) => {
      gsap.fromTo(
        card.querySelector('[data-stack-photo]'),
        { scale: 1.18, yPercent: -6 },
        {
          scale: 1,
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 35%', scrub },
        },
      );
      gsap.from(card.querySelectorAll('[data-stack-rise]'), {
        opacity: 0,
        y: 24,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 90%', end: 'top 45%', scrub },
      });
      ScrollTrigger.create({
        trigger: card,
        start: 'top 60%',
        onEnter: () => setActive(index),
        onLeaveBack: () => setActive(Math.max(0, index - 1)),
      });

      const next = cards[index + 1];
      if (!next) return;
      const scrollTrigger = { trigger: next, start: 'top bottom', end: 'top 20%', scrub };
      // The card stays opaque (so covered cards never show through); a scrim dims it.
      gsap.to(card.querySelector('[data-stack-inner]'), {
        scale: 0.9,
        ease: 'none',
        scrollTrigger,
      });
      gsap.to(card.querySelector('[data-stack-dim]'), {
        opacity: 0.5,
        ease: 'none',
        scrollTrigger,
      });
    });
    gsap.fromTo(
      element.querySelectorAll('[data-stack-progress]'),
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: element.querySelector('[data-stack-list]'),
          start: 'top 60%',
          end: 'bottom 60%',
          scrub: true,
        },
      },
    );
    setLive(true);
    return () => {
      setLive(false);
      setActive(0);
    };
  });

  const names = treatments.map((treatment) => treatment.name);
  const numbers = treatments.map((_, index) => String(index + 1).padStart(2, '0'));
  const total = String(treatments.length).padStart(2, '0');

  return (
    <section
      ref={section}
      aria-labelledby="treatments-title"
      className="relative isolate bg-canvas"
    >
      <DepthBackdrop density={0.6} />
      <Container className="grid gap-10 py-16 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
          <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
            02 · Treatments
          </p>
          <h2
            id="treatments-title"
            className="heading-3d font-display text-title font-bold text-balance md:text-display"
          >
            Your complete smile destination.
          </h2>
          <p className="max-w-[40ch] text-ink-muted">
            Each treatment is led by a specialist and planned with digital records before anything
            begins.
          </p>
          <Link
            to="/treatments"
            viewTransition
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-line-strong bg-surface px-5 py-3 font-medium transition-colors hover:border-brand hover:text-brand"
          >
            Explore treatments
            <ArrowUpRightIcon
              size={18}
              aria-hidden
              className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
          <div
            aria-hidden
            className={cx(
              'mt-8 hidden max-w-xs flex-col gap-3 transition-opacity duration-500 ease-out lg:flex',
              !live && 'invisible opacity-0',
            )}
          >
            <div className="flex items-baseline gap-2 font-mono">
              <Ticker
                items={numbers}
                index={active}
                className="font-display text-display font-bold text-brand"
              />
              <span className="text-ink-muted">/ {total}</span>
            </div>
            <Ticker
              items={names}
              index={active}
              className="font-display text-heading font-semibold"
            />
            <ProgressBar />
          </div>
        </div>

        <div className="relative">
          <ol data-stack-list className="flex flex-col gap-6">
            {treatments.map((treatment, index) => (
              <li
                key={treatment.slug}
                data-stack-card
                className="sticky top-(--stack-top)"
                style={{ '--stack-top': `${5.5 + index * 0.6}rem` } as CSSProperties}
              >
                <article
                  data-stack-inner
                  className="group relative origin-top overflow-hidden rounded-4xl border border-line bg-surface shadow-xl shadow-elevation/10"
                >
                  <Link
                    to={`/treatments/${treatment.slug}`}
                    viewTransition
                    className="block focus-visible:outline-offset-[-4px]"
                  >
                    <div
                      className="relative aspect-2/1 overflow-hidden"
                      style={{ viewTransitionName: vtNames.treatmentPhoto(treatment.slug) }}
                    >
                      <div data-stack-photo className="size-full will-change-transform">
                        <Photo
                          photo={treatment.photo}
                          sizes="(min-width: 1024px) 40rem, 92vw"
                          className="block size-full"
                          imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>
                      <span
                        className="float-y absolute right-4 -bottom-1 grid size-20 place-items-center rounded-full bg-surface shadow-lg shadow-elevation/20 md:size-24"
                        style={{
                          viewTransitionName: vtNames.treatmentIllustration(treatment.slug),
                        }}
                      >
                        <Photo
                          photo={treatment.illustration}
                          sizes="96px"
                          fit="contain"
                          className="block size-[68%]"
                        />
                      </span>
                      <span className="absolute top-4 left-4 rounded-full bg-surface/85 px-3 py-1 font-mono text-small font-medium backdrop-blur-sm">
                        {numbers[index]} / {total}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5 p-5 md:p-6">
                      <div data-stack-rise className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-title font-bold">{treatment.name}</h3>
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-aqua-soft text-on-aqua-soft transition-transform duration-300 ease-out group-hover:rotate-45">
                          <ArrowUpRightIcon size={20} aria-hidden />
                        </span>
                      </div>
                      <p data-stack-rise className="text-ink-muted">
                        {treatment.summary}
                      </p>
                      <ul data-stack-rise className="hidden flex-wrap gap-2 pt-1 sm:flex">
                        {treatment.highlights.map((item) => (
                          <li
                            key={item}
                            className="rounded-full border border-line px-3 py-1 text-small text-ink-muted"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Link>
                  <div
                    data-stack-dim
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-scrim opacity-0"
                  />
                </article>
              </li>
            ))}
          </ol>
          {/* Phones: a small counter pinned to the bottom while the stack is on screen, between the floating buttons. */}
          <div
            aria-hidden
            className="pointer-events-none sticky bottom-6 z-10 mt-6 flex justify-center lg:hidden"
          >
            <div
              className={cx(
                'flex items-center gap-3 rounded-full border border-line bg-surface/85 py-2 pr-4 pl-3.5 shadow-lg shadow-elevation/15 backdrop-blur-md transition-[opacity,translate] duration-500 ease-out',
                !live && 'invisible translate-y-3 opacity-0',
              )}
            >
              <span className="flex font-mono text-small font-semibold text-brand">
                <Ticker items={numbers} index={active} />
                <span className="text-ink-muted">/{total}</span>
              </span>
              <span className="w-12">
                <ProgressBar />
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * One line of text that rolls to `items[index]`: every item sits in a column and the column
 * slides, so fast scrolling retargets mid-roll instead of restarting. Sized to the longest.
 */
function Ticker({
  items,
  index,
  className,
}: {
  items: string[];
  index: number;
  className?: string;
}) {
  return (
    <span className={cx('relative inline-block h-lh overflow-hidden', className)}>
      <span
        className="flex flex-col transition-transform duration-500 ease-out"
        style={{ transform: `translateY(${(-index * 100) / items.length}%)` }}
      >
        {items.map((item) => (
          <span key={item} className="whitespace-nowrap">
            {item}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Fills as you scroll through the stack (scaled by the scroll scene). */
function ProgressBar() {
  return (
    <span className="block h-0.5 overflow-hidden rounded-full bg-line">
      <span data-stack-progress className="block h-full origin-left rounded-full bg-brand" />
    </span>
  );
}
