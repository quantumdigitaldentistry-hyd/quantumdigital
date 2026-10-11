import type { Photo as PhotoData } from '@/content/photos';
import { cx } from '@/lib/cx';

/**
 * Responsive photo: AVIF first, WebP fallback, the browser picks the width from `sizes`.
 * Lazy and async-decoded by default; pass `priority` only for an image in the first view.
 */
export function Photo({
  photo,
  sizes,
  priority = false,
  fit = 'cover',
  className,
  imgClassName,
}: {
  photo: PhotoData;
  /** e.g. "(min-width: 1024px) 30vw, 80vw" */
  sizes: string;
  priority?: boolean;
  /** contain for illustrations (never crop them). */
  fit?: 'cover' | 'contain';
  className?: string;
  imgClassName?: string;
}) {
  return (
    <picture className={className}>
      {photo.avif ? <source type="image/avif" srcSet={photo.avif} sizes={sizes} /> : null}
      <source type="image/webp" srcSet={photo.webp} sizes={sizes} />
      <img
        src={photo.fallback}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        className={cx(
          'size-full',
          fit === 'cover' ? 'object-cover' : 'object-contain',
          imgClassName,
        )}
      />
    </picture>
  );
}
