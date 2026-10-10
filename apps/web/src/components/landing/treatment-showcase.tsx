import { ArrowRightIcon } from '@phosphor-icons/react';
import { useRef } from 'react';
import { Link } from 'react-router';

import { Photo } from '@/components/ui/photo';
import { treatments } from '@/content/clinic';
import { photos, type Photo as PhotoData } from '@/content/photos';
import { useScrollScene } from '@/lib/gsap';

const treatmentPhotos: Record<string, PhotoData> = {
  invisalign: photos.aligners,
  implants: photos.implantModel,
  'laser-dentistry': photos.procedure,
  'smile-design': photos.smile,
};

/**
 * Treatments as large photo cards. Phones and tablets: a native swipe row with snap
 * points. Desktop: the section pins and vertical scrolling moves the row sideways.
 */
export function TreatmentShowcase() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useScrollScene(section, ({ gsap }, element) => {
    const media = gsap.matchMedia();
    media.add('(min-width: 1024px)', () => {
      const row = track.current;
      if (!row) return;
      const distance = () => Math.max(0, row.scrollWidth - window.innerWidth + 48);
      gsap.to(row, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top 64px',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    });
    return () => media.revert();
  });

  return (
    <section
      ref={section}
      aria-labelledby="treatments-title"
      className="overflow-hidden bg-canvas py-14 md:py-20 lg:flex lg:min-h-[calc(100vh-4rem)] lg:flex-col lg:justify-center lg:py-12"
    >
      <div className="mx-auto mb-8 flex w-full max-w-6xl flex-col gap-3 px-4 md:mb-10 md:flex-row md:items-end md:justify-between md:px-6">
        <div className="flex flex-col gap-2">
          <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
            02 · Treatments
          </p>
          <h2
            id="treatments-title"
            className="font-display text-title font-bold text-balance md:text-display"
          >
            Four specialities, one roof.
          </h2>
        </div>
        <Link
          to="/treatments"
          viewTransition
          className="inline-flex items-center gap-2 font-medium text-brand hover:underline"
        >
          All treatments
          <ArrowRightIcon size={18} aria-hidden />
        </Link>
      </div>

      <ul
        ref={track}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:none] md:scroll-px-6 md:px-6 lg:snap-none lg:gap-6 lg:overflow-visible lg:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
      >
        {treatments.map((treatment, index) => (
          <li
            key={treatment.slug}
            className="group relative w-[78vw] shrink-0 snap-start overflow-hidden rounded-container sm:w-[46vw] lg:w-[26rem]"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <Photo
                photo={treatmentPhotos[treatment.slug] ?? photos.smile}
                sizes="(min-width: 1024px) 26rem, (min-width: 640px) 46vw, 78vw"
                className="block size-full"
                imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            {/* Scrim keeps the caption readable on any photo. */}
            <div className="absolute inset-0 bg-linear-to-t from-scrim/90 via-scrim/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 text-on-scrim md:p-6">
              <span className="font-mono text-small opacity-80">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-title font-bold">{treatment.name}</h3>
              <p className="text-small opacity-90">{treatment.summary}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
