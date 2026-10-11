import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';

import { Tilt } from '@/components/fx/tilt';
import { Reveal } from '@/components/reveal';
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

function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Link
      to={`/doctors/${doctor.slug}`}
      viewTransition
      className="group flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-surface transition-[border-color,translate] duration-300 ease-out hover:-translate-y-1 hover:border-aqua"
    >
      <div className="relative">
        <div
          className="aspect-4/3 overflow-hidden"
          style={{ viewTransitionName: vtNames.doctorPhoto(doctor.slug) }}
        >
          <DoctorPortrait
            doctor={doctor}
            sizes="(min-width: 768px) 36rem, 92vw"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-surface/85 px-3 py-1 text-label font-semibold text-brand backdrop-blur-sm">
          {doctor.specialty}
        </span>
        <span className="float-y absolute right-5 -bottom-8 grid size-20 place-items-center rounded-full bg-surface shadow-lg shadow-elevation/20 md:size-24">
          <Photo
            photo={specialtyIllustration(doctor)}
            sizes="96px"
            fit="contain"
            className="block size-[68%]"
          />
        </span>
      </div>
      <div className="flex flex-1 items-center gap-4 p-5 pt-6 md:p-7">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="font-display text-heading font-semibold md:text-title">{doctor.name}</h3>
          <p className="text-small font-medium text-brand">{doctor.degree}</p>
          {doctor.fellowship ? (
            <p className="text-caption font-medium text-ink-muted">{doctor.fellowship}</p>
          ) : null}
          <p className="text-small text-ink-muted">{doctor.focus}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-on-brand-soft transition-transform duration-300 ease-out group-hover:rotate-45">
          <ArrowUpRightIcon size={20} aria-hidden />
          <span className="sr-only">View profile</span>
        </span>
      </div>
    </Link>
  );
}

/** Doctor cards in page order (Dr Pradeep left, Dr Mohana Bindu right). */
export function DoctorList() {
  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {doctors.map((doctor, index) => (
        <li key={doctor.slug}>
          <Reveal step={index} className="h-full">
            <Tilt className="h-full rounded-4xl" max={5}>
              <DoctorCard doctor={doctor} />
            </Tilt>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
