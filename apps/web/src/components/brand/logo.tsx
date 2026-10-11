import logoAvif from '@/assets/brand/logo-mark.avif';
import logoWebp from '@/assets/brand/logo-mark.webp';
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
 * Mark plus the clinic name, styled after the signage wordmark. During a festival the
 * mark becomes that festival's logo artwork.
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
      <span className="font-display text-body leading-tight font-semibold whitespace-nowrap">
        {clinic.shortName}
        <span className="block text-caption font-medium tracking-[0.12em] text-ink-muted uppercase">
          Digital Dentistry
        </span>
      </span>
    </span>
  );
}
