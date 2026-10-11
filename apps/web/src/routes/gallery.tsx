import { InfoIcon } from '@phosphor-icons/react';

import { PhotoGallery } from '@/components/gallery/photo-gallery';
import { ResultsByTreatment } from '@/components/gallery/results-by-treatment';
import { PageHero } from '@/components/sections/page-hero';
import { Section } from '@/components/sections/section';
import { Container } from '@/components/ui/container';
import { resultCases } from '@/content/clinic';
import { galleryPhotos, photos } from '@/content/photos';
import { useLiveGallery, useLiveResults } from '@/lib/live-content';

export default function GalleryPage() {
  const live = useLiveGallery().data ?? [];
  const liveResults = useLiveResults().data ?? [];
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Inside modern dentistry"
        description="Before and after results by treatment, treatment rooms and digital planning. Tap any photo to view it full screen, or a video to play it."
      />

      <Section
        eyebrow="Before and after"
        title="Results by treatment."
        intro="Choose a treatment, then drag the handle to compare."
      >
        <div className="flex flex-col gap-4">
          {liveResults.length ? (
            <p className="text-small text-ink-muted">
              Real cases, shared with each patient’s consent.
            </p>
          ) : (
            <p className="flex max-w-[60ch] items-start gap-2 rounded-control bg-highlight-soft p-3 text-small text-on-highlight-soft">
              <InfoIcon size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
              Demo only: each case uses one photo with a filter, until the clinic adds real cases.
            </p>
          )}
          <ResultsByTreatment cases={liveResults.length ? liveResults : resultCases} />
        </div>
      </Section>

      <Container className="flex flex-col gap-6 py-12 md:py-20">
        <h2 className="font-display text-title font-bold">Photos and videos</h2>
        <PhotoGallery
          items={
            live.length
              ? live
              : [
                  ...galleryPhotos,
                  photos.consult,
                  photos.alignerFit,
                  photos.bracesModels,
                  photos.xray,
                ]
          }
        />
        {live.length ? null : (
          <p className="text-caption text-ink-subtle">
            Photos from Unsplash, shown until the clinic&apos;s own photos are added.
          </p>
        )}
      </Container>
    </>
  );
}
