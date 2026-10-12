import logoMark from '@/assets/dashbaordlogo/logo.svg';
import wordmarkAvif from '@/assets/brand/wordmark.avif';
import wordmarkWebp from '@/assets/brand/wordmark.webp';
import { useId, type CSSProperties } from 'react';

import { clinic } from '@/config/site';
import { useActiveFestival } from '@/lib/active-festival';
import { cx } from '@/lib/cx';

/**
 * The tooth mark from the brand kit, as a vector (assets/dashbaordlogo/logo.svg), so it
 * stays sharp at every size and screen density.
 */
export function LogoMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={logoMark}
      alt=""
      width={495}
      height={462}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={cx('shrink-0 object-contain', className)}
    />
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
        Light surfaces: white → ink (#0d1b2a) and the signage yellow (#ffe605) → a deeper
        gold (#e0a100) that holds up on white. Each channel is a mix of itself and blue;
        white has full blue and the yellow almost none, which tells them apart.
      */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={ink} colorInterpolationFilters="sRGB">
          <feColorMatrix values="0.895 0 -0.845 0 0  0 0.715 -0.609 0 0  0 0 0.165 0 0  0 0 0 1 0" />
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
 * Mark plus the clinic wordmark, floating over a soft shadow (.logo-float in styles.css).
 * During a festival the mark becomes that festival's logo artwork.
 */
export function Logo({ className }: { className?: string }) {
  const festival = useActiveFestival();
  return (
    <span className={cx('logo-float flex items-center gap-2.5', className)}>
      {festival ? (
        <img
          src={festival.logo.small}
          alt=""
          width={256}
          height={256}
          className="size-12 shrink-0 object-contain"
        />
      ) : (
        <LogoMark className="h-10 w-auto lg:h-8 xl:h-11" priority />
      )}
      <Wordmark className="h-9 md:h-10 lg:h-7 xl:h-10" />
    </span>
  );
}
