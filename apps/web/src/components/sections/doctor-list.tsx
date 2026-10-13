import { ArrowUpRightIcon, CaretRightIcon, SmileyIcon, ToothIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';

import { BookLink } from '@/components/contact/book-link';
import { Reveal } from '@/components/reveal';
import { buttonClass } from '@/components/ui/button-class';
import { Photo } from '@/components/ui/photo';
import { doctors, specialtyIllustration, type Doctor } from '@/content/clinic';
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
          <h3 className="font-display text-title font-bold text-balance md:text-display">
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
            Consult {doctor.name.replace(/^Dr\.? (?:[A-Z] )*/, 'Dr ')}
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

/** The doctors as alternating features (Dr Pradeep first, then Dr Mohana Bindu). */
export function DoctorList() {
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
