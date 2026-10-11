import {
  ClockIcon,
  MapPinIcon,
  NavigationArrowIcon,
  PhoneIcon,
  WhatsappLogoIcon,
} from '@phosphor-icons/react';
import { useId, useRef } from 'react';

import { Reveal } from '@/components/reveal';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { clinic, clinicTelHref, type DayHours } from '@/config/site';
import { useClinicHours } from '@/lib/clinic-hours';
import { cx } from '@/lib/cx';
import { useNearViewport } from '@/lib/use-near-viewport';

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
const directions = `https://www.google.com/maps/dir/?api=1&destination=${clinic.address.lat},${clinic.address.lng}`;

/**
 * "Visit us": the clinic on a map, its address, this week's hours (today highlighted) and
 * quick actions. The map (a third-party embed) loads only as the section nears the
 * viewport, so it never slows the first paint.
 */
export function ClinicLocation({ tinted = false }: { tinted?: boolean }) {
  const headingId = useId();
  const section = useRef<HTMLElement>(null);
  const near = useNearViewport(section, '50% 0px');
  const hours = useClinicHours();
  const today = new Date().getDay();
  const anyKnown = hours.some((day) => day !== null);

  return (
    <section
      ref={section}
      aria-labelledby={headingId}
      className={cx(tinted && 'border-y border-line bg-surface')}
    >
      <Container className="grid gap-8 py-14 *:min-w-0 md:py-20 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
        <Reveal className="relative order-2 min-h-80 overflow-hidden rounded-4xl border border-line bg-sunken shadow-xl shadow-elevation/10 lg:order-1 lg:min-h-0">
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

        <Reveal step={1} className="order-1 flex flex-col gap-6 lg:order-2">
          <div className="flex flex-col gap-2">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              Visit us
            </p>
            <h2
              id={headingId}
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              Find the clinic.
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

          <div className="flex flex-col gap-3 rounded-3xl border border-line bg-canvas p-4 md:p-5">
            <p className="flex items-center gap-2 font-display font-semibold">
              <ClockIcon size={20} weight="duotone" className="text-brand" aria-hidden />
              Timings
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-small">
              {DAYS.map((day, index) => (
                <div
                  key={day}
                  className={cx(
                    'col-span-2 grid grid-cols-subgrid rounded-control px-2 py-1',
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
            {!anyKnown ? (
              <p className="text-caption text-ink-muted">
                Timings can change on holidays. Please call, or{' '}
                <a
                  href={clinic.address.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand underline-offset-2 hover:underline"
                >
                  see live hours on Google Maps
                </a>
                .
              </p>
            ) : null}
          </div>

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
      </Container>
    </section>
  );
}
