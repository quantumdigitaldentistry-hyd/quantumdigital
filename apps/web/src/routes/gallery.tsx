import { PhotoGallery } from '@/components/gallery/photo-gallery';
import { PageHero } from '@/components/sections/page-hero';
import { Container } from '@/components/ui/container';
import { galleryPhotos, photos } from '@/content/photos';
import { useLiveGallery } from '@/lib/live-content';

export default function GalleryPage() {
  const live = useLiveGallery().data ?? [];
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Inside modern dentistry"
        description="Treatment rooms, digital planning and the smiles they make possible. Tap any photo to view it full screen."
      />
      <Container className="py-12 md:py-20">
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
          <p className="mt-8 text-caption text-ink-subtle">
            Photos from Unsplash, shown until the clinic&apos;s own photos are added.
          </p>
        )}
      </Container>
    </>
  );
}
