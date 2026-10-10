import { useState } from 'react';

import { Photo } from '@/components/ui/photo';
import { treatments, type ResultCase } from '@/content/clinic';
import { cx } from '@/lib/cx';

import { BeforeAfter } from './before-after';

const treatmentName = (slug: string) =>
  treatments.find((treatment) => treatment.slug === slug)?.name ?? '';

/**
 * Several before/after cases: thumbnail tabs choose the case, the comparison cross-fades
 * in. Tabs scroll sideways on phones. Every case is marked as a demo until real,
 * consented cases replace them.
 */
export function ResultsShowcase({ cases, className }: { cases: ResultCase[]; className?: string }) {
  const [active, setActive] = useState(0);
  const current = cases[active] ?? cases[0];
  if (!current) return null;

  return (
    <div className={cx('flex flex-col gap-4', className)}>
      <div key={current.id} className="relative animate-[lightbox-in_420ms_var(--ease-out)_both]">
        <BeforeAfter
          before={current.photo}
          after={current.photo}
          beforeClassName={current.beforeFilter}
          label={`Compare before and after: ${current.title} (demo)`}
        />
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-2">
          <p className="rounded-2xl bg-scrim/70 px-3 py-2 text-on-scrim backdrop-blur-sm">
            <span className="block text-caption opacity-80">
              {treatmentName(current.treatment)}
            </span>
            <span className="font-display font-semibold">{current.title}</span>
          </p>
          <span className="rounded-full bg-highlight px-2.5 py-1 text-label font-semibold text-on-highlight">
            Demo
          </span>
        </div>
      </div>

      {cases.length > 1 ? (
        <div
          role="tablist"
          aria-label="Before and after cases"
          className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
        >
          {cases.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(index)}
                className={cx(
                  'group flex shrink-0 snap-start items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-1.5 text-left transition-colors',
                  selected
                    ? 'border-brand bg-brand-soft text-on-brand-soft'
                    : 'border-line bg-surface text-ink-muted hover:text-ink',
                )}
              >
                <span className="size-9 shrink-0 overflow-hidden rounded-full">
                  <Photo photo={item.photo} sizes="40px" className="block size-full" />
                </span>
                <span className="text-small font-medium whitespace-nowrap">{item.title}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
