import {
  ArrowUpRightIcon,
  GoogleLogoIcon,
  PencilSimpleLineIcon,
  QuotesIcon,
  StarIcon,
  VideoCameraIcon,
  WhatsappLogoIcon,
} from '@phosphor-icons/react';

import { PhotoGallery, type GalleryEntry } from '@/components/gallery/photo-gallery';
import { Reveal } from '@/components/reveal';
import { RevealWords } from '@/components/reveal-words';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { clinic } from '@/config/site';
import { googleRating, reviews, videoTestimonials } from '@/content/reviews';
import { thumbnailUrl } from '@/lib/video-links';

/** Five stars, the first `count` filled in the signage yellow. */
function Stars({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          size={size}
          weight="fill"
          aria-hidden
          className={index < count ? 'text-[#f5b400]' : 'text-line-strong'}
        />
      ))}
    </span>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/**
 * Patient reviews and video testimonials: the clinic's Google rating with links to read
 * all reviews or write one, review cards quoted from Google, then patient video stories
 * (or, until there are any, an invitation to share one).
 */
export function PatientReviews() {
  const videos: GalleryEntry[] = videoTestimonials.map(({ title, name, ...video }) => {
    const still = thumbnailUrl(video);
    return {
      avif: '',
      webp: still,
      fallback: still,
      width: 1600,
      height: 900,
      alt: `${title}, ${name}`,
      video,
    };
  });

  return (
    <section
      aria-labelledby="reviews-title"
      className="relative isolate overflow-clip border-y border-line bg-surface"
    >
      <Container className="flex flex-col gap-10 py-16 md:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="flex max-w-xl flex-col gap-3">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              04 · Patient stories
            </p>
            <h2
              id="reviews-title"
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              <RevealWords text={'Loved by our patients.'} />
            </h2>
            <p className="text-ink-muted">
              What patients say about their treatment, in their own words on Google.
            </p>
          </Reveal>

          {/* The Google rating, with links to read every review or write one. */}
          <Reveal
            step={1}
            className="flex flex-col gap-4 rounded-4xl border border-line bg-canvas p-5 shadow-lg shadow-elevation/10 sm:flex-row sm:items-center sm:gap-6"
          >
            <div className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface shadow-sm">
                <GoogleLogoIcon size={30} weight="bold" className="text-brand" aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-title leading-none font-bold">
                    {googleRating.score.toFixed(1)}
                  </span>
                  <Stars count={Math.round(googleRating.score)} size={18} />
                </span>
                <span className="text-small text-ink-muted">
                  {googleRating.count} Google reviews
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={clinic.googleReviewsUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonClass('primary')}
              >
                Read all reviews
                <ArrowUpRightIcon size={16} aria-hidden />
              </a>
              <a
                href={clinic.googleReviewsUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonClass('secondary')}
              >
                <PencilSimpleLineIcon size={16} aria-hidden />
                Write a review
              </a>
            </div>
          </Reveal>
        </div>

        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <li key={review.name} className={index % 2 ? 'slide-in-end' : 'slide-in-start'}>
              <figure className="flex h-full flex-col gap-4 rounded-4xl border border-line bg-canvas p-6 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-elevation/10">
                <div className="flex items-center justify-between">
                  <Stars count={review.stars} />
                  <QuotesIcon size={28} weight="fill" className="text-brand-soft" aria-hidden />
                </div>
                <blockquote className="flex-1 text-ink">
                  <p>“{review.text}”</p>
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-line pt-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand font-display text-small font-semibold text-on-brand">
                    {initials(review.name)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium">{review.name}</span>
                    <span className="flex items-center gap-1 text-caption text-ink-muted">
                      <GoogleLogoIcon size={12} weight="bold" aria-hidden />
                      Google review{review.about ? ` · ${review.about}` : ''}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
          {/* Fills the grid's last slot and leads on to the rest of the reviews. */}
          <li className="slide-in-end">
            <a
              href={clinic.googleReviewsUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full min-h-56 flex-col justify-between gap-6 rounded-4xl bg-linear-to-br from-brand to-brand-strong p-6 text-on-brand transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-elevation/20"
            >
              <GoogleLogoIcon size={36} weight="bold" aria-hidden />
              <span className="flex flex-col gap-2">
                <span className="font-display text-title leading-tight font-bold">
                  Read all {googleRating.count} reviews on Google
                </span>
                <span className="flex items-center gap-2 font-medium opacity-90">
                  {googleRating.score.toFixed(1)} out of 5
                  <ArrowUpRightIcon
                    size={18}
                    aria-hidden
                    className="transition-transform duration-300 group-hover:rotate-45"
                  />
                </span>
              </span>
            </a>
          </li>
        </ul>

        <div className="flex flex-col gap-5">
          <h3 className="flex items-center gap-2 font-display text-heading font-semibold">
            <VideoCameraIcon size={24} weight="duotone" className="text-brand" aria-hidden />
            Video stories
          </h3>
          {videos.length ? (
            <PhotoGallery items={videos} />
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-4xl border border-dashed border-line-strong bg-canvas p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-[52ch] text-ink-muted">
                Patient video stories are coming soon. Had treatment with us? We would love to share
                your story, with your permission.
              </p>
              <a
                href={clinic.whatsapp}
                target="_blank"
                rel="noreferrer"
                className={buttonClass('secondary', 'shrink-0')}
              >
                <WhatsappLogoIcon size={18} aria-hidden />
                Share your story
              </a>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
