import { Reveal } from '@/components/reveal';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { photos } from '@/content/photos';

// TODO(clinic): review this copy with the doctors so it matches how the clinic works.
const steps = [
  {
    title: 'Consultation',
    body: 'Talk through what bothers you, your medical history and what you would like to change.',
  },
  {
    title: 'Digital records',
    body: 'Photos, X-rays and scans show the full picture before anything is decided.',
  },
  {
    title: 'Your plan',
    body: 'The options, the number of visits and the cost, explained so you can choose with confidence.',
  },
  {
    title: 'Treatment',
    body: 'Care from the specialist for your treatment, at a pace that suits you.',
  },
  {
    title: 'Aftercare',
    body: 'Follow-up visits and reminders help your results last.',
  },
];

/** Five-step visit, with a progress line that fills as the steps scroll past. */
export function VisitJourney() {
  return (
    <section aria-labelledby="journey-title" className="border-y border-line bg-surface">
      <Container className="grid gap-10 py-14 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-2">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              03 · Your visit
            </p>
            <h2
              id="journey-title"
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              From first visit to final smile.
            </h2>
          </div>
          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            <div className="aspect-4/3 overflow-hidden rounded-container">
              <Photo
                photo={photos.consult}
                sizes="(min-width: 1024px) 26vw, 58vw"
                className="block size-full"
                imgClassName="parallax-img"
              />
            </div>
            <div className="mt-10 aspect-3/4 overflow-hidden rounded-container">
              <Photo
                photo={photos.xray}
                sizes="(min-width: 1024px) 18vw, 40vw"
                className="block size-full"
                imgClassName="parallax-img"
              />
            </div>
          </div>
        </div>

        <div className="journey-timeline relative pl-12">
          {/* Track and fill of the progress line. */}
          <span aria-hidden className="absolute top-2 bottom-2 left-[15px] w-0.5 bg-line" />
          <span
            aria-hidden
            className="line-fill absolute top-2 bottom-2 left-[15px] w-0.5 bg-brand"
          />
          <ol className="flex flex-col gap-10 md:gap-14">
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                <span
                  aria-hidden
                  className="absolute top-0 -left-12 grid size-8 place-items-center rounded-full border-2 border-brand bg-surface font-mono text-small font-medium text-brand"
                >
                  {index + 1}
                </span>
                <Reveal className="flex flex-col gap-2">
                  <h3 className="font-display text-heading font-semibold md:text-title">
                    {step.title}
                  </h3>
                  <p className="max-w-[48ch] text-ink-muted">{step.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
