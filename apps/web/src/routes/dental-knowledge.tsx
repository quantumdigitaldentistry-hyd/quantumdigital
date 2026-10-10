import { PageHero } from '@/components/sections/page-hero';
import { PlannedContent } from '@/components/sections/planned-content';
import { Section } from '@/components/sections/section';

export default function DentalKnowledgePage() {
  return (
    <>
      <PageHero
        eyebrow="Dental knowledge"
        title="Clear answers about your teeth"
        description="Short, practical guides written by the clinic's dentists."
      />
      <Section title="Guides on the way">
        <PlannedContent
          items={[
            'Brushing and flossing, done right',
            "Children's dental care",
            'Keeping gums healthy',
            'Aligners or braces: how to choose',
            'Living with dental implants',
            'Common dental myths',
          ]}
        />
      </Section>
    </>
  );
}
