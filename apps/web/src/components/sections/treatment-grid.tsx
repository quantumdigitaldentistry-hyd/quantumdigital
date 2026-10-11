import { ArrowRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';

import { Tilt } from '@/components/fx/tilt';
import { Reveal } from '@/components/reveal';
import { Photo } from '@/components/ui/photo';
import { treatments, type Treatment } from '@/content/clinic';
import { vtNames } from '@/lib/transition-names';

/**
 * A treatment card: photo header with the treatment's illustration as a badge, then the
 * name, summary and "Learn more" pinned to the bottom so every card in a row lines up.
 */
export function TreatmentCard({ treatment }: { treatment: Treatment }) {
  const { slug, name, summary, illustration, photo } = treatment;
  return (
    <Link
      to={`/treatments/${slug}`}
      viewTransition
      className="group flex h-full flex-col overflow-hidden rounded-container border border-line bg-surface transition-[border-color,translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-aqua hover:shadow-xl hover:shadow-elevation/10"
    >
      <div className="relative aspect-3/2 overflow-hidden bg-sunken">
        <div className="size-full" style={{ viewTransitionName: vtNames.treatmentPhoto(slug) }}>
          <Photo
            photo={photo}
            sizes="(min-width: 1024px) 26rem, (min-width: 640px) 46vw, 92vw"
            className="block size-full"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <span
          className="absolute bottom-3 left-3 grid size-14 place-items-center rounded-full bg-surface/95 shadow-lg shadow-elevation/15 transition-transform duration-300 ease-out group-hover:-rotate-6"
          style={{ viewTransitionName: vtNames.treatmentIllustration(slug) }}
        >
          <Photo photo={illustration} sizes="56px" fit="contain" className="block size-[66%]" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
        <h3
          className="w-fit font-display text-heading font-semibold"
          style={{ viewTransitionName: vtNames.treatmentTitle(slug) }}
        >
          {name}
        </h3>
        <p className="text-small text-ink-muted">{summary}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-small font-semibold text-brand">
          Learn more
          <ArrowRightIcon
            size={16}
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

/**
 * One column on phones, two on tablets, three on desktop. Cards in a row share a height;
 * a short last row is centred rather than left hanging. Shows every treatment unless
 * given a list.
 */
export function TreatmentGrid({ items = treatments }: { items?: Treatment[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-5">
      {items.map((treatment, index) => (
        <li
          key={treatment.slug}
          className="w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
        >
          <Reveal step={index % 3} className="h-full" variant="tilt">
            <Tilt className="h-full rounded-container">
              <TreatmentCard treatment={treatment} />
            </Tilt>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
