import { MapPinIcon, NavigationArrowIcon, PhoneIcon } from '@phosphor-icons/react';
import { useSearchParams } from 'react-router';

import { directions, Timings } from '@/components/contact/clinic-location';
import AppointmentForm from '@/components/contact/appointment-form';
import { PhoneLink } from '@/components/contact/phone-link';
import { PageHero } from '@/components/sections/page-hero';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { clinic } from '@/config/site';
import { treatments } from '@/content/clinic';
import { useQuickActions } from '@/lib/quick-actions';

/**
 * The one place to book. Buttons elsewhere link here, adding `?treatment=<slug>` when
 * they belong to a treatment, so that treatment arrives already chosen.
 */
export default function BookAppointmentPage() {
  const [params] = useSearchParams();
  const show = useQuickActions((s) => s.show);
  const requested = params.get('treatment') ?? '';
  const initialTreatment = treatments.some((treatment) => treatment.slug === requested)
    ? requested
    : '';

  return (
    <>
      <PageHero
        eyebrow="Book an appointment"
        title="Book your visit"
        description="Tell us what you need and when suits you. The front desk calls to confirm the time."
      />
      <Container className="grid gap-8 py-10 md:py-16 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-12">
        <div data-booking className="scroll-mt-24">
          <AppointmentForm initialTreatment={initialTreatment} />
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
          <div className="flex flex-col gap-4 rounded-4xl border border-line bg-surface p-5 md:p-6">
            <span className="grid size-11 place-items-center rounded-control bg-aqua-soft text-on-aqua-soft">
              <PhoneIcon size={24} weight="duotone" aria-hidden />
            </span>
            <h2 className="font-display text-heading font-semibold">Prefer to talk?</h2>
            <p className="text-ink-muted">
              Call the front desk, or leave your number and the clinic will call you back.
            </p>
            <PhoneLink className="font-semibold text-brand" />
            <button
              type="button"
              className={buttonClass('secondary', 'self-start')}
              onClick={() => show('callback')}
            >
              Request a call back
            </button>
          </div>
          <Timings />
          <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-4 shadow-sm md:p-5">
            <p className="flex items-center gap-2 font-display font-semibold">
              <MapPinIcon size={20} weight="duotone" className="text-brand" aria-hidden />
              Visit us
            </p>
            <address className="text-small text-ink-muted not-italic">
              {clinic.address.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-small font-semibold text-brand"
            >
              <NavigationArrowIcon size={18} aria-hidden /> Get directions
            </a>
          </div>
        </aside>
      </Container>
    </>
  );
}
