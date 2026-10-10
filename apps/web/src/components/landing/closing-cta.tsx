import { CheckIcon, PhoneCallIcon } from '@phosphor-icons/react';
import { lazy, Suspense, useRef } from 'react';

import { PhoneLink } from '@/components/contact/phone-link';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { photos } from '@/content/photos';
import { useQuickActions } from '@/lib/quick-actions';
import { useNearViewport } from '@/lib/use-near-viewport';

// The form (and its validation) loads as this section approaches, not on first paint.
const AppointmentForm = lazy(() => import('@/components/contact/appointment-form'));

/** Same footprint as the form, so nothing jumps when it arrives. */
function FormPlaceholder() {
  return (
    <div
      aria-hidden
      className="h-136 rounded-4xl border border-line bg-surface/90 shadow-2xl shadow-elevation/30 sm:h-116"
    />
  );
}

/**
 * Closing section over a clinic photo: why to book, the phone and call-back options, and
 * the appointment request form.
 */
export function ClosingCta() {
  const show = useQuickActions((s) => s.show);
  const section = useRef<HTMLElement>(null);
  const near = useNearViewport(section);

  return (
    <section
      ref={section}
      id="book"
      aria-labelledby="closing-title"
      className="relative isolate scroll-mt-20 overflow-hidden"
    >
      <Photo
        photo={photos.clinic}
        sizes="100vw"
        className="absolute inset-0 -z-20 block"
        imgClassName="parallax-img"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-scrim/80" />
      <Container className="grid gap-10 py-16 text-on-scrim md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
        <div className="flex flex-col gap-6">
          <h2
            id="closing-title"
            className="max-w-3xl font-display text-[clamp(2.2rem,6vw,4rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance"
          >
            Your smile, planned with care.
          </h2>
          <p className="max-w-[44ch] text-body opacity-90 md:text-heading md:font-normal">
            Tell us what you need and when suits you. Prefer to talk? Call the clinic or ask for a
            call back.
          </p>
          <ul className="flex flex-col gap-2.5">
            {[
              'Invisalign provider and implant center',
              'Specialists in orthodontics and prosthodontics',
              'Laser dentistry and smile design',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="grid size-6 place-items-center rounded-full bg-highlight text-on-highlight">
                  <CheckIcon size={14} weight="bold" aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className={buttonClass('secondary')}
              onClick={() => show('callback')}
            >
              <PhoneCallIcon size={20} aria-hidden />
              Instant call back
            </button>
            <PhoneLink />
          </div>
        </div>
        {near ? (
          <Suspense fallback={<FormPlaceholder />}>
            <AppointmentForm />
          </Suspense>
        ) : (
          <FormPlaceholder />
        )}
      </Container>
    </section>
  );
}
