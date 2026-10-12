import {
  CalendarPlusIcon,
  ClipboardTextIcon,
  StethoscopeIcon,
  SquaresFourIcon,
  VideoCameraIcon,
} from '@phosphor-icons/react';

import { ClosingCta } from '@/components/landing/closing-cta';
import { Reveal } from '@/components/reveal';
import { FaqSection, type Faq } from '@/components/sections/faq-section';
import { FeatureGrid, type Feature } from '@/components/sections/feature-grid';
import { MediaHero } from '@/components/sections/media-hero';
import { Section } from '@/components/sections/section';
import { StepList, type Step } from '@/components/sections/step-list';
import { TreatmentGrid } from '@/components/sections/treatment-grid';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { BookLink } from '@/components/contact/book-link';
import { treatments } from '@/content/clinic';
import { photos } from '@/content/photos';
import { RevealWords } from '@/components/reveal-words';

const reasons: Feature[] = [
  {
    title: 'Specialist-led care',
    body: 'Your treatment is planned by MDS specialists in orthodontics and prosthodontics.',
    Icon: StethoscopeIcon,
  },
  {
    title: 'Planned before you travel',
    body: 'Share your photos and X-rays first, so you arrive with a clear plan and a realistic timeline.',
    Icon: VideoCameraIcon,
  },
  {
    title: 'Several treatments, one clinic',
    body: 'Aligners, implants, crowns, dentures and laser dentistry, coordinated by one team.',
    Icon: SquaresFourIcon,
  },
  {
    title: 'Clear records to take home',
    body: 'You leave with your treatment notes and aftercare instructions for your dentist at home.',
    Icon: ClipboardTextIcon,
  },
];

// TODO(clinic): confirm remote consultations and what help is offered with travel.
const steps: Step[] = [
  {
    title: 'Remote consultation',
    body: 'Send us your photos, any recent X-rays and what you would like to change. We arrange a phone or video call to talk it through.',
  },
  {
    title: 'Your plan and estimate',
    body: 'Your specialist suggests a treatment plan, the number of visits and an estimated cost. The final plan is confirmed after an examination in person.',
  },
  {
    title: 'Plan your trip',
    body: 'Choose your dates around the appointments. We let you know how long to stay and whether a second trip is needed.',
  },
  {
    title: 'Treatment at the clinic',
    body: 'You are examined, the plan is confirmed with you, and treatment begins. Each step is explained before it starts.',
  },
  {
    title: 'Aftercare at home',
    body: 'You go home with your records and aftercare instructions, and can reach us by phone or video with questions.',
  },
];

const faqs: Faq[] = [
  {
    question: 'How much will my treatment cost?',
    answer:
      'It depends on what you need. After you share photos and X-rays we can give an estimate; the final plan and cost are confirmed after we examine you at the clinic.',
  },
  {
    question: 'How do I know the treatment quality is good?',
    answer:
      'Your treatment is planned and carried out by MDS specialists. Ask us about the materials and implant systems we use; we are happy to explain the options and why we recommend one.',
  },
  {
    question: 'How long will I need to stay?',
    answer:
      'It depends on the treatment. Some, like crowns, can be finished in a single visit of several days. Implants usually need two trips a few months apart, so the bone can heal around the implant. We give you a timeline before you book travel.',
  },
  {
    question: 'What happens if I need help after I go home?',
    answer:
      'You leave with your treatment records and aftercare instructions, and you can contact us by phone or video. For anything urgent, see a local dentist and share your records with them.',
  },
  {
    question: 'How do I pay?',
    answer:
      'The clinic confirms accepted payment methods when your plan is agreed. Please ask us before you travel.',
  },
];

// The treatments that suit travelling patients best, in this order.
const travelTreatments = [
  'implants',
  'full-mouth-rehabilitation',
  'veneers',
  'smile-design',
  'aligners',
  'crowns-bridges',
]
  .map((slug) => treatments.find((treatment) => treatment.slug === slug))
  .filter((treatment) => treatment !== undefined);

export default function DentalTourismPage() {
  return (
    <>
      <MediaHero
        eyebrow="Dental tourism"
        title="Treatment in Hyderabad, planned before you fly."
        description="Talk to our specialists from home, arrive with a clear plan, and go back with a smile you are happy with."
        photo={photos.charminar}
        inset={photos.planeWindow}
      >
        <BookLink className={buttonClass('primary')}>
          <CalendarPlusIcon size={20} aria-hidden />
          Plan a consultation
        </BookLink>
      </MediaHero>

      <section aria-labelledby="intro-title" className="bg-surface">
        <Container className="grid items-center gap-10 py-14 md:grid-cols-2 md:gap-14 md:py-24">
          <Reveal className="overflow-hidden rounded-4xl shadow-xl shadow-elevation/20">
            <Photo
              photo={photos.charminarCity}
              sizes="(min-width: 768px) 45vw, 92vw"
              className="block aspect-16/10"
              imgClassName="parallax-img"
            />
          </Reveal>
          <Reveal step={1} className="flex flex-col gap-4">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              Why travel for dental care
            </p>
            <h2
              id="intro-title"
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              <RevealWords text={'Specialist care, without the guesswork.'} />
            </h2>
            <p className="text-ink-muted md:text-heading md:font-normal">
              Many patients from other cities and countries combine treatment with a visit to family
              or a trip to Hyderabad. The key is planning: knowing what you need, how long it takes
              and what it costs before you book a ticket.
            </p>
            <p className="text-ink-muted">
              We start with a remote consultation, so you only travel once you have a plan.
            </p>
          </Reveal>
        </Container>
      </section>

      <Section
        eyebrow="Why plan it with us"
        title="What you can expect."
        intro="Honest planning first, treatment second."
        tinted
      >
        <FeatureGrid features={reasons} columns={4} />
      </Section>

      <section aria-labelledby="steps-title">
        <Container className="grid gap-10 py-14 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:py-24">
          <Reveal className="flex flex-col gap-5 md:sticky md:top-28 md:self-start">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              How it works
            </p>
            <h2
              id="steps-title"
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              <RevealWords text={'Five steps, from home to home.'} />
            </h2>
            <div className="overflow-hidden rounded-4xl shadow-xl shadow-elevation/20">
              <Photo
                photo={photos.videoConsult}
                sizes="(min-width: 768px) 40vw, 92vw"
                className="block aspect-4/3"
              />
            </div>
          </Reveal>
          <StepList steps={steps} tone="surface" />
        </Container>
      </section>

      <Section
        eyebrow="Popular with travelling patients"
        title="Treatments to plan around a trip."
        intro="Each one is explained on its own page, with the steps and what to expect."
        tinted
      >
        <TreatmentGrid items={travelTreatments} />
      </Section>

      <FaqSection
        title="Planning your trip."
        intro="Something else on your mind? Ask our assistant, or call the clinic."
        faqs={faqs}
        aside={
          <div className="overflow-hidden rounded-4xl">
            <Photo photo={photos.airport} sizes="35vw" className="block aspect-4/3" />
          </div>
        }
      />

      <ClosingCta
        title="Start with a conversation."
        body="Tell us what you need and when you might travel. We will reply with the next steps."
      />
    </>
  );
}
