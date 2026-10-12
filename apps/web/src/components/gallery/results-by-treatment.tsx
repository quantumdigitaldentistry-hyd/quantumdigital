import { useState } from 'react';

import { treatments, type ResultCase } from '@/content/clinic';
import { cx } from '@/lib/cx';

import { ResultsShowcase } from './results-showcase';

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
        <div
          role="group"
          aria-label="Filter by treatment"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {pills.map((pill) => {
            const active = filter === pill.slug;
            return (
              <button
                key={pill.slug}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(pill.slug)}
                className={cx(
                  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-small font-medium whitespace-nowrap transition-colors',
                  active
                    ? 'border-brand bg-brand text-on-brand'
                    : 'border-line bg-surface text-ink-muted hover:border-brand hover:text-ink',
                )}
              >
                {pill.label}
                <span
                  className={cx(
                    'rounded-full px-1.5 font-mono text-caption',
                    active ? 'bg-on-brand/20' : 'bg-sunken',
                  )}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
      {/* Keyed by the filter, so the showcase starts from its first case each time. */}
      <ResultsShowcase key={filter} cases={shown} />
    </div>
  );
}
