import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useState, type CSSProperties } from 'react';

import { Photo } from '@/components/ui/photo';
import type { Photo as PhotoData } from '@/content/photos';
import { cx } from '@/lib/cx';

/**
 * Before/after comparison. The "before" image is clipped to the left of the handle.
 * Interaction is a native range input stretched over the image, so mouse drag, touch,
 * and arrow keys all work and screen readers announce the position. Clip-path only
 * repaints the overlay, so dragging stays smooth.
 */
export function BeforeAfter({
  before,
  after,
  beforeClassName,
  label,
  className,
}: {
  before: PhotoData;
  after: PhotoData;
  /** Extra classes for the before image (used by the demo to simulate a "before"). */
  beforeClassName?: string;
  label: string;
  className?: string;
}) {
  const [position, setPosition] = useState(50);

  return (
    <div
      className={cx(
        'group relative aspect-4/5 touch-pan-y overflow-hidden rounded-4xl select-none md:aspect-4/3',
        className,
      )}
      style={{ '--pos': `${position}%` } as CSSProperties}
    >
      <Photo
        photo={after}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="absolute inset-0 block"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ clipPath: 'inset(0 calc(100% - var(--pos)) 0 0)' }}
      >
        <Photo
          photo={before}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="block size-full"
          imgClassName={beforeClassName}
        />
      </div>

      <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-scrim/70 px-3 py-1 text-label font-semibold text-on-scrim backdrop-blur-sm">
        Before
      </span>
      <span className="pointer-events-none absolute top-4 right-4 rounded-full bg-surface/85 px-3 py-1 text-label font-semibold text-ink backdrop-blur-sm">
        After
      </span>

      {/* Divider and handle follow --pos. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-surface shadow-[0_0_12px_rgb(0_0_0/0.25)]"
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
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label={label}
        aria-valuetext={`${Math.round(position)}% before`}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
