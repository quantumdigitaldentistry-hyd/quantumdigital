import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';

import { Reveal } from '@/components/reveal';
import { Photo } from '@/components/ui/photo';
import { doctors, specialtyIllustration } from '@/content/clinic';

/** Doctor cards: speciality illustration, name, degree, and a link to their page. */
export function DoctorList() {
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {doctors.map((doctor, index) => (
        <li key={doctor.slug}>
          <Reveal step={index} className="h-full">
            <Link
              to={`/doctors/${doctor.slug}`}
              viewTransition
              className="group flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-surface transition-[border-color,translate] duration-300 ease-out hover:-translate-y-1 hover:border-aqua"
            >
              <div className="relative grid aspect-video place-items-center overflow-hidden bg-aqua-soft">
                <div
                  aria-hidden
                  className="absolute size-[70%] rounded-full opacity-80 transition-transform duration-700 ease-out group-hover:scale-110"
                  style={{
                    backgroundImage:
                      'radial-gradient(closest-side, var(--color-hero-from), transparent)',
                  }}
                />
                <Photo
                  photo={doctor.portrait ?? specialtyIllustration(doctor)}
                  sizes="(min-width: 768px) 20rem, 60vw"
                  fit="contain"
                  className="float-y relative block h-[78%] w-auto"
                />
                <span className="absolute top-4 left-4 rounded-full bg-surface/85 px-3 py-1 text-label font-semibold text-brand backdrop-blur-sm">
                  {doctor.specialty}
                </span>
              </div>
              <div className="flex flex-1 items-center gap-4 p-5 md:p-7">
                <span
                  aria-hidden
                  className="grid size-14 shrink-0 place-items-center rounded-full bg-linear-to-br from-hero-from to-hero-to font-display text-heading font-bold text-on-hero"
                >
                  {doctor.initials}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <h3 className="font-display text-heading font-semibold md:text-title">
                    {doctor.name}
                  </h3>
                  <p className="text-small font-medium text-brand">{doctor.degree}</p>
                  <p className="text-small text-ink-muted">{doctor.focus}</p>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-on-brand-soft transition-transform duration-300 ease-out group-hover:rotate-45">
                  <ArrowUpRightIcon size={20} aria-hidden />
                  <span className="sr-only">View profile</span>
                </span>
              </div>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
