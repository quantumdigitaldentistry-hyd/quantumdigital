import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';

import { Reveal } from '@/components/reveal';
import { Photo } from '@/components/ui/photo';
import { doctors, specialtyIllustration, type Doctor } from '@/content/clinic';
import { vtNames } from '@/lib/transition-names';

/** Label shown on placeholder photos so they're never mistaken for the doctor. */
export function PlaceholderPhotoTag() {
  return (
    <span className="absolute top-3 right-3 rounded-full bg-scrim/70 px-2.5 py-1 text-caption font-medium text-on-scrim backdrop-blur-sm">
      Placeholder photo
    </span>
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
          <Photo
            photo={doctor.portrait}
            sizes="(min-width: 768px) 36rem, 92vw"
            className="block size-full"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        {doctor.portraitIsPlaceholder ? <PlaceholderPhotoTag /> : null}
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
            <DoctorCard doctor={doctor} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
