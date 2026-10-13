import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useState, type CSSProperties, type PointerEvent } from 'react';

import { Photo } from '@/components/ui/photo';
import type { Photo as PhotoData } from '@/content/photos';
import { cx } from '@/lib/cx';

/**
 * Before/after comparison. The "before" image is clipped to the left of the handle.
 *
 * - Mouse: the handle follows the pointer as it moves over the image (no click needed).
 * - Click or tap anywhere: the handle jumps there; drag to scrub.
 * - The Before and After tags are buttons that show that side in full.
 *
 * Interaction is a native range input stretched over the image, so touch and arrow keys
 * work and screen readers announce the position. Clip-path only repaints the overlay,
 * so it stays smooth.
 */
export function BeforeAfter({
  before,
  after,
  beforeClassName,
  label,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  className,
}: {
  before: PhotoData;
  after: PhotoData;
  /** Extra classes for the before image (used by the demo to simulate a "before"). */
  beforeClassName?: string;
  label: string;
  sizes?: string;
  className?: string;
}) {
  const [position, setPosition] = useState(50);
  // Glides when set by a button, follows instantly when tracking the pointer.
  const [glide, setGlide] = useState(false);

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.buttons) return;
    const box = event.currentTarget.getBoundingClientRect();
    setGlide(false);
    setPosition(Math.min(100, Math.max(0, ((event.clientX - box.left) / box.width) * 100)));
  };
  const show = (value: number) => {
    setGlide(true);
    setPosition(value);
  };

  const tag =
    'absolute top-4 z-10 rounded-full px-3 py-1 text-label font-semibold backdrop-blur-sm transition-[background-color,scale] duration-150 hover:scale-105 active:scale-95';

  return (
    <div
      onPointerMove={follow}
      // A deterrent against casual saving of patient photos (no "Save image" menu, no
      // dragging the photo out); the real protection is private, expiring media links.
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      className={cx(
        'group relative aspect-4/5 touch-pan-y overflow-hidden rounded-4xl select-none md:aspect-4/3',
        glide && '[&_.ba-move]:duration-300',
        className,
      )}
      style={{ '--pos': `${position}%` } as CSSProperties}
    >
      <Photo photo={after} sizes={sizes} className="absolute inset-0 block" />
      <div
        aria-hidden
        className="ba-move absolute inset-0 transition-[clip-path] duration-0 ease-out"
        style={{ clipPath: 'inset(0 calc(100% - var(--pos)) 0 0)' }}
      >
        <Photo
          photo={before}
          sizes={sizes}
          className="block size-full"
          imgClassName={beforeClassName}
        />
      </div>

      {/* Divider and handle follow --pos. */}
      <div
        aria-hidden
        className="ba-move pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-surface shadow-[0_0_12px_rgb(0_0_0/0.25)] transition-[left] duration-0 ease-out"
        style={{ left: 'var(--pos)' }}
      >
        <span className="absolute top-1/2 left-1/2 grid size-12 -translate-1/2 place-items-center rounded-full bg-surface text-brand shadow-lg shadow-elevation/25 transition-transform duration-200 group-active:scale-110">
          <span className="flex">
            <CaretLeftIcon size={16} weight="bold" />
            <CaretRightIcon size={16} weight="bold" />
          </span>
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={position}
        onChange={(event) => {
          setGlide(false);
          setPosition(Number(event.target.value));
        }}
        aria-label={label}
        aria-valuetext={`${Math.round(position)}% before`}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />

      {/* Above the range input, so they take the click. */}
      <button
        type="button"
        onClick={() => show(100)}
        aria-pressed={position === 100}
        className={cx(tag, 'left-4 bg-scrim/70 text-on-scrim hover:bg-scrim/85')}
      >
        Before
      </button>
      <button
        type="button"
        onClick={() => show(0)}
        aria-pressed={position === 0}
        className={cx(tag, 'right-4 bg-surface/85 text-ink hover:bg-surface')}
      >
        After
      </button>
    </div>
  );
}
