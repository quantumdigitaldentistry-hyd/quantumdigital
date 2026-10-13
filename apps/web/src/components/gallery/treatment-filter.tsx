import { cx } from '@/lib/cx';

export type FilterPill = { slug: string; label: string; count: number };

/**
 * A row of filter pills ("All", then one per treatment) with a count on each. Scrolls
 * sideways on phones, wraps from sm up. Used by the gallery's results and the Results page.
 */
export function TreatmentFilter({
  pills,
  value,
  onChange,
}: {
  pills: FilterPill[];
  value: string;
  onChange: (slug: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by treatment"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {pills.map((pill) => {
        const active = value === pill.slug;
        return (
          <button
            key={pill.slug}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(pill.slug)}
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
  );
}
