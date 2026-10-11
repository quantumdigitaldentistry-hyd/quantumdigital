import {
  CalendarPlusIcon,
  ChatsCircleIcon,
  CubeFocusIcon,
  FirstAidKitIcon,
  GraduationCapIcon,
  HandHeartIcon,
} from '@phosphor-icons/react';
import { Link } from 'react-router';

import { ClosingCta } from '@/components/landing/closing-cta';
import { DoctorList } from '@/components/sections/doctor-list';
import { FeatureGrid, type Feature } from '@/components/sections/feature-grid';
import { MediaHero } from '@/components/sections/media-hero';
import { Section } from '@/components/sections/section';
import { buttonClass } from '@/components/ui/button-class';
import { clinic } from '@/config/site';
import { treatments } from '@/content/clinic';
import { photos } from '@/content/photos';
import { bookingPath } from '@/lib/booking';

// Only what the clinic actually does; no invented numbers, awards or testimonials.
const values: Feature[] = [
  {
    kicker: '01',
    title: 'Led by specialists',
    body: 'An orthodontist and a prosthodontist, both with postgraduate MDS degrees, lead the treatments in their own speciality.',
    Icon: GraduationCapIcon,
  },
  {
    kicker: '02',
    title: 'Planned before we begin',
    body: 'Your treatment is planned with digital records, and smile changes are previewed with you before any tooth is touched.',
    Icon: CubeFocusIcon,
  },
  {
    kicker: '03',
    title: 'Explained in plain words',
    body: 'Your specialist talks you through the options, the number of visits and the cost before treatment starts.',
    Icon: ChatsCircleIcon,
  },
  {
    kicker: '04',
    title: 'Safe and comfortable',
    body: 'Sterilised instruments, clean rooms and a calm pace, so every visit feels unhurried.',
    Icon: FirstAidKitIcon,
  },
];

export default function AboutPage() {
  return (
    <>
      <MediaHero
        eyebrow="About us"
        title="Specialist dentistry, planned around you."
        description={`${clinic.name} is a specialist-led dental clinic in Hyderabad, bringing orthodontics, implants and smile design together under one roof.`}
        photo={photos.consult}
        inset={photos.receptionLounge}
      >
        <Link className={buttonClass('primary')} to={bookingPath()} viewTransition>
          <CalendarPlusIcon size={20} aria-hidden />
          Book a visit
        </Link>
        <Link className={buttonClass('secondary')} to="/studio" viewTransition>
          See the studio
        </Link>
      </MediaHero>

      <Section
        eyebrow="How we work"
        title="Care you can understand."
        intro="Four things you can expect at every visit."
      >
        <FeatureGrid features={values} columns={4} />
      </Section>

      <Section
        eyebrow="Our doctors"
        title="Specialists who lead your care."
        intro="Open a profile to learn about each speciality and the treatments it covers."
        tinted
      >
        <DoctorList />
      </Section>

      <Section
        eyebrow="What we treat"
        title={`${treatments.length} treatments, one clinic.`}
        intro="From a cleaning to a full mouth rehabilitation, without being sent elsewhere."
      >
        <ul className="flex flex-wrap gap-2">
          {treatments.map((treatment) => (
            <li key={treatment.slug}>
              <Link
                to={`/treatments/${treatment.slug}`}
                viewTransition
                className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-small font-medium transition-colors hover:border-brand hover:text-brand"
              >
                {treatment.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex items-start gap-2 text-small text-ink-muted">
          <HandHeartIcon size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          Visiting from another city or country? See how we plan{' '}
          <Link to="/dental-tourism" viewTransition className="font-medium text-brand">
            treatment around your trip
          </Link>
          .
        </p>
      </Section>

      <ClosingCta
        title="Meet us in person."
        body="Book a visit or a consultation. Prefer to talk first? Call the clinic or ask for a call back."
      />
    </>
  );
}
