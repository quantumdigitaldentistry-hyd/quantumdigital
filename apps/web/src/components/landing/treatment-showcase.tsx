import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';

import { DepthBackdrop } from '@/components/fx/depth-field';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { treatments } from '@/content/clinic';
import { useScrollScene } from '@/lib/gsap';
import { vtNames } from '@/lib/transition-names';

/**
 * All of the clinic's treatments, in its own order, as a stack of cards. Each card sticks a little lower than the one
 * before, so they pile up as you scroll; a card eases back and dims as the next one
 * covers it. Without scripts (or with reduced motion) the cards still stack, just
 * without the recede.
 */
export function TreatmentShowcase() {
  const section = useRef<HTMLElement>(null);

  useScrollScene(section, ({ gsap }, element) => {
    const cards = gsap.utils.toArray<HTMLElement>('[data-stack-card]', element);
    cards.slice(0, -1).forEach((card, index) => {
      const next = cards[index + 1];
      if (!next) return;
      const scrollTrigger = { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true };
      // The card stays opaque (so covered cards never show through); a scrim dims it.
      gsap.to(card.querySelector('[data-stack-inner]'), {
        scale: 0.92,
        ease: 'none',
        scrollTrigger,
      });
      gsap.to(card.querySelector('[data-stack-dim]'), {
        opacity: 0.45,
        ease: 'none',
        scrollTrigger,
      });
    });
  });

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
        </div>

        <ol className="flex flex-col gap-6">
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
                    <Photo
                      photo={treatment.photo}
                      sizes="(min-width: 1024px) 40rem, 92vw"
                      className="block size-full"
                      imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <span
                      className="float-y absolute right-4 -bottom-1 grid size-20 place-items-center rounded-full bg-surface shadow-lg shadow-elevation/20 md:size-24"
                      style={{ viewTransitionName: vtNames.treatmentIllustration(treatment.slug) }}
                    >
                      <Photo
                        photo={treatment.illustration}
                        sizes="96px"
                        fit="contain"
                        className="block size-[68%]"
                      />
                    </span>
                    <span className="absolute top-4 left-4 rounded-full bg-surface/85 px-3 py-1 font-mono text-small font-medium backdrop-blur-sm">
                      {String(index + 1).padStart(2, '0')} /{' '}
                      {String(treatments.length).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5 p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-title font-bold">{treatment.name}</h3>
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-aqua-soft text-on-aqua-soft transition-transform duration-300 ease-out group-hover:rotate-45">
                        <ArrowUpRightIcon size={20} aria-hidden />
                      </span>
                    </div>
                    <p className="text-ink-muted">{treatment.summary}</p>
                    <ul className="hidden flex-wrap gap-2 pt-1 sm:flex">
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
      </Container>
    </section>
  );
}
