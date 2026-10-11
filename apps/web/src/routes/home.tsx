import { FestivalBanner } from '@/components/brand/festival-banner';
import { ClinicLocation } from '@/components/contact/clinic-location';
import { ClosingCta } from '@/components/landing/closing-cta';
import { ImplantStory } from '@/components/landing/implant-story';
import { LandingHero } from '@/components/landing/landing-hero';
import { GalleryPreview, SmileResults } from '@/components/landing/results-and-gallery';
import { TreatmentMarquee } from '@/components/landing/treatment-marquee';
import { TreatmentShowcase } from '@/components/landing/treatment-showcase';
import { VisitJourney } from '@/components/landing/visit-journey';
import { DoctorList } from '@/components/sections/doctor-list';
import { Section } from '@/components/sections/section';

/**
 * Home (the dashboard) as a landing page: interactive 3D logo hero, treatment ticker, the
 * scroll-driven implant story, stacked treatment cards, visit journey, before/after
 * results, gallery, doctors and a closing call to action.
 */
export default function HomePage() {
  return (
    <>
      <LandingHero />
      <FestivalBanner className="py-6 md:py-10" />
      <TreatmentMarquee />
      <ImplantStory />
      <TreatmentShowcase />
      <VisitJourney />
      <SmileResults />
      <GalleryPreview />
      <Section
        id="doctors"
        eyebrow="06 · Doctors"
        title="Specialists who lead your care."
        intro="Postgraduate specialists in the treatments they lead. Open a profile to see their speciality in 3D."
      >
        <DoctorList />
      </Section>
      <ClosingCta />
      <ClinicLocation />
    </>
  );
}
