import { CheckIcon, MinusIcon } from '@phosphor-icons/react';

import { Reveal } from '@/components/reveal';
import { RevealWords } from '@/components/reveal-words';
import { Container } from '@/components/ui/container';

// Benefits as Invisalign presents them, without the study figures behind their claims.
// TODO(clinic): have the orthodontist review the wording.
const rows: { label: string; braces: boolean }[] = [
  { label: 'Personalised plan with doctor-directed care', braces: true },
  { label: 'Usually more comfortable, with no wires or brackets', braces: false },
  { label: 'Often finishes sooner for suitable cases', braces: false },
  { label: 'Fewer visits to the clinic', braces: false },
  { label: 'No emergency visits for broken wires or brackets', braces: false },
  { label: 'Removable for eating, brushing and flossing', braces: false },
  { label: 'Easier to keep teeth clean during treatment', braces: false },
  { label: 'Virtually invisible', braces: false },
  { label: 'Progress tracked in the My Invisalign app', braces: false },
];

function Mark({ yes, label }: { yes: boolean; label: string }) {
  return yes ? (
    <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-brand md:size-9">
      <CheckIcon size={18} weight="bold" aria-hidden />
      <span className="sr-only">Yes, {label}</span>
    </span>
  ) : (
    <span className="grid size-8 place-items-center text-line-strong md:size-9">
      <MinusIcon size={18} weight="bold" aria-hidden />
      <span className="sr-only">No, {label}</span>
    </span>
  );
}

/**
 * "Invisalign aligners compared to braces": a feature table with a tick or a dash for
 * each. A real table for screen readers; on phones the two answer columns stay narrow
 * and the feature text wraps.
 */
export function AlignerComparison() {
  return (
    <section aria-labelledby="comparison-title" className="border-y border-line bg-surface">
      <Container className="flex flex-col items-center gap-8 py-14 md:py-20">
        <Reveal className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
            Aligners or braces
          </p>
          <h2
            id="comparison-title"
            className="heading-3d font-display text-title font-bold text-balance md:text-display"
          >
            <RevealWords text={'Invisalign aligners compared to braces.'} />
          </h2>
          <p className="text-ink-muted">
            Compared with traditional wires and brackets, the benefits of Invisalign treatment are
            clear.
          </p>
        </Reveal>

        <Reveal step={1} className="w-full max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-line bg-canvas shadow-lg shadow-elevation/10">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Invisalign clear aligners compared with braces</caption>
              <colgroup>
                <col />
                <col className="w-22 sm:w-36 md:w-44" />
                <col className="w-18 sm:w-28 md:w-36" />
              </colgroup>
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th scope="col" className="p-3 sm:p-4">
                    <span className="sr-only">Feature</span>
                  </th>
                  <th
                    scope="col"
                    className="bg-brand-soft p-3 text-center text-caption font-semibold text-on-brand-soft sm:p-4 sm:text-small"
                  >
                    Invisalign clear aligners
                  </th>
                  <th
                    scope="col"
                    className="p-3 text-center text-caption font-semibold text-ink-muted sm:p-4 sm:text-small"
                  >
                    Braces
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ label, braces }) => (
                  <tr key={label} className="border-b border-line last:border-b-0">
                    <th
                      scope="row"
                      className="p-3 text-small font-medium text-pretty sm:px-5 sm:py-4 md:text-body"
                    >
                      {label}
                    </th>
                    <td className="bg-brand-soft/40 p-2 sm:p-3">
                      <span className="flex justify-center">
                        <Mark yes label="Invisalign" />
                      </span>
                    </td>
                    <td className="p-2 sm:p-3">
                      <span className="flex justify-center">
                        <Mark yes={braces} label="braces" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-caption text-ink-subtle">
            Every case is different. Your orthodontist will advise whether aligners or braces suit
            your teeth best.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
