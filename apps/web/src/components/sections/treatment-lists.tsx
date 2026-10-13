import { CheckIcon } from '@phosphor-icons/react';

import { Reveal } from '@/components/reveal';
import type { TreatmentDetails } from '@/content/treatment-details';
import { cx } from '@/lib/cx';

/**
 * The clinic's own lists for a treatment ("Braces can fix", "Signs you need it"), with its
 * short notes and closing line. One column on phones, two from tablets.
 */
export function TreatmentLists({
  lists = [],
  notes = [],
  closing,
}: Pick<TreatmentDetails, 'lists' | 'notes' | 'closing'>) {
  return (
    <div className="flex flex-col gap-6">
      {lists.length ? (
        <ul className={cx('grid gap-4', lists.length > 1 && 'md:grid-cols-2')}>
          {lists.map((list, index) => (
            <li key={list.title}>
              <Reveal
                step={index}
                className="flex h-full flex-col gap-3 rounded-container border border-line bg-surface p-5 md:p-6"
              >
                <h3 className="font-display text-heading font-semibold">{list.title}</h3>
                {list.intro ? <p className="text-small text-ink-muted">{list.intro}</p> : null}
                <ul className="flex flex-col gap-2">
                  {list.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckIcon
                        size={16}
                        weight="bold"
                        className="mt-1 shrink-0 text-brand"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ul>
      ) : null}
      {notes.length ? (
        <Reveal className="flex max-w-3xl flex-col gap-2 text-ink-muted">
          {notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </Reveal>
      ) : null}
      {closing ? (
        <Reveal>
          <p className="max-w-3xl rounded-container bg-aqua-soft p-5 font-display text-heading font-semibold text-on-aqua-soft md:p-6">
            {closing}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
