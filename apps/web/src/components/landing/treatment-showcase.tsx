import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { DepthBackdrop } from '@/components/fx/depth-field';
import { Reveal } from '@/components/reveal';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { treatments } from '@/content/clinic';
import { cx } from '@/lib/cx';
import { vtNames } from '@/lib/transition-names';

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * All of the clinic's treatments as one swipeable row. Native scroll-snap does the work:
 * swipe on phones, trackpad or the arrow buttons on desktop, keyboard via Tab. Each card
 * eases up to full size as it slides into view (`.slide-card`, a scroll-driven animation
 * on the row itself, so no script runs per frame). A bar under the row shows how far
 * along you are.
 */
export function TreatmentShowcase() {
  const track = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const row = track.current;
    if (!row) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = row.scrollWidth - row.clientWidth;
      const progress = max > 0 ? row.scrollLeft / max : 1;
      // Never below one card's share, so the bar is visible before any scrolling.
      const shown = Math.max(progress, 1 / treatments.length);
      if (bar.current) bar.current.style.transform = `scaleX(${shown})`;
      const start = row.scrollLeft < 8;
      const end = row.scrollLeft > max - 8;
      setEdges((current) =>
        current.start === start && current.end === end ? current : { start, end },
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    row.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      row.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /** One card's width (plus the gap) per press. */
  const step = (direction: 1 | -1) => {
    const row = track.current;
    const card = row?.querySelector('li');
    if (!row || !card) return;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollBy({
      left: direction * (card.offsetWidth + gap),
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  const arrow =
    'grid size-12 place-items-center rounded-full border border-line-strong bg-surface text-ink shadow-sm transition-[border-color,color,opacity,scale] duration-150 ease-out hover:border-brand hover:text-brand active:scale-95 disabled:pointer-events-none disabled:opacity-35';

  return (
    <section
      aria-labelledby="treatments-title"
      className="relative isolate overflow-hidden bg-canvas"
    >
      <DepthBackdrop density={0.6} />
      <Container className="flex flex-col gap-6 pt-16 md:flex-row md:items-end md:justify-between md:pt-24">
        <Reveal className="flex max-w-xl flex-col gap-3">
          <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
            02 · Treatments
          </p>
          <h2
            id="treatments-title"
            className="heading-3d font-display text-title font-bold text-balance md:text-display"
          >
            Your complete smile destination.
          </h2>
          <p className="text-ink-muted">
            Each treatment is led by a specialist and planned with digital records before anything
            begins.
          </p>
        </Reveal>
        <div className="flex items-center gap-3">
          <Link
            to="/treatments"
            viewTransition
            className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong bg-surface px-5 font-medium transition-colors hover:border-brand hover:text-brand"
          >
            All treatments
            <ArrowUpRightIcon
              size={18}
              aria-hidden
              className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              aria-label="Previous treatments"
              aria-controls="treatment-row"
              disabled={edges.start}
              onClick={() => step(-1)}
              className={arrow}
            >
              <ArrowLeftIcon size={20} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="More treatments"
              aria-controls="treatment-row"
              disabled={edges.end}
              onClick={() => step(1)}
              className={arrow}
            >
              <ArrowRightIcon size={20} aria-hidden />
            </button>
          </div>
        </div>
      </Container>

      <ol
        ref={track}
        id="treatment-row"
        aria-label="Treatments"
        className={cx(
          'treatment-row mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pt-2 pb-6 md:gap-6',
          // Line the first card up with the page column, and let the last one reach the edge.
          'scroll-px-(--row-inset) px-(--row-inset) [--row-inset:1rem] md:[--row-inset:max(1.5rem,calc((100vw-72rem)/2+1.5rem))]',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {treatments.map((treatment, index) => (
          <li
            key={treatment.slug}
            className="slide-card w-[78vw] max-w-[20rem] shrink-0 snap-start sm:w-[44vw] sm:max-w-sm lg:w-92"
          >
            {/*
              Phones: a tall photo card, words over a dark gradient (speciality on top, name
              and "Know more" at the bottom). From md: photo above, words below.
            */}
            <article className="group relative h-[28rem] overflow-hidden rounded-4xl border border-line bg-scrim shadow-lg shadow-elevation/15 transition-[translate,box-shadow] duration-300 ease-out md:h-full md:bg-surface md:hover:-translate-y-1 md:hover:shadow-xl">
              <Link
                to={`/treatments/${treatment.slug}`}
                viewTransition
                className="flex h-full flex-col focus-visible:-outline-offset-4"
              >
                <div
                  className="absolute inset-0 overflow-hidden md:relative md:inset-auto md:aspect-4/3"
                  style={{ viewTransitionName: vtNames.treatmentPhoto(treatment.slug) }}
                >
                  <Photo
                    photo={treatment.photo}
                    sizes="(min-width: 1024px) 23rem, (min-width: 640px) 44vw, 78vw"
                    className="block size-full"
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-scrim via-scrim/45 to-scrim/25 md:hidden"
                  />
                  <span className="absolute top-4 left-4 hidden rounded-full bg-surface/85 px-3 py-1 font-mono text-small font-medium backdrop-blur-sm md:block">
                    {pad(index + 1)} / {pad(treatments.length)}
                  </span>
                  <span
                    className="absolute right-4 -bottom-1 hidden size-18 place-items-center rounded-full bg-surface shadow-lg shadow-elevation/20 md:grid"
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

                {/* Phones only: speciality label and number over the photo. */}
                <div className="relative flex items-center justify-between p-5 text-on-scrim md:hidden">
                  <span className="text-label font-semibold tracking-[0.18em] uppercase opacity-90">
                    {treatment.ledBy ?? 'General dentistry'}
                  </span>
                  <span className="font-mono text-small opacity-80">
                    {pad(index + 1)}/{pad(treatments.length)}
                  </span>
                </div>

                <div className="relative mt-auto flex flex-col gap-2 p-5 text-on-scrim md:mt-0 md:flex-1 md:text-ink">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-title font-bold text-balance md:text-heading">
                      {treatment.name}
                    </h3>
                    <span className="hidden size-10 shrink-0 place-items-center rounded-full bg-aqua-soft text-on-aqua-soft transition-transform duration-300 ease-out group-hover:rotate-45 md:grid">
                      <ArrowUpRightIcon size={18} aria-hidden />
                    </span>
                  </div>
                  <p className="text-small opacity-90 md:text-ink-muted md:opacity-100">
                    {treatment.summary}
                  </p>
                  <span className="mt-3 flex items-center gap-3 font-semibold md:hidden">
                    <span className="grid size-12 place-items-center rounded-full bg-surface text-ink transition-transform duration-150 ease-out group-active:scale-95">
                      <ArrowRightIcon size={20} aria-hidden />
                    </span>
                    Know more
                  </span>
                </div>
              </Link>
            </article>
          </li>
        ))}
      </ol>

      <Container className="pb-16 md:pb-24">
        <span aria-hidden className="block h-1 overflow-hidden rounded-full bg-line">
          <span
            ref={bar}
            className="block h-full origin-left rounded-full bg-brand transition-transform duration-150 ease-out"
            style={{ transform: `scaleX(${1 / treatments.length})` }}
          />
        </span>
      </Container>
    </section>
  );
}
