import { PageHero } from '@/components/sections/page-hero';
import { PlannedContent } from '@/components/sections/planned-content';
import { Section } from '@/components/sections/section';
import { TreatmentGrid } from '@/components/sections/treatment-grid';

export default function TreatmentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Treatments"
        title="All your dental solutions, digitally advanced."
        description="Your complete smile destination: from fillings and cleaning to braces, implants and full mouth rehabilitation, planned by specialists."
      />
      <Section title="Our treatments">
        <TreatmentGrid />
      </Section>
      <Section title="Coming soon" tinted>
        <PlannedContent
          items={[
            'Real before-and-after cases, shared with patient consent',
            'Costs and payment options',
            'Aftercare guides to download',
          ]}
        />
      </Section>
    </>
  );
}
