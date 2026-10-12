import { ArrowUpRightIcon, InfoIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';

import { ResultsShowcase } from '@/components/gallery/results-showcase';
import { PhotoGallery } from '@/components/gallery/photo-gallery';
import { Reveal } from '@/components/reveal';
import { DepthField } from '@/components/fx/depth-field';
import { Container } from '@/components/ui/container';
import { resultCases } from '@/content/clinic';
import { galleryPhotos } from '@/content/photos';
import { useLiveGallery, useLiveResults } from '@/lib/live-content';
import { RevealWords } from '@/components/reveal-words';

/**
 * Smile results (before/after slider) and a gallery preview.
 *
 * The slider shows a DEMO until the clinic adds real patient cases with consent: the
 * same photo, with a filter standing in for "before". It is labelled as such, so no
 * result is ever implied that didn't happen.
 */
export function SmileResults() {
  const live = useLiveResults().data ?? [];
  const real = live.length > 0;
  return (
    <section aria-labelledby="results-title" className="relative isolate overflow-hidden bg-canvas">
      <DepthField className="-z-10" density={0.6} />
      <Container className="grid gap-10 py-16 *:min-w-0 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-14 md:py-24">
        <Reveal className="flex flex-col gap-4">
          <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
            04 · Results
          </p>
          <h2
            id="results-title"
            className="heading-3d font-display text-title font-bold text-balance md:text-display"
          >
            <RevealWords text={'See the difference.'} />
          </h2>
          <p className="max-w-[42ch] text-ink-muted">
            Pick a case, then drag the handle to compare.{' '}
            {real
              ? 'Real cases from the clinic, shared with each patient’s consent.'
              : 'Real cases from the clinic will appear here, shared with each patient’s consent.'}
          </p>
          {real ? null : (
            <p className="flex max-w-[44ch] items-start gap-2 rounded-control bg-highlight-soft p-3 text-small text-on-highlight-soft">
              <InfoIcon size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
              Demo only: each case uses one photo with a filter, to show how the comparison works.
            </p>
          )}
        </Reveal>
        <Reveal step={1}>
          <ResultsShowcase cases={real ? live : resultCases} />
        </Reveal>
      </Container>
    </section>
  );
}

export function GalleryPreview() {
  const live = useLiveGallery().data ?? [];
  return (
    <section aria-labelledby="gallery-title" className="border-y border-line bg-surface">
      <Container className="flex flex-col gap-8 py-16 md:py-24">
        <Reveal className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              05 · Gallery
            </p>
            <h2
              id="gallery-title"
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              <RevealWords text={'Inside modern dentistry.'} />
            </h2>
          </div>
          <Link
            to="/gallery"
            viewTransition
            className="group inline-flex w-fit items-center gap-2 font-medium text-brand hover:underline"
          >
            Open the gallery
            <ArrowUpRightIcon
              size={18}
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </Reveal>
        <PhotoGallery items={(live.length ? live : galleryPhotos).slice(0, 6)} />
      </Container>
    </section>
  );
}
