import { PageHero } from '@/components/sections/page-hero';
import { PlannedContent } from '@/components/sections/planned-content';
import { Section } from '@/components/sections/section';

export default function PatientSafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="Patient safety"
        title="Safe care, explained"
        description="How every visit is kept safe, and what you can do to help."
      />
      <Section title="What this page will cover">
        <PlannedContent
          items={[
            'Sterilisation and instrument handling',
            'Infection control in the clinic',
            'Digital X-rays and radiation safety',
            'Medical history and anaesthesia checks',
            'What to tell us before treatment',
            'Aftercare and when to call us',
          ]}
        />
      </Section>
    </>
  );
}
