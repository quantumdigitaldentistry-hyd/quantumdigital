import {
  BooksIcon,
  CaretUpIcon,
  CpuIcon,
  HandHeartIcon,
  type Icon,
  ScalesIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { LogoMark } from '@/components/brand/logo';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { photos, type Photo as PhotoData } from '@/content/photos';
import { cx } from '@/lib/cx';

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
 * and the focused reason in a card underneath; tapping the centre opens all six, with a
 * smooth height change and a staggered fade, and tapping again (or "Show less") closes
 * them. Steps through the reasons on its own while on screen, until the visitor picks
 * one (never with reduced motion).
 */
export function WhyChooseUs() {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [chosen, setChosen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || hovering || chosen || showAll || reducedMotion) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % reasons.length), ADVANCE_MS);
    return () => clearInterval(timer);
  }, [inView, hovering, chosen, showAll, reducedMotion]);

  const pick = (index: number) => {
    setActive(index);
    setChosen(true);
  };

  const closeAll = () => {
    setShowAll(false);
    // The list collapses from below; bring the hub back into view.
    section.current?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

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
        <div
          className="relative hidden aspect-square w-[min(100%,46rem)] lg:block"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
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
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => pick(index)}
                    aria-pressed={on}
                    className={cx(
                      'flex size-34 flex-col items-center justify-center gap-2 rounded-full border-2 p-3 text-center shadow-xl transition-[background-color,color,border-color,scale,box-shadow] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand',
                      on
                        ? 'scale-108 border-brand bg-brand text-on-brand shadow-brand/30'
                        : 'border-line bg-surface text-ink shadow-elevation/10 hover:border-brand',
                    )}
                  >
                    <span
                      className={cx(
                        'grid size-11 place-items-center rounded-full transition-colors duration-300',
                        on ? 'bg-on-brand/15' : 'bg-aqua-soft text-on-aqua-soft',
                      )}
                    >
                      <Icon size={22} weight="duotone" aria-hidden />
                    </span>
                    <span className="font-display text-small leading-tight font-bold text-balance">
                      {title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Phones and tablets: small hub, the focused reason (or all six) below. ── */}
        <div className="flex w-full flex-col items-center gap-6 lg:hidden">
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
              onClick={() => (showAll ? closeAll() : setShowAll(true))}
              aria-expanded={showAll}
              aria-controls="why-all"
              className="group absolute inset-[21%] overflow-hidden rounded-full border-4 border-surface text-on-scrim shadow-2xl shadow-elevation/25 transition-transform duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand active:scale-97"
            >
              <PhotoStack active={active} sizes="(min-width: 768px) 15rem, 13rem" />
              <span aria-hidden className="absolute inset-0 bg-scrim/60" />
              <span className="absolute inset-0 grid place-items-center px-4">
                <HubTitle size="compact">
                  <span className="mt-1.5 rounded-full bg-surface/90 px-2.5 py-0.5 text-caption font-semibold text-ink">
                    {showAll ? 'Tap to close' : 'Tap to see all 6'}
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
                      onClick={() => {
                        pick(index);
                        setShowAll(false);
                      }}
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

          <div className="w-full max-w-xl">
            {/* The focused reason. All six share one cell, so the height never jumps. */}
            <div
              inert={showAll}
              className={cx(
                'grid transition-[grid-template-rows,opacity] duration-500 ease-out',
                showAll ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100',
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="grid p-1" aria-live="polite">
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
            </div>

            {/* All six, opened from the centre of the hub. */}
            <div
              id="why-all"
              inert={!showAll}
              className={cx(
                'grid transition-[grid-template-rows] duration-500 ease-out',
                showAll ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <ol className="flex flex-col gap-3 p-1">
                  {reasons.map(({ title, body, Icon }, index) => (
                    <li
                      key={title}
                      className={cx(
                        'transition-[opacity,translate] duration-500 ease-out',
                        showAll ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
                      )}
                      // Open: one after another. Close: all together.
                      style={{ transitionDelay: showAll ? `${120 + index * 70}ms` : '0ms' }}
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
                  <li
                    className={cx(
                      'flex justify-center pt-1 transition-opacity duration-500 ease-out',
                      showAll ? 'opacity-100' : 'opacity-0',
                    )}
                    style={{ transitionDelay: showAll ? `${120 + reasons.length * 70}ms` : '0ms' }}
                  >
                    <button
                      type="button"
                      onClick={closeAll}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 text-small font-medium transition-colors hover:border-brand hover:text-brand"
                    >
                      <CaretUpIcon size={16} aria-hidden />
                      Show less
                    </button>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
