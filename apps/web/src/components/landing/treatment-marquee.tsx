import { SparkleIcon } from '@phosphor-icons/react';
import type { CSSProperties } from 'react';

import { treatments } from '@/content/clinic';
import { cx } from '@/lib/cx';

function Row({ reverse = false, outline = false }: { reverse?: boolean; outline?: boolean }) {
  // Two identical halves, so translating by -50% loops seamlessly.
  const items = [...treatments, ...treatments];
  return (
    <div className="flex overflow-hidden">
      <div
        className="marquee-track flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12"
        data-direction={reverse ? 'reverse' : undefined}
        style={{ '--marquee-duration': reverse ? '78s' : '66s' } as CSSProperties}
      >
        {items.map((treatment, index) => (
          <span key={index} className="flex items-center gap-8 md:gap-12">
            <span
              className={cx(
                'font-display text-[clamp(2rem,7vw,5rem)] leading-none font-bold tracking-[-0.03em] whitespace-nowrap',
                outline
                  ? 'text-transparent [-webkit-text-stroke:1.5px_var(--color-brand)]'
                  : 'text-ink',
              )}
            >
              {treatment.shortName ?? treatment.name}
            </span>
            <SparkleIcon size={28} weight="fill" className="shrink-0 text-aqua" />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Two counter-moving rows of treatment names. Decorative: the same list is in the page.
 * Hidden on phones, where the hero runs straight into the implant story.
 */
export function TreatmentMarquee() {
  return (
    <div
      aria-hidden
      className="hidden flex-col gap-3 border-y border-line bg-surface py-6 md:flex md:py-10"
    >
      <Row />
      <Row reverse outline />
    </div>
  );
}
