import { CalendarPlusIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { useParams, type LoaderFunctionArgs } from 'react-router';

import { BackButton } from '@/components/back-button';

import { ClosingCta } from '@/components/landing/closing-cta';
import { ImplantStory } from '@/components/landing/implant-story';
import { OrthoStory } from '@/components/landing/ortho-story';
import { Reveal } from '@/components/reveal';
import { LaserSpotlight } from '@/components/sections/laser-spotlight';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { doctors, specialtyIllustration } from '@/content/clinic';
import { photos } from '@/content/photos';
import { DoctorPortrait } from '@/components/sections/doctor-list';
import { BookLink } from '@/components/contact/book-link';
import { vtNames } from '@/lib/transition-names';
import { RevealWords } from '@/components/reveal-words';

/** Unknown doctor slugs become the site's 404 page. */
export function loader({ params }: LoaderFunctionArgs) {
  if (!doctors.some((doctor) => doctor.slug === params.slug)) {
    throw new Response('Not found', { status: 404 });
  }
  return null;
}

/**
 * A doctor's page: who they are, what their speciality treats, and a scroll-driven 3D
 * explainer of it (implants for prosthodontics, straightening for orthodontics).
 */
export default function DoctorPage() {
  const { slug } = useParams();
  const doctor = doctors.find((item) => item.slug === slug)!;
  const isOrtho = doctor.specialty === 'Orthodontics';
  const role = isOrtho ? 'Orthodontist' : 'Prosthodontist';

  return (
    <>
      <section className="relative isolate overflow-clip bg-linear-to-br from-hero-from to-hero-to text-on-hero">
        <Container className="grid items-center gap-8 py-10 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div className="flex flex-col gap-5">
            <BackButton fallback="/" />
            <p className="text-label font-semibold tracking-[0.14em] text-on-hero-muted uppercase">
              {role}
            </p>
            <h1 className="font-display text-[clamp(2.4rem,8vw,4rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance">
              {doctor.name}
            </h1>
            <p className="text-heading font-semibold">{doctor.degree}</p>
            {doctor.fellowship ? (
              <p className="w-fit rounded-full bg-surface/70 px-3 py-1 text-small font-medium text-ink backdrop-blur-sm">
                {doctor.fellowship}
              </p>
            ) : null}
            <p className="max-w-[46ch] text-on-hero-muted">{doctor.focus}.</p>
            <div className="flex flex-wrap gap-3">
              <BookLink className={buttonClass()}>
                <CalendarPlusIcon size={20} aria-hidden />
                Book an appointment
              </BookLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div
              className="relative aspect-4/5 overflow-hidden rounded-t-full rounded-b-4xl border-4 border-surface shadow-2xl shadow-elevation/25"
              style={{ viewTransitionName: vtNames.doctorPhoto(doctor.slug) }}
            >
              <DoctorPortrait doctor={doctor} sizes="(min-width: 768px) 28rem, 90vw" priority />
            </div>
            {/* Speciality illustration floats over the corner, with the doctor's initials. */}
            <div className="float-y absolute -bottom-6 -left-4 grid size-32 place-items-center rounded-full bg-surface shadow-xl shadow-elevation/20 md:-left-10 md:size-40">
              <Photo
                photo={specialtyIllustration(doctor)}
                sizes="160px"
                fit="contain"
                className="block size-[68%]"
              />
            </div>
            <span className="absolute -top-4 -right-2 grid size-16 place-items-center rounded-full bg-brand font-display text-heading font-bold text-on-brand shadow-lg shadow-elevation/20 md:size-20 md:text-title">
              {doctor.initials}
            </span>
          </div>
        </Container>
      </section>

      <section aria-labelledby="specialty-title" className="border-b border-line bg-surface">
        <Container className="grid gap-10 py-14 md:grid-cols-2 md:items-center md:gap-14 md:py-20">
          <Reveal className="flex flex-col gap-5">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              The speciality
            </p>
            <h2
              id="specialty-title"
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              <RevealWords text={`What is ${doctor.specialty.toLowerCase()}?`} />
            </h2>
            <p className="text-ink-muted md:text-heading md:font-normal">{doctor.specialtyIntro}</p>
            <ul className="grid gap-3 pt-2 sm:grid-cols-2">
              {doctor.treats.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-brand"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal step={1}>
            <div className="aspect-4/3 overflow-hidden rounded-4xl">
              <Photo
                photo={isOrtho ? photos.alignerFit : photos.scan}
                sizes="(min-width: 768px) 45vw, 100vw"
                className="block size-full"
                imgClassName="parallax-img"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {isOrtho ? <OrthoStory /> : <ImplantStory eyebrow="Prosthodontics in 3D" />}
      {doctor.fellowship ? <LaserSpotlight /> : null}

      <ClosingCta />
    </>
  );
}
