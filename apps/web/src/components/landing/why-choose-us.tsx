import {
  BooksIcon,
  CpuIcon,
  HandHeartIcon,
  type Icon,
  ScalesIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';

import { Reveal } from '@/components/reveal';
import { RevealWords } from '@/components/reveal-words';
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
    photo: photos.xrayUnit,
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

/**
 * Why patients choose the clinic: six photo cards. Three to a row on wide screens, two on
 * tablets; on phones a swipeable row that snaps card by card, with dots to show where you
 * are. The row uses native scrolling and no per-card scroll effects, so it stays smooth.
 */
export function WhyChooseUs() {
  const row = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  // Which card is centred in the phone row (only scrolls below `sm`).
  useEffect(() => {
    const element = row.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const card = element.firstElementChild as HTMLElement | null;
        if (!card) return;
        const step = card.offsetWidth + parseFloat(getComputedStyle(element).columnGap || '0');
        setActive(Math.min(reasons.length - 1, Math.round(element.scrollLeft / step)));
      });
    };
    element.addEventListener('scroll', update, { passive: true });
    return () => {
      element.removeEventListener('scroll', update);
      cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (index: number) => {
    const card = row.current?.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <section
      aria-labelledby="why-title"
      className="relative isolate overflow-clip border-y border-line bg-surface"
    >
      {/* Soft brand glow behind the heading. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-168 -translate-x-1/2"
        style={{
          backgroundImage: 'radial-gradient(closest-side, var(--color-brand-soft), transparent)',
        }}
      />
      <Container className="flex flex-col gap-10 py-14 md:gap-12 md:py-24">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
            02 · Why choose us
          </p>
          <h2
            id="why-title"
            className="heading-3d font-display text-title font-bold text-balance md:text-display"
          >
            <RevealWords text={'Why patients choose us.'} />
          </h2>
          <p className="text-ink-muted">
            Modern technology, an experienced team and care built around you, at a fair cost.
          </p>
        </Reveal>

        <Reveal>
          <ol
            ref={row}
            aria-label="Reasons to choose us"
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-6 [&::-webkit-scrollbar]:hidden"
          >
            {reasons.map(({ title, body, Icon, photo }, index) => (
              <li key={title} className="w-[84%] shrink-0 snap-center sm:w-auto">
                <article className="group flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-canvas shadow-lg shadow-elevation/10 transition-[translate,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-aqua hover:shadow-xl">
                  <div className="relative aspect-16/10 overflow-hidden">
                    <Photo
                      photo={photo}
                      sizes="(min-width: 1024px) 23rem, (min-width: 640px) 46vw, 84vw"
                      className="block size-full"
                      imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-linear-to-t from-scrim/55 via-scrim/0 to-scrim/0"
                    />
                    <span className="absolute top-4 right-4 rounded-full bg-surface/85 px-3 py-1 font-mono text-caption font-medium backdrop-blur-sm">
                      {pad(index + 1)}
                    </span>
                    <span className="absolute bottom-4 left-4 grid size-12 place-items-center rounded-2xl bg-brand text-on-brand shadow-lg shadow-elevation/25 transition-transform duration-300 ease-out group-hover:-rotate-6">
                      <Icon size={24} weight="duotone" aria-hidden />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
                    <h3 className="font-display text-heading font-bold">{title}</h3>
                    <p className="text-small text-ink-muted">{body}</p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Phones: where you are in the row; tap a dot to jump to that card. */}
        <div className="-mt-4 flex justify-center gap-2 sm:hidden">
          {reasons.map(({ title }, index) => (
            <button
              key={title}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Show ${title}`}
              aria-current={index === active || undefined}
              className="grid h-6 place-items-center"
            >
              <span
                className={cx(
                  'block h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out',
                  index === active ? 'w-6 bg-brand' : 'w-1.5 bg-line-strong',
                )}
              />
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
