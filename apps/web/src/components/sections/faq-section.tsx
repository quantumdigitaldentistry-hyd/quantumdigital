import { useId, type ReactNode } from 'react';

import { Reveal } from '@/components/reveal';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Container } from '@/components/ui/container';
import { cx } from '@/lib/cx';

export type Faq = { question: string; answer: string };

/**
 * Questions and answers: heading on the left (sticky on desktop), an exclusive
 * accordion on the right with the first answer open.
 */
export function FaqSection({
  eyebrow = 'FAQ',
  title,
  intro,
  faqs,
  aside,
  tinted = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  faqs: Faq[];
  /** Extra content under the heading, e.g. a photo (desktop only). */
  aside?: ReactNode;
  tinted?: boolean;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cx(tinted && 'border-y border-line bg-surface')}
    >
      <Container className="grid gap-10 py-14 md:grid-cols-[0.8fr_1.2fr] md:gap-14 md:py-24">
        <Reveal className="flex flex-col gap-4 md:sticky md:top-28 md:self-start">
          <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
            {eyebrow}
          </p>
          <h2
            id={headingId}
            className="heading-3d font-display text-title font-bold text-balance md:text-display"
          >
            {title}
          </h2>
          {intro ? <p className="text-ink-muted">{intro}</p> : null}
          {aside ? <div className="hidden md:block">{aside}</div> : null}
        </Reveal>
        <Accordion>
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} step={index}>
              <AccordionItem title={faq.question} group={headingId} defaultOpen={index === 0}>
                <p className="text-ink-muted">{faq.answer}</p>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
