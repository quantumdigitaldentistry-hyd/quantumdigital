import {
  BooksIcon,
  CpuIcon,
  HandHeartIcon,
  type Icon,
  ScalesIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

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

/**
 * Where each reason's icon sits on the ring, in degrees clockwise from the right. The
 * first three run down the left side and the last three down the right, so on wide
 * screens each icon lines up with its card in the column beside the hub.
 */
const angles = [210, 180, 150, 330, 0, 30];
const ringRadius = 42; // % of the hub, matching the ring at inset 8%.

const pad = (value: number) => String(value).padStart(2, '0');
const ADVANCE_MS = 5000;

/**
 * Why patients choose the clinic, as a hub: "Why choose us" in a circle at the centre,
 * showing the photo for the reason in focus, with the six reasons as icons on a ring
 * around it. Wide screens list the reasons in two columns either side of the hub; phones
 * show one reason at a time under the hub, picked by tapping its icon, so the section
 * stays short. Steps through the reasons on its own while on screen, until the visitor
 * picks one (never with reduced motion).
 */
export function WhyChooseUs() {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [chosen, setChosen] = useState(false);
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
    if (!inView || hovering || chosen || reducedMotion) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % reasons.length), ADVANCE_MS);
    return () => clearInterval(timer);
  }, [inView, hovering, chosen, reducedMotion]);

  const pick = (index: number) => {
    setActive(index);
    setChosen(true);
  };

  const column = (from: number, side: 'left' | 'right') => (
    <ul
      className="hidden flex-col gap-4 lg:flex"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {reasons.slice(from, from + 3).map(({ title, body, Icon }, offset) => {
        const index = from + offset;
        const on = index === active;
        return (
          <li key={title}>
            <button
              type="button"
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => pick(index)}
              aria-pressed={on}
              className={cx(
                'flex w-full items-start gap-4 rounded-3xl border p-5 text-left transition-[background-color,border-color,box-shadow,translate] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-brand',
                side === 'left' && 'flex-row-reverse',
                on
                  ? 'border-brand bg-brand-soft shadow-lg shadow-elevation/10'
                  : 'border-line bg-surface hover:border-aqua',
                on && (side === 'left' ? '-translate-x-1' : 'translate-x-1'),
              )}
            >
              <span
                className={cx(
                  'grid size-11 shrink-0 place-items-center rounded-2xl transition-colors duration-300',
                  on ? 'bg-brand text-on-brand' : 'bg-aqua-soft text-on-aqua-soft',
                )}
              >
                <Icon size={22} weight="duotone" aria-hidden />
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-heading font-bold">{title}</span>
                <span className="text-small text-ink-muted">{body}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section
      ref={section}
      aria-labelledby="why-title"
      className="relative isolate overflow-clip border-y border-line bg-canvas"
    >
      <Container className="flex flex-col items-center gap-6 py-14 md:py-24 lg:grid lg:max-w-7xl lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8">
        {column(0, 'left')}

        {/* The hub. */}
        <div className="relative aspect-square w-[min(100%,22rem)] shrink-0 md:w-[26rem] lg:w-[22rem] xl:w-[26rem]">
          {/* Soft glow, and a slowly turning dashed ring (decoration only). */}
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

          {/* Centre: the photo for the reason in focus, under the title. */}
          <div className="absolute inset-[21%] overflow-hidden rounded-full border-4 border-surface shadow-2xl shadow-elevation/25">
            {reasons.map(({ title, photo }, index) => (
              <Photo
                key={title}
                photo={photo}
                sizes="(min-width: 1280px) 16rem, (min-width: 768px) 15rem, 13rem"
                className={cx(
                  'absolute inset-0 block size-full transition-opacity duration-700 ease-out',
                  index === active ? 'opacity-100' : 'opacity-0',
                )}
              />
            ))}
            <div aria-hidden className="absolute inset-0 bg-scrim/60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center text-on-scrim">
              <LogoMark className="mb-1 h-auto w-9 md:w-11" />
              <h2
                id="why-title"
                className="font-display text-heading leading-tight font-bold md:text-title"
              >
                Why choose us
              </h2>
              <p className="text-caption font-medium tracking-wide opacity-90 md:text-small">
                Quantum Digital Dentistry
              </p>
            </div>
          </div>

          {/* The six reasons on the ring. */}
          <ul aria-label="Reasons to choose us">
            {reasons.map(({ title, Icon }, index) => {
              const angle = (angles[index]! * Math.PI) / 180;
              const on = index === active;
              return (
                <li
                  key={title}
                  className="absolute -translate-1/2"
                  style={
                    {
                      left: `${50 + ringRadius * Math.cos(angle)}%`,
                      top: `${50 + ringRadius * Math.sin(angle)}%`,
                    } as CSSProperties
                  }
                >
                  <button
                    type="button"
                    onClick={() => pick(index)}
                    onMouseEnter={() => setActive(index)}
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

        {column(3, 'right')}

        {/* Phones and tablets: the reason in focus, under the hub. All six share one grid
            cell, so the panel keeps the height of the longest and nothing jumps. */}
        <div className="grid w-full max-w-xl lg:hidden" aria-live="polite">
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
      </Container>
    </section>
  );
}
