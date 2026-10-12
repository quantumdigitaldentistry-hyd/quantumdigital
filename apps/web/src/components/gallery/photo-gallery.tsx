import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsOutIcon,
  FilmSlateIcon,
  PlayIcon,
  XIcon,
} from '@phosphor-icons/react';
import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react';

import { Tilt } from '@/components/fx/tilt';
import { Photo } from '@/components/ui/photo';
import type { Photo as PhotoData } from '@/content/photos';
import { cx } from '@/lib/cx';
import { embedUrl, thumbnailUrl, type VideoRef } from '@/lib/video-links';

/** A gallery photo, or a YouTube / Google Drive video with its thumbnail as the photo. */
export type GalleryEntry = PhotoData & { video?: VideoRef };

type Origin = { rect: DOMRect; src: string };

/**
 * Masonry gallery (CSS columns: 2 on phones, 3 from md). Photos unveil as they scroll
 * in (`.gallery-item`). Tapping one expands it straight out of its thumbnail into a
 * full-screen lightbox: arrow keys, on-screen arrows and swipe to browse, Esc to close.
 * Videos show as 16:9 thumbnails with a play button and play in the lightbox.
 */
export function PhotoGallery({ items, className }: { items: GalleryEntry[]; className?: string }) {
  const [open, setOpen] = useState<{ index: number; origin: Origin | null } | null>(null);

  return (
    <>
      <ul className={cx('columns-2 gap-3 md:columns-3 md:gap-4', className)}>
        {items.map((item, index) => (
          <li key={item.fallback} className="gallery-item mb-3 break-inside-avoid md:mb-4">
            <Tilt className="rounded-container" max={6}>
              <button
                type="button"
                onClick={(event) => {
                  // Photos expand out of their thumbnail; videos open straight into the player.
                  const img = item.video ? null : event.currentTarget.querySelector('img');
                  setOpen({
                    index,
                    origin: img ? { rect: img.getBoundingClientRect(), src: img.currentSrc } : null,
                  });
                }}
                aria-label={item.video ? `Play video: ${item.alt}` : `View larger: ${item.alt}`}
                className="group relative block w-full overflow-hidden rounded-container"
              >
                {item.video ? (
                  <VideoThumb video={item.video} />
                ) : (
                  <Photo
                    photo={item}
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="block"
                    imgClassName="h-auto transition-transform duration-700 ease-out group-hover:scale-110 group-focus-visible:scale-110"
                  />
                )}
                {item.video ? (
                  <span className="absolute inset-0 grid place-items-center bg-scrim/20 transition-colors duration-300 group-hover:bg-scrim/35">
                    <span className="grid size-14 place-items-center rounded-full bg-surface/95 text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <PlayIcon size={24} weight="fill" aria-hidden />
                    </span>
                  </span>
                ) : (
                  <span className="absolute inset-0 grid place-items-center bg-scrim/0 transition-colors duration-300 group-hover:bg-scrim/30 group-focus-visible:bg-scrim/30">
                    <span className="grid size-11 scale-75 place-items-center rounded-full bg-surface text-ink opacity-0 transition-[opacity,scale] duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
                      <ArrowsOutIcon size={20} aria-hidden />
                    </span>
                  </span>
                )}
              </button>
            </Tilt>
          </li>
        ))}
      </ul>
      <Lightbox
        items={items}
        index={open?.index ?? null}
        origin={open?.origin ?? null}
        onIndex={(index) => setOpen({ index, origin: null })}
        onClose={() => setOpen(null)}
      />
    </>
  );
}

/** 16:9 still for a video; a plain tile if the provider has none (e.g. a private Drive file). */
function VideoThumb({ video }: { video: VideoRef }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="relative block aspect-video w-full bg-linear-to-br from-brand-soft to-sunken">
      {failed ? (
        <FilmSlateIcon
          size={36}
          className="absolute inset-0 m-auto text-brand opacity-70"
          aria-hidden
        />
      ) : (
        <img
          src={thumbnailUrl(video)}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      )}
    </span>
  );
}

/** Where a photo of this aspect ratio is drawn inside `box` with object-fit: contain. */
function containRect(box: DOMRect, photo: PhotoData) {
  const aspect = photo.width / photo.height;
  const width = Math.min(box.width, box.height * aspect);
  const height = width / aspect;
  return {
    left: box.left + (box.width - width) / 2,
    top: box.top + (box.height - height) / 2,
    width,
    height,
  };
}

function Lightbox({
  items,
  index,
  origin,
  onIndex,
  onClose,
}: {
  items: GalleryEntry[];
  index: number | null;
  origin: Origin | null;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLImageElement>(null);
  const swipeStart = useRef<number | null>(null);
  // The thumbnail copy shows from opening until its flight for this origin has finished.
  const [landedFor, setLandedFor] = useState<Origin | null>(null);
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const flying = !!origin && landedFor !== origin && !reducedMotion;
  const open = index !== null;
  const current = index !== null ? items[index] : undefined;

  // Layout effect, declared first: the dialog must be open (and laid out) before the
  // expand animation below measures where the photo will land.
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Expand from the thumbnail: a copy of it flies to where the full photo will sit.
  useLayoutEffect(() => {
    const box = stage.current?.getBoundingClientRect();
    const image = ghost.current;
    if (!open || !origin || !current || !box || !image || !flying) return;
    const target = containRect(box, current);
    const from = origin.rect;
    const animation = image.animate(
      [
        {
          left: `${from.left}px`,
          top: `${from.top}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
          borderRadius: '20px',
        },
        {
          left: `${target.left}px`,
          top: `${target.top}px`,
          width: `${target.width}px`,
          height: `${target.height}px`,
          borderRadius: '8px',
        },
      ],
      { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
    );
    animation.onfinish = () => setLandedFor(origin);
    return () => animation.cancel();
  }, [open, origin, current, flying]);

  const step = (delta: number) => {
    if (index === null) return;
    onIndex((index + delta + items.length) % items.length);
  };
  const onPointerDown = (event: PointerEvent) => {
    swipeStart.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  };

  return (
    <dialog
      ref={ref}
      aria-label="Photo and video viewer"
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') step(1);
        if (event.key === 'ArrowLeft') step(-1);
      }}
      className="dialog dialog-fade m-0 h-dvh max-h-none w-screen max-w-none bg-scrim/95 p-0 text-on-scrim"
    >
      {current ? (
        <div
          className="relative flex h-full flex-col"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div className="flex items-center justify-between gap-3 p-3 md:p-5">
            <p className="font-mono text-small opacity-80">
              {(index ?? 0) + 1} / {items.length}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-11 place-items-center rounded-full bg-on-scrim/10 transition-colors hover:bg-on-scrim/20"
            >
              <XIcon size={22} aria-hidden />
            </button>
          </div>
          <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-3 pb-6 md:px-20">
            <div ref={stage} className="relative min-h-0 w-full flex-1">
              {current.video ? (
                <div className="absolute inset-0 grid place-items-center">
                  <iframe
                    key={current.video.id}
                    src={embedUrl(current.video)}
                    title={current.alt}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                    className="aspect-video max-h-full w-full max-w-[calc((100dvh-10rem)*16/9)] animate-[lightbox-in_320ms_var(--ease-out)_both] rounded-lg border-0 bg-black"
                  />
                </div>
              ) : (
                <Photo
                  key={current.fallback}
                  photo={current}
                  sizes="100vw"
                  fit="contain"
                  priority
                  className={cx(
                    'absolute inset-0 block',
                    flying ? 'opacity-0' : 'animate-[lightbox-in_320ms_var(--ease-out)_both]',
                  )}
                  imgClassName="select-none"
                />
              )}
            </div>
            <figcaption className="max-w-xl text-center text-small opacity-80">
              {current.alt}
            </figcaption>
          </figure>
          {origin && flying ? (
            <img
              ref={ghost}
              src={origin.src}
              alt=""
              aria-hidden
              className="pointer-events-none fixed object-cover"
              style={{
                left: origin.rect.left,
                top: origin.rect.top,
                width: origin.rect.width,
                height: origin.rect.height,
              }}
            />
          ) : null}
          {(
            [
              ['Previous', -1, ArrowLeftIcon, 'left-3 md:left-6'],
              ['Next', 1, ArrowRightIcon, 'right-3 md:right-6'],
            ] as const
          ).map(([label, delta, Icon, position]) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => step(delta)}
              className={cx(
                'absolute top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-on-scrim/10 transition-colors hover:bg-on-scrim/20 md:grid',
                position,
              )}
            >
              <Icon size={22} aria-hidden />
            </button>
          ))}
        </div>
      ) : null}
    </dialog>
  );
}
