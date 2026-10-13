import { ArrowUpRightIcon, CaretRightIcon, SmileyIcon, ToothIcon } from '@phosphor-icons/react';
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

/**
 * Compact doctor card for the home page, two side by side: an arch portrait on a soft
 * tinted panel, then the name (one line), title, qualifications, a few treatments and
 * the two actions. Cards in a row share a height.
 */
function DoctorCard({ doctor }: { doctor: Doctor }) {
  const qualifications = [doctor.degree, doctor.fellowship, ...(doctor.credentials ?? [])].filter(
    (item): item is string => !!item,
  );
  const treats = doctor.treats.slice(0, 3);
  const more = doctor.treats.length - treats.length;
  return (
    <article
      data-doctor
      className="flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-surface shadow-lg shadow-elevation/10 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Portrait panel */}
      <div className="relative overflow-clip bg-linear-to-br from-aqua-soft via-surface to-brand-soft px-6 pt-8">
        <span
          aria-hidden
          className="absolute top-4 right-4 size-20 opacity-50 [background-image:radial-gradient(var(--color-brand)_1.5px,transparent_1.5px)] [background-size:12px_12px]"
        />
        <Link
          to={`/doctors/${doctor.slug}`}
          viewTransition
          aria-label={`${doctor.name}, view profile`}
          className="group relative mx-auto block aspect-4/5 w-44 overflow-hidden rounded-t-full border-4 border-b-0 border-surface bg-surface sm:w-48"
          style={{ viewTransitionName: vtNames.doctorPhoto(doctor.slug) }}
        >
          <DoctorPortrait
            doctor={doctor}
            sizes="12rem"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>
        <span className="absolute bottom-4 left-4 rounded-full bg-surface/90 px-3 py-1 text-label font-semibold text-brand shadow-sm backdrop-blur-sm">
          {doctor.specialty}
        </span>
        <span className="absolute right-4 bottom-4 grid size-14 place-items-center rounded-full bg-surface shadow-md shadow-elevation/15">
          <Photo
            photo={specialtyIllustration(doctor)}
            sizes="56px"
            fit="contain"
            className="block size-[66%]"
          />
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-4 p-5 text-center sm:p-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-[clamp(1.35rem,5.6vw,1.75rem)] leading-tight font-bold whitespace-nowrap">
            {doctor.name}
          </h3>
          <p className="font-display font-semibold text-brand">{doctor.role}</p>
        </div>
        <ul className="flex flex-col gap-1.5 text-small text-ink-muted">
          {qualifications.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <ul aria-label="Treats" className="flex flex-wrap justify-center gap-1.5">
          {treats.map((item) => (
            <li
              key={item}
              className="rounded-full bg-sunken px-2.5 py-1 text-caption font-medium text-ink-muted"
            >
              {item}
            </li>
          ))}
          {more > 0 ? (
            <li className="rounded-full bg-brand-soft px-2.5 py-1 text-caption font-semibold text-on-brand-soft">
              +{more} more
            </li>
          ) : null}
        </ul>
        <div className="mt-auto flex flex-col gap-2 pt-1 lg:flex-row">
          <BookLink className={buttonClass('primary', 'flex-1 whitespace-nowrap')}>
            Consult {oneLine(shortName(doctor))}
          </BookLink>
          <Link
            to={`/doctors/${doctor.slug}`}
            viewTransition
            className={buttonClass('secondary', 'whitespace-nowrap')}
          >
            Profile
            <ArrowUpRightIcon size={16} aria-hidden />
          </Link>
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
      <ul className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
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
