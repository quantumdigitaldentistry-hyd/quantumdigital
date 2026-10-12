import { ArrowUpRightIcon, InfoIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link } from 'react-router';

import { BeforeAfter } from '@/components/gallery/before-after';
import { PageHero } from '@/components/sections/page-hero';
import { Container } from '@/components/ui/container';
import { casesForEveryTreatment, treatments } from '@/content/clinic';
import { cx } from '@/lib/cx';
import { useLiveResults } from '@/lib/live-content';

/**
 * Every before/after case, for every treatment, as a grid of comparisons. Pills filter by
 * treatment. Real, consented cases where the clinic has them; labelled demos elsewhere.
 */
export default function ResultsPage() {
  const live = useLiveResults().data ?? [];
  const cases = casesForEveryTreatment(live);
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? cases : cases.filter((item) => item.treatment === filter);
  const anyDemo = cases.some((item) => item.demo !== false);

  const pills = [
    { slug: 'all', label: 'All treatments', count: cases.length },
    ...treatments.map((treatment) => ({
      slug: treatment.slug,
      label: treatment.shortName ?? treatment.name,
      count: cases.filter((item) => item.treatment === treatment.slug).length,
    })),
  ];

  return (
    <>
      <PageHero
        eyebrow="Smile results"
        title="Before and after, for every treatment."
        description="Move over a photo (or drag the handle) to compare. Tap Before or After to see either side in full."
      />

      <Container className="flex flex-col gap-8 py-12 md:py-16">
        {anyDemo ? (
          <p className="flex max-w-[64ch] items-start gap-2 rounded-control bg-highlight-soft p-3 text-small text-on-highlight-soft">
            <InfoIcon size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
            Cases marked Demo use one photo with a filter, to show how the comparison works. They
            are replaced by real cases, shared with each patient’s consent, as the clinic adds them.
          </p>
        ) : null}

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

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((item) => {
            const treatment = treatments.find((entry) => entry.slug === item.treatment);
            return (
              <li key={item.id} className="flex flex-col gap-3">
                <BeforeAfter
                  before={item.before ?? item.photo}
                  after={item.photo}
                  beforeClassName={item.before ? undefined : item.beforeFilter}
                  label={`Compare before and after: ${item.title}${item.demo === false ? '' : ' (demo)'}`}
                  sizes="(min-width: 1024px) 23rem, (min-width: 640px) 46vw, 92vw"
                  className="aspect-4/5! rounded-3xl shadow-lg shadow-elevation/15"
                />
                <div className="flex items-start justify-between gap-3 px-1">
                  <div className="flex flex-col">
                    <span className="font-display font-semibold">{item.title}</span>
                    {treatment ? (
                      <Link
                        to={`/treatments/${treatment.slug}`}
                        viewTransition
                        className="group inline-flex w-fit items-center gap-1 text-small text-brand hover:underline"
                      >
                        {treatment.name}
                        <ArrowUpRightIcon
                          size={14}
                          aria-hidden
                          className="transition-transform duration-300 group-hover:rotate-45"
                        />
                      </Link>
                    ) : null}
                  </div>
                  {item.demo === false ? null : (
                    <span className="shrink-0 rounded-full bg-highlight px-2.5 py-1 text-label font-semibold text-on-highlight">
                      Demo
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </>
  );
}
