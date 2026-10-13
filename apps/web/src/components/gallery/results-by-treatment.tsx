import { useState } from 'react';

import { treatments, type ResultCase } from '@/content/clinic';

import { ResultsShowcase } from './results-showcase';
import { TreatmentFilter } from '@/components/gallery/treatment-filter';

/**
 * Before/after cases with a treatment filter: "All", then one pill per treatment that
 * has cases, in the clinic's treatment order. Choosing a pill swaps the showcase.
 */
export function ResultsByTreatment({ cases }: { cases: ResultCase[] }) {
  const [filter, setFilter] = useState<string>('all');
  const withCases = treatments.filter((treatment) =>
    cases.some((item) => item.treatment === treatment.slug),
  );
  const shown = filter === 'all' ? cases : cases.filter((item) => item.treatment === filter);
  const pills = [
    { slug: 'all', label: 'All', count: cases.length },
    ...withCases.map((treatment) => ({
      slug: treatment.slug,
      label: treatment.shortName ?? treatment.name,
      count: cases.filter((item) => item.treatment === treatment.slug).length,
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {withCases.length > 1 ? (
        <TreatmentFilter pills={pills} value={filter} onChange={setFilter} />
      ) : null}
      {/* Keyed by the filter, so the showcase starts from its first case each time. */}
      <ResultsShowcase key={filter} cases={shown} />
    </div>
  );
}
