import { ArrowLeftIcon, ArrowRightIcon, ArrowsOutIcon, XIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';

import { Reveal } from '@/components/reveal';
import { Photo } from '@/components/ui/photo';
import type { Photo as PhotoData } from '@/content/photos';
import { cx } from '@/lib/cx';

/**
 * Masonry gallery (CSS columns: 2 on phones, 3 from md) that opens a full-screen
 * lightbox. Lightbox: native <dialog> (focus trap, Esc), arrow keys, on-screen arrows and
 * swipe. Images are lazy, so the grid costs nothing until it's scrolled into view.
 */
export function PhotoGallery({ items, className }: { items: PhotoData[]; className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <ul className={cx('columns-2 gap-3 md:columns-3 md:gap-4', className)}>
        {items.map((item, index) => (
          <li key={item.fallback} className="mb-3 break-inside-avoid md:mb-4">
            <Reveal step={index % 3}>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`View larger: ${item.alt}`}
                className="group relative block w-full overflow-hidden rounded-container"
              >
                <Photo
                  photo={item}
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="block"
                  imgClassName="h-auto transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center bg-scrim/0 transition-colors duration-300 group-hover:bg-scrim/30 group-focus-visible:bg-scrim/30">
                  <span className="grid size-11 scale-75 place-items-center rounded-full bg-surface text-ink opacity-0 transition-[opacity,scale] duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
                    <ArrowsOutIcon size={20} aria-hidden />
                  </span>
                </span>
              </button>
            </Reveal>
          </li>
        ))}
      </ul>
      <Lightbox
        items={items}
        index={openIndex}
        onIndex={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}

function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: PhotoData[];
  index: number | null;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const swipeStart = useRef<number | null>(null);
  const open = index !== null;
  const current = index !== null ? items[index] : undefined;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

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
      aria-label="Photo viewer"
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') step(1);
        if (event.key === 'ArrowLeft') step(-1);
      }}
      className="dialog dialog-sheet m-0 h-dvh max-h-none w-screen max-w-none bg-scrim/95 p-0 text-on-scrim"
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
            <Photo
              key={current.fallback}
              photo={current}
              sizes="100vw"
              fit="contain"
              priority
              className="block min-h-0 w-full flex-1 animate-[lightbox-in_320ms_var(--ease-out)_both]"
              imgClassName="select-none"
            />
            <figcaption className="max-w-xl text-center text-small opacity-80">
              {current.alt}
            </figcaption>
          </figure>
          {(
            [
              ['Previous photo', -1, ArrowLeftIcon, 'left-3 md:left-6'],
              ['Next photo', 1, ArrowRightIcon, 'right-3 md:right-6'],
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
