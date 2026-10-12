import logoAvif from '@/assets/brand/logo-mark.avif';
import logoWebp from '@/assets/brand/logo-mark.webp';
import wordmarkAvif from '@/assets/brand/wordmark.avif';
import wordmarkWebp from '@/assets/brand/wordmark.webp';
import { useId, type CSSProperties } from 'react';

import { clinic } from '@/config/site';
import { useActiveFestival } from '@/lib/active-festival';
import { cx } from '@/lib/cx';

/** The tooth mark from the brand kit (assets/brand), AVIF with a WebP fallback. */
export function LogoMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <picture className="shrink-0">
      <source srcSet={logoAvif} type="image/avif" />
      <img
        src={logoWebp}
        alt=""
        width={400}
        height={373}
        fetchPriority={priority ? 'high' : undefined}
        className={cx('object-contain', className)}
      />
    </picture>
  );
}

/**
 * The clinic name as the brand-kit wordmark (assets/brandLogoText, resized into
 * assets/brand/wordmark.*), with a 3D edge and a light sweep (.wordmark in styles.css).
 */
export function Wordmark({ className }: { className?: string }) {
  const ink = useId().replace(/:/g, '');
  return (
    <span
      className={cx('relative block w-fit shrink-0', className)}
      style={{ '--wordmark-ink': `url(#${ink})` } as CSSProperties}
    >
      {/*
        White → ink (#0d1b2a), yellow kept: each channel loses blue × (1 − ink). White has
        full blue, the yellow none, so only the letters change.
      */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={ink} colorInterpolationFilters="sRGB">
          <feColorMatrix values="1 0 -0.95 0 0  0 1 -0.894 0 0  0 0 0.165 0 0  0 0 0 1 0" />
        </filter>
      </svg>
      <picture className="block h-full">
        <source srcSet={wordmarkAvif} type="image/avif" />
        <img
          src={wordmarkWebp}
          alt={clinic.name}
          width={960}
          height={248}
          className="wordmark block h-full w-auto"
        />
      </picture>
      <span
        aria-hidden
        className="wordmark-shine pointer-events-none absolute inset-0"
        style={{ maskImage: `url(${wordmarkWebp})`, WebkitMaskImage: `url(${wordmarkWebp})` }}
      />
    </span>
  );
}

/**
 * Mark plus the clinic wordmark. During a festival the mark becomes that festival's logo
 * artwork.
 */
export function Logo({ className }: { className?: string }) {
  const festival = useActiveFestival();
  return (
    <span className={cx('flex items-center gap-2.5', className)}>
      {festival ? (
        <img
          src={festival.logo.small}
          alt=""
          width={256}
          height={256}
          className="size-11 shrink-0 object-contain"
        />
      ) : (
        <LogoMark className="h-9 w-auto" priority />
      )}
      <Wordmark className="h-8 md:h-9 lg:h-7 xl:h-9" />
    </span>
  );
}
