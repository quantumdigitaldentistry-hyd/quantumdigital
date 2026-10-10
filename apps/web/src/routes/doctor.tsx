import { ArrowLeftIcon, CalendarPlusIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { Link, useParams, type LoaderFunctionArgs } from 'react-router';

import { ClosingCta } from '@/components/landing/closing-cta';
import { ImplantStory } from '@/components/landing/implant-story';
import { OrthoStory } from '@/components/landing/ortho-story';
import { Reveal } from '@/components/reveal';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { doctors, specialtyIllustration } from '@/content/clinic';
import { photos } from '@/content/photos';
import { useQuickActions } from '@/lib/quick-actions';

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
  const show = useQuickActions((s) => s.show);
  const doctor = doctors.find((item) => item.slug === slug)!;
  const isOrtho = doctor.specialty === 'Orthodontics';
  const role = isOrtho ? 'Orthodontist' : 'Prosthodontist';

  return (
    <>
      <section className="relative isolate overflow-hidden bg-linear-to-br from-hero-from to-hero-to text-on-hero">
        <Container className="grid items-center gap-8 py-10 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div className="flex flex-col gap-5">
            <Link
              to="/#doctors"
              viewTransition
              className="inline-flex w-fit items-center gap-2 text-small font-medium text-on-hero-muted hover:text-on-hero"
            >
              <ArrowLeftIcon size={16} aria-hidden />
              All doctors
            </Link>
            <p className="text-label font-semibold tracking-[0.14em] text-on-hero-muted uppercase">
              {role}
            </p>
            <h1 className="font-display text-[clamp(2.4rem,8vw,4rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance">
              {doctor.name}
            </h1>
            <p className="text-heading font-semibold">{doctor.degree}</p>
            <p className="max-w-[46ch] text-on-hero-muted">{doctor.focus}.</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={buttonClass()} onClick={() => show('book')}>
                <CalendarPlusIcon size={20} aria-hidden />
                Book an appointment
              </button>
            </div>
          </div>

          <div className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center md:max-w-md">
            {/* Orbit rings echo the logo; the illustration floats inside. */}
            <div aria-hidden className="absolute inset-0 rounded-full border border-surface/50" />
            <div
              aria-hidden
              className="absolute inset-[12%] rounded-full border border-surface/40"
            />
            <div
              aria-hidden
              className="absolute inset-[18%] rounded-full bg-surface/50 backdrop-blur-sm"
            />
            <Photo
              photo={doctor.portrait ?? specialtyIllustration(doctor)}
              sizes="(min-width: 768px) 24rem, 70vw"
              fit="contain"
              priority
              className="float-y relative block w-[62%]"
            />
            <span className="absolute bottom-[10%] left-[6%] md:right-[6%] md:left-auto grid size-16 place-items-center rounded-full bg-surface font-display text-heading font-bold text-brand shadow-lg shadow-elevation/15 md:size-20 md:text-title">
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
              className="font-display text-title font-bold text-balance md:text-display"
            >
              What is {doctor.specialty.toLowerCase()}?
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

      <ClosingCta />
    </>
  );
}
