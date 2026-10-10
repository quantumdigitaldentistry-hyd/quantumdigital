import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';

import { Reveal } from '@/components/reveal';
import { Photo } from '@/components/ui/photo';
import { treatments, type Treatment } from '@/content/clinic';
import { vtNames } from '@/lib/transition-names';

/** A treatment card: its illustration, name and summary; opens the treatment page. */
export function TreatmentCard({ treatment }: { treatment: Treatment }) {
  const { slug, name, summary, illustration } = treatment;
  return (
    <Link
      to={`/treatments/${slug}`}
      viewTransition
      className="group flex h-full flex-col gap-3 rounded-container border border-line bg-surface p-5 transition-[border-color,translate] duration-300 ease-out hover:-translate-y-1 hover:border-aqua md:p-6"
    >
      <span className="grid size-20 place-items-center rounded-full bg-aqua-soft transition-transform duration-300 ease-out group-hover:-rotate-6">
        <Photo photo={illustration} sizes="80px" fit="contain" className="block size-[68%]" />
      </span>
      <h3
        className="w-fit font-display text-heading font-semibold"
        style={{ viewTransitionName: vtNames.treatmentTitle(slug) }}
      >
        {name}
      </h3>
      <p className="flex-1 text-small text-ink-muted">{summary}</p>
      <span className="inline-flex items-center gap-1.5 text-small font-medium text-brand">
        Learn more
        <ArrowUpRightIcon
          size={16}
          aria-hidden
          className="transition-transform duration-300 group-hover:rotate-45"
        />
      </span>
    </Link>
  );
}

/** One column on phones, two on tablets, four on desktop. */
export function TreatmentGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {treatments.map((treatment, index) => (
        <li key={treatment.slug}>
          <Reveal step={index} className="h-full">
            <TreatmentCard treatment={treatment} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
