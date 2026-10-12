import { FestivalBanner } from '@/components/brand/festival-experience';
import { ClinicLocation } from '@/components/contact/clinic-location';
import { LandingHero } from '@/components/landing/landing-hero';
import { PatientReviews } from '@/components/landing/patient-reviews';
import { GalleryPreview, SmileResults } from '@/components/landing/results-and-gallery';
import { TreatmentMarquee } from '@/components/landing/treatment-marquee';
import { TreatmentShowcase } from '@/components/landing/treatment-showcase';
import { VisitJourney } from '@/components/landing/visit-journey';
import { DoctorList } from '@/components/sections/doctor-list';
import { Section } from '@/components/sections/section';

/**
 * Home (the dashboard) as a landing page: 3D logo hero, treatment ticker, a grid of
 * treatment cards, visit journey, before/after results, patient reviews, gallery, doctors
 * and the clinic location. The implant story lives on the implants treatment page.
 */
export default function HomePage() {
  return (
    <>
      <LandingHero />
      <FestivalBanner className="py-6 md:py-10" />
      <TreatmentMarquee />
      <TreatmentShowcase />
      <VisitJourney />
      <SmileResults />
      <PatientReviews />
      <GalleryPreview />
      <Section
        id="doctors"
        eyebrow="06 · Doctors"
        title="Specialists who lead your care."
        intro="Postgraduate specialists in the treatments they lead. Open a profile to see their speciality in 3D."
      >
        <DoctorList />
      </Section>
      <ClinicLocation backdrop />
    </>
  );
}
