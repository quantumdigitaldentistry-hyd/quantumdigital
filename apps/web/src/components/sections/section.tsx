import { useId, type ReactNode } from 'react';

import { Reveal } from '@/components/reveal';
import { Container } from '@/components/ui/container';
import { cx } from '@/lib/cx';

/** A page section with a title and optional intro. `tinted` alternates the background. */
export function Section({
  title,
  intro,
  tinted = false,
  children,
  className,
  id,
}: {
  title: string;
  intro?: string;
  tinted?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const headingId = useId();
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cx('scroll-mt-20', tinted && 'border-y border-line bg-surface', className)}
    >
      <Container className="py-12 md:py-20">
        <Reveal className="mb-8 flex max-w-2xl flex-col gap-2">
          <h2 id={headingId} className="font-display text-title font-semibold">
            {title}
          </h2>
          {intro ? <p className="text-ink-muted">{intro}</p> : null}
        </Reveal>
        {children}
      </Container>
    </section>
  );
}
