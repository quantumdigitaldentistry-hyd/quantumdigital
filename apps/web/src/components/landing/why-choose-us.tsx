import {
  BooksIcon,
  CpuIcon,
  HandHeartIcon,
  type Icon,
  ScalesIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import type { CSSProperties } from 'react';

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

/** Card tints, in turn: background, then the accent for the number and title. */
const tints = [
  { card: 'bg-brand-soft', accent: 'text-on-brand-soft' },
  { card: 'bg-aqua-soft', accent: 'text-on-aqua-soft' },
  { card: 'bg-highlight-soft', accent: 'text-on-highlight-soft' },
];

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Why patients choose the clinic, as a stack of cards: each one sticks below the header
 * and the next slides up over it, a little lower each time so the edges of the earlier
 * cards show. Plain `position: sticky`, no scroll scripts or per-card effects, so it
 * scrolls as smoothly as the page on phones. Wide screens put the text beside the photo.
 */
export function WhyChooseUs() {
  return (
    <section
      aria-labelledby="why-title"
      className="relative isolate overflow-clip border-y border-line bg-canvas"
    >
      <Container className="flex flex-col gap-10 py-14 md:gap-14 md:py-24">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="flex max-w-xl flex-col gap-3">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              02 · Why choose us
            </p>
            <h2
              id="why-title"
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              <RevealWords text={'Why patients choose us.'} />
            </h2>
          </div>
          <p className="max-w-sm text-ink-muted">
            Modern technology, an experienced team and care built around you, at a fair cost.
          </p>
        </Reveal>

        <ol aria-label="Reasons to choose us" className="flex flex-col gap-6 md:gap-10">
          {reasons.map(({ title, body, Icon, photo }, index) => {
            const tint = tints[index % tints.length]!;
            return (
              <li
                key={title}
                // Sticky only where a whole card fits below the header, so no text is hidden.
                className="top-(--stack-top) md:top-(--stack-top-md) [@media(min-height:40rem)]:sticky"
                style={
                  {
                    '--stack-top': `${4.5 + index * 0.5}rem`,
                    '--stack-top-md': `${5 + index * 0.75}rem`,
                  } as CSSProperties
                }
              >
                <article
                  className={cx(
                    'grid gap-3 overflow-hidden rounded-4xl border border-line p-3 shadow-xl shadow-elevation/10 md:min-h-88 md:grid-cols-[1.05fr_1fr] md:gap-4 md:p-4',
                    tint.card,
                  )}
                >
                  <div className="relative aspect-video overflow-hidden rounded-3xl md:order-2 md:aspect-auto">
                    <Photo
                      photo={photo}
                      sizes="(min-width: 768px) 34rem, 92vw"
                      className="block size-full md:absolute md:inset-0"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-3 px-2 pt-1 pb-3 md:gap-4 md:px-6 md:py-6">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand shadow-md shadow-elevation/20 md:size-12">
                        <Icon size={22} weight="duotone" aria-hidden />
                      </span>
                      <span className={cx('font-mono text-small font-medium', tint.accent)}>
                        {pad(index + 1)} / {pad(reasons.length)}
                      </span>
                    </div>
                    <h3
                      className={cx(
                        'font-display text-heading font-bold text-balance md:text-title',
                        tint.accent,
                      )}
                    >
                      {title}
                    </h3>
                    <p className="text-small text-ink md:text-body">{body}</p>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
