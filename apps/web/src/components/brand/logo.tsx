import logoAvif from '@/assets/brand/logo-mark.avif';
import logoWebp from '@/assets/brand/logo-mark.webp';
import { clinic } from '@/config/site';
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
    <picture>
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

/** Mark plus the clinic name, styled after the signage wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx('flex items-center gap-2.5', className)}>
      <LogoMark className="h-9 w-auto" priority />
      <span className="font-display text-body leading-tight font-semibold">
        {clinic.shortName}
        <span className="block text-caption font-medium tracking-[0.12em] text-ink-muted uppercase">
          Digital Dentistry
        </span>
      </span>
    </span>
  );
}
