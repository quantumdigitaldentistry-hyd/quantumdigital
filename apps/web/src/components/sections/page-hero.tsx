import type { ReactNode } from 'react';

import { DepthField } from '@/components/fx/depth-field';
import { Container } from '@/components/ui/container';
import { RevealWords } from '@/components/reveal-words';

/**
 * Header band for inner pages, in the signage sky gradient. Text uses on-hero colours,
 * which pass AA on both gradient stops. `aside` (optional) shows art on the right from md
 * up, standing on the band's bottom edge (e.g. the doctor on Contact us).
 */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  aside,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Actions under the description (buttons, links). */
  children?: ReactNode;
  /** Art for the right-hand side, hidden on phones. */
  aside?: ReactNode;
}) {
  const text = (
    <>
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
    </>
  );
  return (
    <section className="relative isolate overflow-clip bg-linear-to-br from-hero-from to-hero-to text-on-hero">
      <DepthField className="-z-10" density={0.8} />
      {aside ? (
        <Container className="grid items-end gap-6 md:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-3 py-10 md:py-16">{text}</div>
          <div className="relative hidden self-stretch md:block">{aside}</div>
        </Container>
      ) : (
        <Container className="flex flex-col gap-3 py-10 md:py-16">{text}</Container>
      )}
    </section>
  );
}
