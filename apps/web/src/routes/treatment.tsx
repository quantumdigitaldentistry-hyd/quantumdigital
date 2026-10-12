import { ArrowUpRightIcon, CalendarPlusIcon, CheckIcon, InfoIcon } from '@phosphor-icons/react';
import { useRef, type CSSProperties } from 'react';
import { Link, useParams, type LoaderFunctionArgs } from 'react-router';

import { BackButton } from '@/components/back-button';
import { DepthField } from '@/components/fx/depth-field';
import { ResultsShowcase } from '@/components/gallery/results-showcase';
import { ClosingCta } from '@/components/landing/closing-cta';
import { ImplantStory } from '@/components/landing/implant-story';
import { OrthoStory } from '@/components/landing/ortho-story';
import { Reveal } from '@/components/reveal';
import { FaqSection } from '@/components/sections/faq-section';
import { FeatureGrid } from '@/components/sections/feature-grid';
import { Section } from '@/components/sections/section';
import { StepList } from '@/components/sections/step-list';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { BookLink } from '@/components/contact/book-link';
import { demoCasesFor, leadDoctor, treatments } from '@/content/clinic';
import { treatmentDetails } from '@/content/treatment-details';
import { useLiveResults } from '@/lib/live-content';
import { usePointerParallax } from '@/lib/use-pointer-fx';
import { vtNames } from '@/lib/transition-names';

/** Unknown treatment slugs become the site's 404 page. */
export function loader({ params }: LoaderFunctionArgs) {
  if (!treatments.some((treatment) => treatment.slug === params.slug)) {
    throw new Response('Not found', { status: 404 });
  }
  return null;
}

export default function TreatmentPage() {
  const { slug } = useParams();
  const treatment = treatments.find((item) => item.slug === slug)!;
  const live = useLiveResults(treatment.slug).data ?? [];
  // Every treatment shows a before/after: real cases once the clinic adds them, a demo until then.
  const cases = live.length ? live : demoCasesFor(treatment);
  const others = treatments.filter((item) => item.slug !== treatment.slug);
  const doctor = leadDoctor(treatment);
  const details = treatmentDetails[treatment.slug];
  const label = treatment.shortName ?? treatment.name;
  const hero = useRef<HTMLElement>(null);
  usePointerParallax(hero);

  return (
    <>
      <div
        aria-hidden
        className="read-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-brand"
      />
      <section
        ref={hero}
        className="relative isolate overflow-hidden bg-linear-to-br from-hero-from to-hero-to text-on-hero"
      >
        <DepthField className="-z-10" density={0.9} />
        <Container className="grid items-center gap-10 py-8 md:grid-cols-[1.05fr_1fr] md:py-16">
          <div className="hero-exit flex flex-col gap-5">
            <BackButton fallback="/treatments" />
            <p
              className="enter text-label font-semibold tracking-[0.14em] text-on-hero-muted uppercase"
              style={{ '--d': 0 } as CSSProperties}
            >
              Treatment
            </p>
            <h1
              style={{ viewTransitionName: vtNames.treatmentTitle(treatment.slug) }}
              className="w-fit font-display text-[clamp(2.4rem,8vw,4rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance"
            >
              {treatment.name}
            </h1>
            <p
              className="enter max-w-[46ch] text-on-hero-muted md:text-heading md:font-normal"
              style={{ '--d': 1 } as CSSProperties}
            >
              {treatment.summary}
            </p>
            <ul className="enter flex flex-wrap gap-2" style={{ '--d': 2 } as CSSProperties}>
              {treatment.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 rounded-full bg-surface/70 px-3 py-1.5 text-small font-medium text-ink backdrop-blur-sm"
                >
                  <CheckIcon size={14} weight="bold" className="text-brand" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <BookLink
              className={buttonClass('primary', 'enter w-fit')}
              style={{ '--d': 3 } as CSSProperties}
              treatment={treatment.slug}
            >
              <CalendarPlusIcon size={20} aria-hidden />
              Book a consultation
            </BookLink>
          </div>

          <div className="hero-exit relative mx-auto w-full max-w-md">
            <div
              style={{ viewTransitionName: vtNames.treatmentPhoto(treatment.slug) }}
              className="depth-1 aspect-4/5 overflow-hidden rounded-4xl shadow-2xl shadow-elevation/25"
            >
              <Photo
                photo={treatment.photo}
                sizes="(min-width: 768px) 28rem, 90vw"
                priority
                className="block size-full"
                imgClassName="parallax-img"
              />
            </div>
            {/* The treatment's illustration floats over the photo's corner. */}
            <div
              className="depth-3 float-y absolute -bottom-6 -left-4 grid size-32 place-items-center rounded-full bg-surface shadow-xl shadow-elevation/20 md:-left-10 md:size-40"
              style={{ viewTransitionName: vtNames.treatmentIllustration(treatment.slug) }}
            >
              <Photo
                photo={treatment.illustration}
                sizes="160px"
                fit="contain"
                className="block size-[70%]"
              />
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="about-title" className="border-b border-line bg-surface">
        <Container className="grid gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:py-24">
          <Reveal className="flex flex-col gap-4">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              How it works
            </p>
            <h2
              id="about-title"
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              What to expect.
            </h2>
            <p className="text-ink-muted md:text-heading md:font-normal">{treatment.intro}</p>
            {doctor ? (
              <Link
                to={`/doctors/${doctor.slug}`}
                viewTransition
                className="group flex w-fit items-center gap-3 rounded-full border border-line bg-canvas py-1.5 pr-4 pl-1.5 transition-colors hover:border-aqua"
              >
                <span className="grid size-10 place-items-center rounded-full bg-brand font-display text-small font-semibold text-on-brand">
                  {doctor.initials}
                </span>
                <span className="flex flex-col">
                  <span className="text-caption text-ink-muted">
                    Led by our {doctor.specialty.toLowerCase()} specialist
                  </span>
                  <span className="font-medium">{doctor.name}</span>
                </span>
                <ArrowUpRightIcon
                  size={16}
                  aria-hidden
                  className="text-brand transition-transform duration-300 group-hover:rotate-45"
                />
              </Link>
            ) : null}
          </Reveal>
          <StepList steps={treatment.steps} />
        </Container>
      </section>

      {details ? (
        <>
          <Section eyebrow="Why choose it" title={`${label}: why patients choose it.`}>
            <FeatureGrid features={details.benefits} columns={4} />
          </Section>
          <Section
            eyebrow="Treatment options"
            title="What we offer."
            intro="Your specialist recommends the option that suits your teeth, health and goals."
            tinted
          >
            <FeatureGrid
              features={details.options.map((option, index) => ({
                ...option,
                kicker: String(index + 1).padStart(2, '0'),
              }))}
              columns={details.options.length === 4 ? 4 : 3}
            />
          </Section>
        </>
      ) : null}

      {treatment.slug === 'implants' ? <ImplantStory eyebrow="Implants in 3D" /> : null}
      {treatment.slug === 'aligners' || treatment.slug === 'braces' ? (
        <OrthoStory eyebrow="Straightening in 3D" />
      ) : null}

      {cases.length ? (
        <section aria-labelledby="cases-title" className="bg-canvas">
          <Container className="grid gap-10 py-16 *:min-w-0 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-14 md:py-24">
            <Reveal className="flex flex-col gap-4">
              <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
                Before and after
              </p>
              <h2
                id="cases-title"
                className="heading-3d font-display text-title font-bold text-balance md:text-display"
              >
                {treatment.name} results.
              </h2>
              {live.length ? (
                <p className="text-ink-muted">Real cases, shared with each patient’s consent.</p>
              ) : (
                <p className="flex items-start gap-2 rounded-control bg-highlight-soft p-3 text-small text-on-highlight-soft">
                  <InfoIcon size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
                  Demo cases until the clinic adds real ones, shared with patient consent.
                </p>
              )}
            </Reveal>
            <Reveal step={1}>
              <ResultsShowcase cases={cases} />
            </Reveal>
          </Container>
        </section>
      ) : null}

      {details ? (
        <FaqSection
          title={`${label}: your questions, answered.`}
          intro="General information. Your specialist will advise on your own case."
          faqs={details.faqs}
        />
      ) : null}

      <section
        aria-labelledby="others-title"
        className="overflow-x-clip border-t border-line bg-surface"
      >
        <Container className="flex flex-col gap-6 py-14 md:py-20">
          <h2 id="others-title" className="heading-3d font-display text-title font-bold">
            Other treatments
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {others.map((item, index) => (
              <li key={item.slug} className={index % 2 ? 'slide-in-end' : 'slide-in-start'}>
                <Link
                  to={`/treatments/${item.slug}`}
                  viewTransition
                  className="group flex items-center gap-3 rounded-container border border-line bg-canvas p-4 transition-[border-color,translate] duration-300 hover:-translate-y-1 hover:border-aqua"
                >
                  <span
                    className="grid size-14 shrink-0 place-items-center rounded-full bg-aqua-soft"
                    style={{ viewTransitionName: vtNames.treatmentIllustration(item.slug) }}
                  >
                    <Photo
                      photo={item.illustration}
                      sizes="56px"
                      fit="contain"
                      className="block size-[70%]"
                    />
                  </span>
                  <span className="flex-1 font-display font-semibold">{item.name}</span>
                  <ArrowUpRightIcon
                    size={18}
                    aria-hidden
                    className="text-brand transition-transform duration-300 group-hover:rotate-45"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <ClosingCta />
    </>
  );
}
