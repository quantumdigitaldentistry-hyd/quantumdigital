import { Reveal } from '@/components/reveal';
import { Container } from '@/components/ui/container';
import { useActiveFestival } from '@/lib/active-festival';

/**
 * The clinic's greeting banner for the active festival (artwork from the festival
 * package). Renders nothing on ordinary days.
 */
export function FestivalBanner({ className }: { className?: string }) {
  const pack = useActiveFestival();
  if (!pack) return null;
  return (
    <Container className={className}>
      <Reveal className="overflow-hidden rounded-4xl shadow-xl shadow-elevation/15">
        <picture>
          <source
            type="image/avif"
            srcSet={`${pack.banner.avif} 960w, ${pack.banner.avifLarge} 1920w`}
            sizes="(min-width: 1280px) 1200px, 100vw"
          />
          <img
            src={pack.banner.webp}
            srcSet={`${pack.banner.webp} 960w, ${pack.banner.webpLarge} 1920w`}
            sizes="(min-width: 1280px) 1200px, 100vw"
            width={1920}
            height={600}
            alt={`${pack.label} greetings from Quantum Digital Dentistry`}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </picture>
      </Reveal>
    </Container>
  );
}
