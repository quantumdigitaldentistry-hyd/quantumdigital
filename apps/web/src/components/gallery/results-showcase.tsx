import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';

import { Photo } from '@/components/ui/photo';
import { treatments, type ResultCase } from '@/content/clinic';
import { cx } from '@/lib/cx';

import { BeforeAfter } from './before-after';
import { prefersReducedMotion } from '@/lib/motion';

const treatmentName = (slug: string) =>
  treatments.find((treatment) => treatment.slug === slug)?.name ?? '';

/**
 * Several before/after cases: thumbnail tabs choose the case, the comparison cross-fades
 * in. The tab strip scrolls sideways (swipe, trackpad or shift + wheel), with previous /
 * next buttons either side and arrow keys on the tabs; the chosen tab is kept in view.
 * Every case is marked as a demo until real, consented cases replace them.
 *
 * With `autoPlay` (ms) it moves to the next case on its own, with a bar filling up to
 * the change. It holds while the pointer is over it or focus is inside it, while the tab
 * is hidden, and never runs with reduced motion.
 */
export function ResultsShowcase({
  cases,
  autoPlay,
  className,
}: {
  cases: ResultCase[];
  autoPlay?: number;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [canPlay] = useState(() => !!autoPlay && !prefersReducedMotion());
  const strip = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const moved = useRef(false);
  const playing = canPlay && !held && !hidden && cases.length > 1;

  useEffect(() => {
    if (!canPlay) return;
    const update = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, [canPlay]);

  // Keep the chosen tab in view, scrolling only the strip (never the page).
  useEffect(() => {
    const container = strip.current;
    const tab = tabs.current[active];
    if (!container || !tab || !moved.current) return;
    const left = tab.offsetLeft - (container.clientWidth - tab.offsetWidth) / 2;
    container.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [active]);

  const current = cases[active] ?? cases[0];
  if (!current) return null;

  const go = (index: number, focus = false) => {
    const next = (index + cases.length) % cases.length;
    moved.current = true;
    setActive(next);
    if (focus) tabs.current[next]?.focus({ preventScroll: true });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: cases.length - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    go(target, true);
  };
  const arrow =
    'grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink shadow-sm transition-[background-color,border-color,scale] duration-150 hover:border-brand hover:text-brand active:scale-95';

  return (
    <div
      className={cx('flex flex-col gap-4', className)}
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false);
      }}
    >
      <div key={current.id} className="relative animate-[lightbox-in_420ms_var(--ease-out)_both]">
        <BeforeAfter
          before={current.before ?? current.photo}
          after={current.photo}
          beforeClassName={current.before ? undefined : current.beforeFilter}
          label={`Compare before and after: ${current.title}${current.demo === false ? '' : ' (demo)'}`}
        />
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-2">
          <p className="rounded-2xl bg-scrim/70 px-3 py-2 text-on-scrim backdrop-blur-sm">
            {/* The treatment above the case title, unless they are the same words. */}
            {treatmentName(current.treatment) !== current.title ? (
              <span className="block text-caption opacity-80">
                {treatmentName(current.treatment)}
              </span>
            ) : null}
            <span className="font-display font-semibold">{current.title}</span>
          </p>
          {current.demo === false ? null : (
            <span className="rounded-full bg-highlight px-2.5 py-1 text-label font-semibold text-on-highlight">
              Demo
            </span>
          )}
        </div>
        {canPlay && cases.length > 1 ? (
          // Time to the next case; it freezes while held.
          <span
            aria-hidden
            className="absolute inset-x-6 bottom-1.5 h-1 overflow-hidden rounded-full bg-surface/40"
          >
            {/* The bar finishing is what moves on, so pausing holds both together. */}
            {/* data-loop: held while off screen too, so it never moves on unseen. */}
            <span
              data-loop
              onAnimationEnd={() => go(active + 1)}
              className="block h-full origin-left animate-[autoplay-fill_linear_both] rounded-full bg-surface"
              style={
                {
                  animationDuration: `${autoPlay}ms`,
                  animationPlayState: playing ? 'running' : 'paused',
                } as CSSProperties
              }
            />
          </span>
        ) : null}
      </div>

      {cases.length > 1 ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous case"
            onClick={() => go(active - 1)}
            className={arrow}
          >
            <CaretLeftIcon size={18} weight="bold" aria-hidden />
          </button>
          <div
            ref={strip}
            role="tablist"
            aria-label="Before and after cases"
            onKeyDown={onKeyDown}
            className="flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto scroll-smooth px-3 py-1 [mask-image:linear-gradient(to_right,transparent,black_14px,black_calc(100%-14px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {cases.map((item, index) => {
              const selected = index === active;
              return (
                <button
                  key={item.id}
                  ref={(element) => {
                    tabs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => go(index)}
                  className={cx(
                    'group flex shrink-0 snap-center items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-1.5 text-left transition-colors',
                    selected
                      ? 'border-brand bg-brand-soft text-on-brand-soft'
                      : 'border-line bg-surface text-ink-muted hover:text-ink',
                  )}
                >
                  <span className="size-9 shrink-0 overflow-hidden rounded-full">
                    <Photo photo={item.photo} sizes="40px" className="block size-full" />
                  </span>
                  <span className="text-small font-medium whitespace-nowrap">{item.title}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Next case"
            onClick={() => go(active + 1)}
            className={arrow}
          >
            <CaretRightIcon size={18} weight="bold" aria-hidden />
          </button>
          <span
            aria-live="polite"
            className="hidden shrink-0 text-center font-mono whitespace-nowrap text-small text-ink-muted sm:block"
          >
            {active + 1} / {cases.length}
          </span>
        </div>
      ) : null}
    </div>
  );
}
