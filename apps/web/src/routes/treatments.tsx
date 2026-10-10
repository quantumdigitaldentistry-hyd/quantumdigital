import { PageHero } from '@/components/sections/page-hero';
import { PlannedContent } from '@/components/sections/planned-content';
import { Section } from '@/components/sections/section';
import { TreatmentGrid } from '@/components/sections/treatment-grid';

export default function TreatmentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Treatments"
        title="Specialist care for every smile"
        description="Aligners and braces, implants, crowns, dentures, laser dentistry and smile design, planned by specialists."
      />
      <Section title="Our specialities">
        <TreatmentGrid />
      </Section>
      <Section title="More on each treatment" tinted>
        <PlannedContent
          items={[
            'A page for each treatment: who it suits, the steps and the timeline',
            'Before-and-after cases',
            'Costs and payment options',
            'Aftercare',
            'Frequently asked questions',
          ]}
        />
      </Section>
    </>
  );
}
