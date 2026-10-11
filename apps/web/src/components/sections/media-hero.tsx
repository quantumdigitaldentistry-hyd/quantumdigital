import { useRef, type ReactNode } from 'react';

import { BackButton } from '@/components/back-button';
import { DepthField } from '@/components/fx/depth-field';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import type { Photo as PhotoData } from '@/content/photos';
import { usePointerParallax } from '@/lib/use-pointer-fx';

/**
 * Split hero for inner pages: text on the left, a large photo on the right with an
 * optional smaller photo overlapping its corner. Sky gradient, on-hero text colours.
 */
export function MediaHero({
  eyebrow,
  title,
  description,
  photo,
  inset,
  back,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  photo: PhotoData;
  /** Smaller photo overlapping the main one (bottom-left). */
  inset?: PhotoData;
  /** Show a Back button; the value is where it goes when opened directly. */
  back?: string;
  /** Actions under the description. */
  children?: ReactNode;
}) {
  const hero = useRef<HTMLElement>(null);
  usePointerParallax(hero);
  return (
    <section
      ref={hero}
      className="relative isolate overflow-hidden bg-linear-to-br from-hero-from to-hero-to text-on-hero"
    >
      <DepthField className="-z-10" density={0.9} />
      <Container className="grid items-center gap-10 py-8 md:grid-cols-[1.05fr_1fr] md:py-16">
        <div className="flex flex-col gap-5">
          {back ? <BackButton fallback={back} /> : null}
          <p className="text-label font-semibold tracking-[0.14em] text-on-hero-muted uppercase">
            {eyebrow}
          </p>
          <h1 className="font-display text-[clamp(2.4rem,8vw,4rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance">
            {title}
          </h1>
          <p className="max-w-[48ch] text-on-hero-muted md:text-heading md:font-normal">
            {description}
          </p>
          {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
        </div>
        <div className="relative mx-auto w-full max-w-md pb-8 md:max-w-none">
          <div className="depth-1 aspect-4/5 overflow-hidden rounded-4xl shadow-2xl shadow-elevation/25 md:aspect-4/3">
            <Photo
              photo={photo}
              sizes="(min-width: 768px) 45vw, 90vw"
              priority
              className="block size-full"
            />
          </div>
          {inset ? (
            <div className="depth-3 float-y absolute -bottom-2 -left-4 aspect-4/3 w-[46%] overflow-hidden rounded-3xl border-4 border-surface shadow-xl shadow-elevation/25 md:-left-10">
              <Photo
                photo={inset}
                sizes="(min-width: 768px) 20vw, 45vw"
                className="block size-full"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
