import {
  ClockIcon,
  MapPinIcon,
  NavigationArrowIcon,
  PhoneIcon,
  WhatsappLogoIcon,
} from '@phosphor-icons/react';
import { lazy, Suspense, useId, useRef } from 'react';

import { Reveal } from '@/components/reveal';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { clinic, clinicTelHref, type DayHours } from '@/config/site';
import { photos } from '@/content/photos';
import { useClinicHours } from '@/lib/clinic-hours';
import { cx } from '@/lib/cx';
import { useNearViewport } from '@/lib/use-near-viewport';
import { RevealWords } from '@/components/reveal-words';

// The form (and its validation) loads as this section approaches, not on first paint.
const AppointmentForm = lazy(() => import('@/components/contact/appointment-form'));

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const time = (value: string) => {
  const [h = 0, m = 0] = value.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
};

const describe = (hours: DayHours) =>
  hours === 'closed'
    ? 'Closed'
    : hours
      ? `${time(hours.open)} – ${time(hours.close)}`
      : 'Call to confirm';

const mapEmbed = `https://www.google.com/maps?q=${clinic.address.lat},${clinic.address.lng}(${encodeURIComponent(clinic.name)})&z=17&output=embed`;
export const directions = `https://www.google.com/maps/dir/?api=1&destination=${clinic.address.lat},${clinic.address.lng}`;

/** Holds the form's place while it loads: the same height (measured), so nothing jumps. */
function FormPlaceholder() {
  return (
    <div
      aria-hidden
      className="h-254 rounded-4xl border border-line bg-surface shadow-xl shadow-elevation/10 sm:h-216 lg:h-223 xl:h-216"
    />
  );
}

/** This week's timings, today highlighted. */
export function Timings() {
  const hours = useClinicHours();
  const today = new Date().getDay();
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-4 shadow-sm md:p-5">
      <p className="flex items-center gap-2 font-display font-semibold">
        <ClockIcon size={20} weight="duotone" className="text-brand" aria-hidden />
        Timings
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-small">
        {DAYS.map((day, index) => (
          <div
            key={day}
            className={cx(
              'col-span-2 grid grid-cols-subgrid rounded-control px-2 py-1.5',
              index === today && 'bg-brand-soft font-semibold text-on-brand-soft',
            )}
          >
            <dt>
              {day}
              {index === today ? <span className="sr-only"> (today)</span> : null}
            </dt>
            <dd className={cx('text-right', hours[index] === null && 'text-ink-muted')}>
              {describe(hours[index] ?? null)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-caption text-ink-muted">
        Timings can change on festivals and holidays. Please call, or{' '}
        <a
          href={clinic.address.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand underline-offset-2 hover:underline"
        >
          check Google Maps
        </a>
        .
      </p>
    </div>
  );
}

/**
 * "Visit or book": the map with this week's timings under it, and beside them the
 * address, quick actions and the appointment form. The map (a third-party embed) and the
 * form load only as the section nears the viewport, so neither slows the first paint.
 * `backdrop`: the clinic's reception lounge behind it all, softened under a veil of the
 * page colour so the text and cards stay crisp (home page).
 */
export function ClinicLocation({
  tinted = false,
  backdrop = false,
}: {
  tinted?: boolean;
  backdrop?: boolean;
}) {
  const headingId = useId();
  const section = useRef<HTMLElement>(null);
  const near = useNearViewport(section, '50% 0px');

  return (
    <section
      ref={section}
      id="book"
      data-booking
      aria-labelledby={headingId}
      className={cx(
        'scroll-mt-20',
        tinted && 'border-y border-line bg-surface',
        backdrop && 'relative isolate overflow-clip',
      )}
    >
      {backdrop ? (
        <div aria-hidden className="absolute inset-0 -z-10">
          <Photo
            photo={photos.receptionLounge}
            sizes="100vw"
            className="block size-full"
            imgClassName="scale-105 blur-[1px]"
          />
          {/* Veil: fades into the page at the top and bottom edges, light in between so the
              room shows; the heading side gets a little more for contrast. */}
          <div className="absolute inset-0 bg-linear-to-b from-canvas via-canvas/45 to-canvas" />
          <div className="absolute inset-0 bg-linear-to-l from-canvas/75 via-canvas/20 to-transparent" />
        </div>
      ) : null}
      <Container className="grid gap-8 py-14 *:min-w-0 md:py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        {/* Left: map, timings under it. */}
        <div className="order-2 flex flex-col gap-5 lg:sticky lg:top-24 lg:order-1 lg:self-start">
          <Reveal className="relative aspect-4/3 overflow-hidden rounded-4xl border border-line bg-sunken shadow-xl shadow-elevation/10">
            {near ? (
              <iframe
                title={`Map showing ${clinic.name}`}
                src={mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-ink-subtle">
                <MapPinIcon size={40} weight="duotone" aria-hidden />
              </div>
            )}
          </Reveal>
          <Reveal step={1}>
            <Timings />
          </Reveal>
        </div>

        {/* Right: where we are, quick actions, then the booking form. */}
        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <Reveal className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
                Visit or book
              </p>
              <h2
                id={headingId}
                className="heading-3d font-display text-title font-bold text-balance md:text-display"
              >
                <RevealWords text={'Find the clinic.'} />
              </h2>
            </div>
            <address className="flex gap-3 not-italic">
              <MapPinIcon
                size={22}
                weight="duotone"
                className="mt-0.5 shrink-0 text-brand"
                aria-hidden
              />
              <span className="flex flex-col text-ink-muted">
                <span className="font-medium text-ink">{clinic.name}</span>
                {clinic.address.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            </address>
            <div className="flex flex-wrap gap-3">
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass('primary')}
              >
                <NavigationArrowIcon size={20} aria-hidden />
                Directions
              </a>
              {clinicTelHref ? (
                <a href={clinicTelHref} className={buttonClass('secondary')}>
                  <PhoneIcon size={20} aria-hidden />
                  {clinic.phone.display}
                </a>
              ) : null}
              <a
                href={clinic.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass('secondary')}
              >
                <WhatsappLogoIcon size={20} aria-hidden />
                WhatsApp
              </a>
            </div>
          </Reveal>
          <Reveal step={1}>
            {near ? (
              <Suspense fallback={<FormPlaceholder />}>
                <AppointmentForm />
              </Suspense>
            ) : (
              <FormPlaceholder />
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
