import {
  BooksIcon,
  CpuIcon,
  HandHeartIcon,
  type Icon,
  ScalesIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { LogoMark } from '@/components/brand/logo';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { photos, type Photo as PhotoData } from '@/content/photos';
import { cx } from '@/lib/cx';
import { jumpBy } from '@/lib/scroll';

type Reason = { title: string; body: string; Icon: Icon; photo: PhotoData };

// From the clinic's "Why Choose Us" banner. Photos are the clinic's own where we have one.
const reasons: Reason[] = [
  {
    title: 'Advanced technology',
    body: 'We use the latest technologies like intraoral scanners, digital X-rays and lasers. Digital impressions with intraoral scanners reduce the number of visits needed and make procedures more comfortable, providing faster and more efficient care.',
    Icon: CpuIcon,
    photo: photos.xrayUnitWide,
  },
  {
    title: 'Experienced team',
    body: 'We have a highly qualified and experienced team of doctors who are updated with the latest techniques and are committed to providing quality dental care.',
    Icon: UsersThreeIcon,
    photo: photos.procedure,
  },
  {
    title: 'Evidence based',
    body: 'An evidence-based approach means that we base all our decisions on the most current, high-quality scientific research to provide you with the best possible care.',
    Icon: BooksIcon,
    photo: photos.xray,
  },
  {
    title: 'Personalised care',
    body: 'We focus on your individual needs, preferences and values, providing personalised dental care.',
    Icon: HandHeartIcon,
    photo: photos.consult,
  },
  {
    title: 'Strict sterilisation',
    body: 'We follow strict sterilisation protocols to prevent cross-infections, ensuring the safety and well-being of our patients.',
    Icon: ShieldCheckIcon,
    photo: photos.treatmentRoom,
  },
  {
    title: 'Quality at a fair cost',
    body: 'We provide all these services at affordable prices and at your convenient appointments, making us your friendly neighbourhood dentist.',
    Icon: ScalesIcon,
    photo: photos.receptionLounge,
  },
];

const pad = (value: number) => String(value).padStart(2, '0');
const ADVANCE_MS = 5000;
/** Phones: how long one view takes to fade out before the other fades in. */
const FADE_MS = 260;

/** Position on a ring: `radius` in % of the square, `degrees` clockwise from the right. */
const onRing = (degrees: number, radius: number): CSSProperties => {
  const angle = (degrees * Math.PI) / 180;
  return {
    left: `${50 + radius * Math.cos(angle)}%`,
    top: `${50 + radius * Math.sin(angle)}%`,
  };
};

/**
 * Wide screens: evenly round the ring, starting at the top. Phones: three down each side,
 * leaving the top and bottom of the small hub clear.
 */
const wideAngles = [270, 330, 30, 90, 150, 210];
const compactAngles = [210, 180, 150, 330, 0, 30];

/** The photos for each reason, crossfading to the one in focus. */
function PhotoStack({ active, sizes }: { active: number; sizes: string }) {
  return reasons.map(({ title, photo }, index) => (
    <Photo
      key={title}
      photo={photo}
      sizes={sizes}
      className={cx(
        'absolute inset-0 block size-full transition-opacity duration-700 ease-out',
        index === active ? 'opacity-100' : 'opacity-0',
      )}
    />
  ));
}

/** Logo, "Why choose us" and the clinic name, for the centre of the hub. */
function HubTitle({ size, children }: { size: 'wide' | 'compact'; children?: ReactNode }) {
  return (
    <span className="flex flex-col items-center gap-1 text-center">
      <LogoMark className={cx('h-auto', size === 'wide' ? 'mb-1 w-9' : 'mb-1 w-9 md:w-11')} />
      <span
        aria-hidden
        className={cx(
          'font-display leading-tight font-bold',
          size === 'wide' ? 'text-label tracking-[0.14em] uppercase' : 'text-heading md:text-title',
        )}
      >
        Why choose us
      </span>
      <span
        className={cx(
          'font-medium tracking-wide opacity-90',
          size === 'wide' ? 'text-caption' : 'text-caption md:text-small',
        )}
      >
        Quantum Digital Dentistry
      </span>
      {children}
    </span>
  );
}

/**
 * Why patients choose the clinic, as a hub: "Why choose us" in a centre circle showing the
 * photo for the reason in focus, with the six reasons around it.
 *
 * Wide screens: six round buttons on a ring; the centre shows the focused reason's title
 * and text, so there are no side cards and no empty space. Phones: small icons on the ring
 * and the focused reason in a card underneath. Tapping the centre fades the circle out and
 * the six cards in, one after another, in its place; leaving the section brings the
 * circle back, fading in when the section is next on screen. When it
 * swaps while the visitor is below it, the page is held still so nothing jumps. Steps through the reasons on its own every few seconds while on screen (never with
 * reduced motion). Hovering a reason shows it and holds there while the pointer stays;
 * picking one starts the count again from that reason, so hover and auto-play work
 * together.
 */
export function WhyChooseUs() {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  /** Most of the section is on screen: auto-play runs. */
  const [inView, setInView] = useState(false);
  const [hovering, setHovering] = useState(false);
  /** Phones: the circle, or all six cards in its place. */
  const [view, setViewState] = useState<'circle' | 'cards'>('circle');
  /** Phones: the current view is faded in. */
  const [shown, setShownState] = useState(true);
  // Mirrors of the two above, for the scroll observer's callback.
  const viewNow = useRef<'circle' | 'cards'>('circle');
  const shownNow = useRef(true);
  const setView = (next: 'circle' | 'cards') => {
    viewNow.current = next;
    setViewState(next);
  };
  const setShown = (next: boolean) => {
    shownNow.current = next;
    setShownState(next);
  };
  const swapping = useRef(false);
  const swapTimer = useRef(0);
  /** Section height before an off-screen swap, to hold the page still afterwards. */
  const holdFrom = useRef<number | null>(null);
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.intersectionRatio >= 0.35);
        if (!entry.isIntersecting && viewNow.current === 'cards') {
          // Left the section with the cards open: back to the circle while it's off
          // screen, faded out, ready to fade in on return.
          clearTimeout(swapTimer.current);
          swapping.current = false;
          if (element.getBoundingClientRect().bottom <= 0) {
            // The section is above the screen and about to get shorter: switch off the
            // browser's own scroll anchoring for this swap and hold the page ourselves
            // (in the layout effect below).
            holdFrom.current = element.offsetHeight;
            document.documentElement.style.overflowAnchor = 'none';
          }
          viewNow.current = 'circle';
          setViewState('circle');
          shownNow.current = false;
          setShownState(false);
        } else if (entry.isIntersecting && !shownNow.current && !swapping.current) {
          // Back on screen after leaving: fade the circle in.
          shownNow.current = true;
          setShownState(true);
        }
      },
      { threshold: [0, 0.35] },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      clearTimeout(swapTimer.current);
    };
  }, []);

  // One step at a time: any change of reason (auto or picked) restarts the count.
  useEffect(() => {
    if (!inView || hovering || view === 'cards' || reducedMotion) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % reasons.length), ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [active, inView, hovering, view, reducedMotion]);

  const pick = (index: number) => setActive(index);

  /** Phones: fade the circle out, switch to the cards, then fade them in. */
  const openCards = () => {
    clearTimeout(swapTimer.current);
    if (reducedMotion) {
      setView('cards');
      return;
    }
    swapping.current = true;
    setShown(false);
    swapTimer.current = window.setTimeout(() => {
      setView('cards');
      // Two frames: the cards paint faded out first, so their fade-in runs.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          swapping.current = false;
          setShown(true);
        }),
      );
    }, FADE_MS);
  };

  // After an off-screen swap, before paint: move the page by however much the section
  // shrank, so what's on screen stays exactly where it was.
  useLayoutEffect(() => {
    const element = section.current;
    if (holdFrom.current === null || !element) return;
    jumpBy(element.offsetHeight - holdFrom.current);
    holdFrom.current = null;
    requestAnimationFrame(() => document.documentElement.style.removeProperty('overflow-anchor'));
  }, [view]);

  return (
    <section
      ref={section}
      aria-labelledby="why-title"
      className="relative isolate scroll-mt-16 overflow-clip border-y border-line bg-canvas"
    >
      <h2 id="why-title" className="sr-only">
        Why choose us: Quantum Digital Dentistry
      </h2>
      <Container className="flex flex-col items-center py-14 md:py-24">
        {/* ── Wide screens: six round reasons on a ring around the centre. ── */}
        <div className="relative hidden aspect-square w-[min(100%,42rem)] lg:block">
          <div
            aria-hidden
            className="absolute inset-[2%] rounded-full"
            style={{
              backgroundImage:
                'radial-gradient(closest-side, var(--color-brand-soft), transparent)',
            }}
          />
          {/* Dashed ring through the centres of the six circles; turns slowly. */}
          <div
            aria-hidden
            className="absolute inset-[11%] animate-[spin_80s_linear_infinite] rounded-full border-2 border-dashed border-brand/25 motion-reduce:animate-none"
          />

          {/* Centre: the focused reason over its photo. */}
          <div className="absolute inset-[25%] overflow-hidden rounded-full border-4 border-surface shadow-2xl shadow-elevation/25">
            <PhotoStack active={active} sizes="23rem" />
            <div aria-hidden className="absolute inset-0 bg-scrim/70" />
            <div className="absolute inset-[9%] flex flex-col items-center justify-center gap-3 text-on-scrim">
              <HubTitle size="wide" />
              <div className="grid w-full" aria-live="polite">
                {reasons.map(({ title, body }, index) => (
                  <div
                    key={title}
                    aria-hidden={index !== active}
                    className={cx(
                      'col-start-1 row-start-1 flex flex-col items-center gap-1.5 text-center transition-[opacity,translate] duration-500 ease-out',
                      index === active ? 'opacity-100' : 'translate-y-1.5 opacity-0',
                    )}
                  >
                    <h3 className="font-display text-heading leading-tight font-bold">{title}</h3>
                    <p className="text-caption leading-snug opacity-90">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The six reasons, round, on the ring. */}
          <ul aria-label="Reasons to choose us">
            {reasons.map(({ title, Icon }, index) => {
              const on = index === active;
              return (
                <li
                  key={title}
                  className="absolute -translate-1/2"
                  style={onRing(wideAngles[index]!, 39)}
                >
                  <button
                    type="button"
                    onMouseEnter={() => {
                      setActive(index);
                      setHovering(true);
                    }}
                    onMouseLeave={() => setHovering(false)}
                    onFocus={() => setActive(index)}
                    onClick={() => pick(index)}
                    aria-pressed={on}
                    className={cx(
                      'flex size-28 flex-col items-center justify-center gap-1.5 rounded-full border-2 p-2.5 text-center shadow-xl transition-[background-color,color,border-color,scale,box-shadow] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand',
                      on
                        ? 'scale-108 border-brand bg-brand text-on-brand shadow-brand/30'
                        : 'border-line bg-surface text-ink shadow-elevation/10 hover:border-brand',
                    )}
                  >
                    <span
                      className={cx(
                        'grid size-9 place-items-center rounded-full transition-colors duration-300',
                        on ? 'bg-on-brand/15' : 'bg-aqua-soft text-on-aqua-soft',
                      )}
                    >
                      <Icon size={19} weight="duotone" aria-hidden />
                    </span>
                    <span className="font-display text-caption leading-tight font-bold text-balance">
                      {title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Phones and tablets: the circle, or all six cards in its place. ── */}
        <div className="w-full lg:hidden">
          {view === 'circle' ? (
            <div
              className={cx(
                'flex flex-col items-center gap-6 transition-opacity ease-out',
                shown ? 'opacity-100' : 'opacity-0',
              )}
              style={{ transitionDuration: `${FADE_MS}ms` }}
            >
              <div className="relative aspect-square w-[min(100%,22rem)] md:w-[26rem]">
                <div
                  aria-hidden
                  className="absolute -inset-[6%] rounded-full"
                  style={{
                    backgroundImage:
                      'radial-gradient(closest-side, var(--color-brand-soft), transparent)',
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-[8%] animate-[spin_60s_linear_infinite] rounded-full border-2 border-dashed border-brand/30 motion-reduce:animate-none"
                />

                {/* Centre: tap to see all six. */}
                <button
                  type="button"
                  onClick={openCards}
                  aria-expanded={false}
                  className="group absolute inset-[21%] overflow-hidden rounded-full border-4 border-surface text-on-scrim shadow-2xl shadow-elevation/25 transition-transform duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand active:scale-97"
                >
                  <PhotoStack active={active} sizes="(min-width: 768px) 15rem, 13rem" />
                  <span aria-hidden className="absolute inset-0 bg-scrim/60" />
                  <span className="absolute inset-0 grid place-items-center px-4">
                    <HubTitle size="compact">
                      <span className="mt-1.5 rounded-full bg-surface/90 px-2.5 py-0.5 text-caption font-semibold text-ink">
                        Tap to see all 6
                      </span>
                    </HubTitle>
                  </span>
                </button>

                <ul aria-label="Reasons to choose us">
                  {reasons.map(({ title, Icon }, index) => {
                    const on = index === active;
                    return (
                      <li
                        key={title}
                        className="absolute -translate-1/2"
                        style={onRing(compactAngles[index]!, 42)}
                      >
                        <button
                          type="button"
                          onClick={() => pick(index)}
                          aria-label={title}
                          aria-pressed={on}
                          className={cx(
                            'grid size-12 place-items-center rounded-full border-2 shadow-lg shadow-elevation/15 transition-[background-color,color,border-color,scale] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:size-14',
                            on
                              ? 'scale-115 border-brand bg-brand text-on-brand'
                              : 'border-line bg-surface text-brand hover:border-brand',
                          )}
                        >
                          <Icon size={22} weight="duotone" aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* The focused reason. All six share one cell, so the height never jumps. */}
              <div className="grid w-full max-w-xl" aria-live="polite">
                {reasons.map(({ title, body, Icon }, index) => {
                  const on = index === active;
                  return (
                    <article
                      key={title}
                      aria-hidden={!on}
                      className={cx(
                        'col-start-1 row-start-1 flex flex-col gap-2 rounded-3xl border border-line bg-surface p-5 text-center shadow-lg shadow-elevation/10 transition-[opacity,translate] duration-500 ease-out',
                        on ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
                      )}
                    >
                      <p className="flex items-center justify-center gap-2 font-mono text-caption font-medium text-brand">
                        <Icon size={16} weight="duotone" aria-hidden />
                        {pad(index + 1)} / {pad(reasons.length)}
                      </p>
                      <h3 className="font-display text-heading font-bold">{title}</h3>
                      <p className="text-small text-ink-muted">{body}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
              <div
                className={cx(
                  'mb-2 flex flex-col items-center gap-1 text-center transition-opacity ease-out',
                  shown ? 'opacity-100' : 'opacity-0',
                )}
                style={{ transitionDuration: `${FADE_MS}ms` }}
              >
                <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
                  Why choose us
                </p>
                <p className="font-display text-title font-bold">Quantum Digital Dentistry</p>
              </div>
              <ol className="flex flex-col gap-3">
                {reasons.map(({ title, body, Icon }, index) => (
                  <li
                    key={title}
                    className={cx(
                      'transition-[opacity,translate] duration-500 ease-out',
                      shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
                    )}
                    // In: one after another. Out: all together, quickly.
                    style={{
                      transitionDelay: shown ? `${60 + index * 60}ms` : '0ms',
                      transitionDuration: shown ? undefined : `${FADE_MS}ms`,
                    }}
                  >
                    <article className="flex items-start gap-4 rounded-3xl border border-line bg-surface p-4 shadow-md shadow-elevation/10">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-on-brand">
                        <Icon size={22} weight="duotone" aria-hidden />
                      </span>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-display text-heading font-bold">{title}</h3>
                        <p className="text-small text-ink-muted">{body}</p>
                      </div>
                    </article>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
