import { CalendarPlusIcon, PhoneCallIcon } from '@phosphor-icons/react';

import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { photos } from '@/content/photos';
import { useQuickActions } from '@/lib/quick-actions';

/** Full-bleed clinic photo with a scrim, drifting slowly as it scrolls past. */
export function ClosingCta() {
  const show = useQuickActions((s) => s.show);
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden">
      <Photo
        photo={photos.clinic}
        sizes="100vw"
        className="absolute inset-0 -z-20 block"
        imgClassName="parallax-img"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-scrim/75" />
      <Container className="flex min-h-[70svh] flex-col items-start justify-center gap-6 py-20 text-on-scrim md:min-h-[80vh]">
        <h2
          id="closing-title"
          className="max-w-3xl font-display text-[clamp(2.2rem,7vw,4.5rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance"
        >
          Your smile, planned with care.
        </h2>
        <p className="max-w-[48ch] text-body opacity-90 md:text-heading md:font-normal">
          Book a visit, or leave your number and the clinic will call you back.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={buttonClass()} onClick={() => show('book')}>
            <CalendarPlusIcon size={20} aria-hidden />
            Book appointment
          </button>
          <button
            type="button"
            className={buttonClass('secondary')}
            onClick={() => show('callback')}
          >
            <PhoneCallIcon size={20} aria-hidden />
            Instant call back
          </button>
        </div>
      </Container>
    </section>
  );
}
