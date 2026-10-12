import type { ReactNode } from 'react';

import { DepthField } from '@/components/fx/depth-field';
import { Container } from '@/components/ui/container';
import { RevealWords } from '@/components/reveal-words';

/**
 * Header band for inner pages, in the signage sky gradient. Text uses on-hero colours,
 * which pass AA on both gradient stops.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Actions under the description (buttons, links). */
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-linear-to-br from-hero-from to-hero-to text-on-hero">
      <DepthField className="-z-10" density={0.8} />
      <Container className="flex flex-col gap-3 py-10 md:py-16">
        {eyebrow ? (
          <p className="text-label font-semibold tracking-[0.08em] text-on-hero-muted uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="hero-words max-w-3xl font-display text-display font-bold text-balance md:text-display-lg">
          <RevealWords text={title} />
        </h1>
        {description ? (
          <p className="max-w-[60ch] text-on-hero-muted md:text-heading md:font-normal">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-2 flex flex-wrap gap-3">{children}</div> : null}
      </Container>
    </section>
  );
}
