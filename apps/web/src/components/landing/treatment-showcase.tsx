import { ArrowUpRightIcon } from '@phosphor-icons/react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';

import { DepthBackdrop } from '@/components/fx/depth-field';
import { Reveal } from '@/components/reveal';
import { RevealWords } from '@/components/reveal-words';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { treatments } from '@/content/clinic';
import { vtNames } from '@/lib/transition-names';

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * All of the clinic's treatments as a grid of cards: three to a row on wide screens, two
 * on tablets, one on phones, with a short last row centred. Photo above, name and
 * summary below; each card opens its treatment page. Cards rise into place as they
 * scroll in (.card-rise in styles.css).
 */
export function TreatmentShowcase() {
  return (
    <section
      id="treatments"
      aria-labelledby="treatments-title"
      className="relative isolate scroll-mt-16 overflow-clip bg-canvas"
    >
      <DepthBackdrop density={0.6} />
      <Container className="flex flex-col gap-10 py-16 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="flex max-w-xl flex-col gap-3">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              01 · Treatments
            </p>
            <h2
              id="treatments-title"
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              <RevealWords text={'Your complete smile destination.'} />
            </h2>
            <p className="text-ink-muted">
              Each treatment is led by a specialist and planned with digital records before anything
              begins.
            </p>
          </Reveal>
          <Link
            to="/treatments"
            viewTransition
            className="group inline-flex min-h-12 w-fit items-center gap-2 rounded-full border border-line-strong bg-surface px-5 font-medium transition-colors hover:border-brand hover:text-brand"
          >
            All treatments
            <ArrowUpRightIcon
              size={18}
              aria-hidden
              className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {/* A wrapping row, not a grid, so a short last row sits in the centre. */}
        <ol aria-label="Treatments" className="flex flex-wrap justify-center gap-5 md:gap-6">
          {treatments.map((treatment, index) => (
            <li
              key={treatment.slug}
              // Each column starts a little later, so a row rises left to right.
              className="card-rise w-full sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
              style={{ '--reveal-start': `${(index % 3) * 8}%` } as CSSProperties}
            >
              <article className="group relative h-full overflow-hidden rounded-4xl border border-line bg-surface shadow-lg shadow-elevation/15 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
                <Link
                  to={`/treatments/${treatment.slug}`}
                  viewTransition
                  className="flex h-full flex-col focus-visible:-outline-offset-4"
                >
                  <div
                    className="relative aspect-4/3 overflow-hidden"
                    style={{ viewTransitionName: vtNames.treatmentPhoto(treatment.slug) }}
                  >
                    <Photo
                      photo={treatment.photo}
                      sizes="(min-width: 1024px) 23rem, (min-width: 640px) 46vw, 92vw"
                      className="block size-full"
                      imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-surface/85 px-3 py-1 font-mono text-small font-medium backdrop-blur-sm">
                      {pad(index + 1)} / {pad(treatments.length)}
                    </span>
                    <span
                      className="absolute right-4 -bottom-1 grid size-18 place-items-center rounded-full bg-surface shadow-lg shadow-elevation/20"
                      style={{ viewTransitionName: vtNames.treatmentIllustration(treatment.slug) }}
                    >
                      <Photo
                        photo={treatment.illustration}
                        sizes="72px"
                        fit="contain"
                        className="block size-[68%]"
                      />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-heading font-bold text-balance">
                        {treatment.name}
                      </h3>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-aqua-soft text-on-aqua-soft transition-transform duration-300 ease-out group-hover:rotate-45">
                        <ArrowUpRightIcon size={18} aria-hidden />
                      </span>
                    </div>
                    <p className="text-small text-ink-muted">{treatment.summary}</p>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
