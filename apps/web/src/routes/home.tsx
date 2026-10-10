import { ClosingCta } from '@/components/landing/closing-cta';
import { ImplantStory } from '@/components/landing/implant-story';
import { LandingHero } from '@/components/landing/landing-hero';
import { TreatmentMarquee } from '@/components/landing/treatment-marquee';
import { TreatmentShowcase } from '@/components/landing/treatment-showcase';
import { VisitJourney } from '@/components/landing/visit-journey';
import { DoctorList } from '@/components/sections/doctor-list';
import { Section } from '@/components/sections/section';

/**
 * Home (the dashboard) as a landing page: 3D hero, treatment ticker, the scroll-driven
 * implant story, treatment showcase, visit journey, doctors, closing call to action.
 */
export default function HomePage() {
  return (
    <>
      <LandingHero />
      <TreatmentMarquee />
      <ImplantStory />
      <TreatmentShowcase />
      <VisitJourney />
      <Section
        eyebrow="04 · Doctors"
        title="Specialists who lead your care."
        intro="Postgraduate specialists in the treatments they lead."
      >
        <DoctorList />
      </Section>
      <ClosingCta />
    </>
  );
}
