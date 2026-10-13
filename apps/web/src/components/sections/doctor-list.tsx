import {
  ArrowUpRightIcon,
  CalendarPlusIcon,
  CaretRightIcon,
  SmileyIcon,
  ToothIcon,
} from '@phosphor-icons/react';
import { Link } from 'react-router';

import { BookLink } from '@/components/contact/book-link';
import { Reveal } from '@/components/reveal';
import { buttonClass } from '@/components/ui/button-class';
import { Photo } from '@/components/ui/photo';
import { doctors, oneLine, specialtyIllustration, type Doctor } from '@/content/clinic';
import { cx } from '@/lib/cx';
import { vtNames } from '@/lib/transition-names';

/**
 * A doctor's portrait filling its frame. Illustrations (stand-ins until real portraits
 * arrive) are drawn whole on a soft brand-tinted panel instead of being cropped.
 */
export function DoctorPortrait({
  doctor,
  sizes,
  priority,
  imgClassName,
}: {
  doctor: Doctor;
  sizes: string;
  priority?: boolean;
  imgClassName?: string;
}) {
  if (!doctor.portraitIsIllustration) {
    return (
      <Photo
        photo={doctor.portrait}
        sizes={sizes}
        priority={priority}
        className="block size-full"
        imgClassName={imgClassName}
      />
    );
  }
  return (
    <div className="size-full bg-linear-to-br from-aqua-soft via-surface to-brand-soft px-[6%] pt-[6%]">
      <Photo
        photo={doctor.portrait}
        sizes={sizes}
        priority={priority}
        fit="contain"
        className="block size-full"
        imgClassName={cx('object-bottom', imgClassName)}
      />
    </div>
  );
}

/**
 * One doctor, laid out like a feature: an arch-shaped portrait (rounded top, like a
 * doorway) over a soft offset arch and dotted texture, with the details card overlapping
 * its edge. `flip` mirrors it, so two doctors alternate sides. Stacks on phones.
 */
function DoctorFeature({ doctor, flip }: { doctor: Doctor; flip: boolean }) {
  const qualifications = [doctor.degree, doctor.fellowship, ...(doctor.credentials ?? [])].filter(
    (item): item is string => !!item,
  );
  return (
    <article data-doctor className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-0">
      {/* Portrait */}
      <Reveal className={cx('relative mx-auto w-full max-w-sm', flip && 'lg:order-2')}>
        {/* The offset arch and dots behind: decorative. */}
        <span
          aria-hidden
          className={cx(
            'absolute inset-0 translate-y-5 rounded-t-full rounded-b-4xl bg-linear-to-b from-aqua-soft to-brand-soft',
            flip ? '-translate-x-5' : 'translate-x-5',
          )}
        />
        <span
          aria-hidden
          className={cx(
            'absolute -bottom-8 size-28 opacity-60 [background-image:radial-gradient(var(--color-brand)_1.5px,transparent_1.5px)] [background-size:14px_14px]',
            flip ? '-right-6' : '-left-6',
          )}
        />
        <Link
          to={`/doctors/${doctor.slug}`}
          viewTransition
          aria-label={`${doctor.name}, view profile`}
          className="group relative block aspect-4/5 overflow-hidden rounded-t-full rounded-b-4xl border-4 border-surface bg-surface shadow-2xl shadow-elevation/20"
          style={{ viewTransitionName: vtNames.doctorPhoto(doctor.slug) }}
        >
          <DoctorPortrait
            doctor={doctor}
            sizes="(min-width: 1024px) 24rem, 80vw"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>
        {/* Speciality badge on the arch's edge. */}
        <span
          className={cx(
            'float-y absolute bottom-10 grid size-20 place-items-center rounded-full bg-surface shadow-lg shadow-elevation/20 md:size-24',
            flip ? 'left-2 sm:-left-4' : 'right-2 sm:-right-4',
          )}
        >
          <Photo
            photo={specialtyIllustration(doctor)}
            sizes="96px"
            fit="contain"
            className="block size-[64%]"
          />
        </span>
      </Reveal>

      {/* Details card, overlapping the portrait's edge from lg up. */}
      <Reveal
        step={1}
        className={cx(
          'relative z-10 flex flex-col gap-5 rounded-4xl border border-line bg-surface p-6 text-center shadow-xl shadow-elevation/10 sm:p-8',
          flip ? 'lg:order-1 lg:-mr-16' : 'lg:-ml-16',
        )}
      >
        <div className="flex flex-col gap-1.5">
          <p className="text-label font-semibold tracking-[0.18em] text-ink-subtle uppercase">
            Meet the doctor
          </p>
          {/* Always one line: the size scales with the screen so the name fits. */}
          <h3 className="font-display text-[clamp(1.5rem,6.4vw,2.75rem)] leading-tight font-bold whitespace-nowrap">
            {doctor.name}
          </h3>
          <p className="font-display text-heading font-semibold text-brand">{doctor.role}</p>
        </div>

        <ul className="mx-auto flex max-w-md flex-col gap-2 text-left">
          {qualifications.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-small font-medium">
              <CaretRightIcon
                size={14}
                weight="fill"
                className="mt-1 shrink-0 text-brand"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>

        {/* What the speciality is, in a soft highlight panel. */}
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-brand-soft/70 p-4 text-left sm:flex-row sm:items-stretch sm:gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface text-brand">
            {doctor.specialty === 'Orthodontics' ? (
              <SmileyIcon size={30} weight="duotone" aria-hidden />
            ) : (
              <ToothIcon size={30} weight="duotone" aria-hidden />
            )}
          </span>
          <div className="flex flex-col gap-1 sm:border-l sm:border-brand/20 sm:pl-4">
            <p className="font-display font-semibold text-on-brand-soft">{doctor.specialty}</p>
            <p className="text-small text-ink-muted">{doctor.specialtyIntro}</p>
          </div>
        </div>

        <ul aria-label="Treats" className="flex flex-wrap justify-center gap-2">
          {doctor.treats.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line bg-canvas px-3 py-1 text-caption font-medium text-ink-muted"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <BookLink className={buttonClass('primary', 'sm:min-w-56')}>
            Consult {oneLine(shortName(doctor))}
            <ArrowUpRightIcon size={18} aria-hidden />
          </BookLink>
          <Link to={`/doctors/${doctor.slug}`} viewTransition className={buttonClass('secondary')}>
            View profile
          </Link>
        </div>
      </Reveal>
    </article>
  );
}

/** First name for buttons: "Dr D Reddy Pradeep" → "Dr Reddy Pradeep". */
const shortName = (doctor: Doctor) => doctor.name.replace(/^Dr\.? (?:[A-Z] )*/, 'Dr ');

/** Card colours per speciality: teal for orthodontics, deep blue for prosthodontics. */
const cardTone: Record<Doctor['specialty'], { bg: string; accent: string; glow: string }> = {
  Orthodontics: {
    bg: 'linear-gradient(140deg, #072f3d 0%, #0c5f73 55%, #1696a8 100%)',
    accent: '#8ff0ff',
    glow: 'rgb(110 230 245 / 0.55)',
  },
  Prosthodontics: {
    bg: 'linear-gradient(140deg, #0a1c45 0%, #13469b 55%, #2f78e0 100%)',
    accent: '#a9cbff',
    glow: 'rgb(127 178 255 / 0.55)',
  },
};

/**
 * Home page doctor card: a rich gradient panel (teal or blue by speciality) with soft
 * glows, concentric rings and dot texture; the doctor stands in front of the rings and
 * breaks out over the card's top edge. Frosted chips, white text, a white Consult button.
 * On hover the card lifts, the glow brightens, the rings open out and the doctor steps
 * forward. Container queries pick the layout from the card's own width (`card`): side by
 * side (portrait left) when there is room, stacked otherwise; the details column sizes
 * the name to fit one line.
 */
function DoctorCard({ doctor }: { doctor: Doctor }) {
  const tone = cardTone[doctor.specialty];
  const qualifications = [doctor.degree, doctor.fellowship, ...(doctor.credentials ?? [])].filter(
    (item): item is string => !!item,
  );
  const treats = doctor.treats.slice(0, 3);
  const more = doctor.treats.length - treats.length;
  return (
    <article data-doctor className="group @container/card h-full">
      <div
        className="relative isolate mt-16 flex h-[calc(100%-4rem)] flex-col @md/card:mt-6 @md/card:h-[calc(100%-1.5rem)] rounded-[2rem] text-white shadow-xl shadow-elevation/25 transition-[translate,box-shadow] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-2xl @md/card:flex-row"
        style={{ backgroundImage: tone.bg }}
      >
        {/* Decorations, clipped to the card. */}
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden rounded-[2rem]">
          <span
            className="absolute -top-24 -right-20 size-72 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: tone.glow }}
          />
          <span className="absolute -bottom-28 -left-16 size-64 rounded-full bg-white/10 blur-3xl" />
          <span className="absolute right-5 bottom-5 size-24 opacity-30 [background-image:radial-gradient(white_1.2px,transparent_1.2px)] [background-size:12px_12px]" />
          {/* Rings behind the doctor. */}
          <span className="absolute top-[52%] left-1/2 size-64 -translate-1/2 transition-transform duration-700 ease-out group-hover:scale-110 @md/card:top-[58%] @md/card:left-[27%]">
            <span className="absolute inset-0 rounded-full border border-white/15" />
            <span className="absolute inset-6 rounded-full border border-white/20" />
            <span className="absolute inset-12 rounded-full border border-white/25 bg-white/5" />
          </span>
        </div>

        {/* The doctor, rising out of the card. */}
        <Link
          to={`/doctors/${doctor.slug}`}
          viewTransition
          aria-label={`${doctor.name}, view profile`}
          className="relative -mt-16 flex h-64 shrink-0 @md/card:mt-0 justify-center self-center @md/card:h-auto @md/card:min-h-80 @md/card:w-[42%] @md/card:self-stretch"
          style={{ viewTransitionName: vtNames.doctorPhoto(doctor.slug) }}
        >
          <Photo
            photo={doctor.portrait}
            sizes="16rem"
            fit="contain"
            className="block h-full w-auto @md/card:absolute @md/card:inset-x-0 @md/card:-top-6 @md/card:bottom-0 @md/card:h-auto @md/card:w-full"
            imgClassName="origin-bottom object-bottom drop-shadow-[0_18px_24px_rgb(0_0_0/0.35)] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <span className="absolute bottom-3 left-1/2 grid size-12 -translate-x-1/2 place-items-center rounded-full bg-white shadow-lg shadow-black/20 @md/card:left-auto @md/card:right-2 @md/card:translate-x-0">
            <Photo
              photo={specialtyIllustration(doctor)}
              sizes="48px"
              fit="contain"
              className="block size-[64%]"
            />
          </span>
        </Link>

        {/* Details */}
        <div className="@container flex flex-1 flex-col gap-4 p-6 pt-5 text-center @md/card:py-7 @md/card:pr-7 @md/card:pl-2 @md/card:text-left">
          <span className="w-fit self-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-label font-semibold tracking-wide backdrop-blur-md @md/card:self-start">
            {doctor.specialty}
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-[min(1.75rem,8.6cqi)] leading-tight font-bold whitespace-nowrap">
              {doctor.name}
            </h3>
            <p className="font-display font-semibold" style={{ color: tone.accent }}>
              {doctor.role}
            </p>
          </div>
          <ul className="flex flex-col gap-1 text-small text-white/80">
            {qualifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ul
            aria-label="Treats"
            className="flex flex-wrap justify-center gap-1.5 @md/card:justify-start"
          >
            {treats.map((item) => (
              <li
                key={item}
                className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-caption font-medium backdrop-blur-sm"
              >
                {item}
              </li>
            ))}
            {more > 0 ? (
              <li>
                <Link
                  to={`/doctors/${doctor.slug}`}
                  viewTransition
                  aria-label={`${more} more treatments: see ${doctor.name}'s profile`}
                  className="inline-block rounded-full bg-white px-2.5 py-1 text-caption font-semibold text-ink transition-[background-color,scale] duration-200 hover:scale-105 hover:bg-white/90"
                >
                  +{more} more
                </Link>
              </li>
            ) : null}
          </ul>
          <div className="mt-auto flex items-center gap-2 pt-1">
            <BookLink className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 font-semibold whitespace-nowrap text-ink shadow-lg shadow-black/15 transition-[transform,background-color] duration-200 hover:bg-white/90 active:scale-[0.97]">
              <CalendarPlusIcon size={18} aria-hidden />
              Book a consult
            </BookLink>
            <Link
              to={`/doctors/${doctor.slug}`}
              viewTransition
              aria-label={`View ${doctor.name}'s profile`}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md transition-[background-color,rotate] duration-300 hover:rotate-45 hover:bg-white/20"
            >
              <ArrowUpRightIcon size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * The doctors. `compact` (home page): two cards side by side from md, stacked on phones.
 * Otherwise (About us) as large alternating features.
 */
export function DoctorList({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <ul className="mx-auto grid max-w-5xl gap-x-6 gap-y-4 md:grid-cols-2">
        {doctors.map((doctor, index) => (
          <li key={doctor.slug}>
            <Reveal step={index} className="h-full">
              <DoctorCard doctor={doctor} />
            </Reveal>
          </li>
        ))}
      </ul>
    );
  }
  return (
    // Clipped sideways, so the decorative shapes never widen the page on phones.
    <ul className="flex flex-col gap-16 overflow-x-clip py-4 md:gap-24">
      {doctors.map((doctor, index) => (
        <li key={doctor.slug}>
          <DoctorFeature doctor={doctor} flip={index % 2 === 1} />
        </li>
      ))}
    </ul>
  );
}
