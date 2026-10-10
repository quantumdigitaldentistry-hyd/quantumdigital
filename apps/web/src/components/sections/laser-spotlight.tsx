import {
  ArrowRightIcon,
  DropIcon,
  FirstAidKitIcon,
  ShieldCheckIcon,
  SunIcon,
} from '@phosphor-icons/react';
import { useId } from 'react';
import { Link } from 'react-router';

import { Reveal } from '@/components/reveal';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { doctors } from '@/content/clinic';
import { laserPhotos } from '@/content/photos';

const PRODUCT_URL = 'https://novolase.in/products/novolase-gold';

// Figures from the manufacturer's product page.
const specs = [
  { value: '2', label: 'Wavelengths in one beam: 810 + 650 nm' },
  { value: '20+', label: 'Preset treatment protocols' },
  { value: '7″', label: 'Touchscreen control' },
  { value: 'Single-use', label: 'Fibre tips, fresh for every patient' },
];

const benefits = [
  {
    Icon: DropIcon,
    title: 'Less bleeding, fewer stitches',
    body: 'The 810 nm beam seals small blood vessels as it works, so many gum procedures heal without sutures.',
  },
  {
    Icon: FirstAidKitIcon,
    title: 'Gentle gum and implant care',
    body: 'Used to clean infected gum pockets and the gum around implants alongside a deep clean.',
  },
  {
    Icon: SunIcon,
    title: 'Light therapy for healing',
    body: 'Low-level red light (650 nm) is used to ease mouth ulcers and soreness and support healing.',
  },
  {
    Icon: ShieldCheckIcon,
    title: 'Safety built in',
    body: 'An emergency stop, hands-free foot control and a fresh tip for every patient.',
  },
];

// The doctor with laser training (Fellowship in Laser Dentistry).
const laserDoctor = doctors.find((doctor) => doctor.fellowship)!;

/**
 * The clinic's laser, NovoLase Gold: product photos on a dark stage (they're shot on
 * black), what the two wavelengths do, and what that means for patients. Used on the
 * studio page and the laser-trained doctor's page.
 */
export function LaserSpotlight({
  link = false,
}: {
  /** Show a link to the laser-trained doctor's page. */ link?: boolean;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="relative isolate overflow-hidden bg-scrim text-on-scrim"
    >
      {/* Warm glow behind the unit, echoing the gold product lighting. */}
      <div
        aria-hidden
        className="absolute top-1/2 left-[22%] -z-10 size-[42rem] -translate-1/2 rounded-full bg-highlight/10 blur-3xl"
      />
      <Container className="grid items-center gap-12 py-16 *:min-w-0 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:py-24">
        <Reveal className="mx-auto flex w-full max-w-md flex-col gap-3">
          <Photo
            photo={laserPhotos.unit}
            sizes="(min-width: 768px) 28rem, 90vw"
            className="block aspect-4/5 overflow-hidden rounded-4xl ring-1 ring-on-scrim/10"
          />
          <div className="grid grid-cols-2 gap-3">
            {[laserPhotos.screen, laserPhotos.pedal].map((detail) => (
              <Photo
                key={detail.fallback}
                photo={detail}
                sizes="(min-width: 768px) 14rem, 45vw"
                className="block aspect-8/7 overflow-hidden rounded-2xl ring-1 ring-on-scrim/10"
              />
            ))}
          </div>
        </Reveal>

        <div className="flex flex-col gap-8">
          <Reveal step={1} className="flex flex-col gap-4">
            <p className="text-label font-semibold tracking-[0.14em] text-highlight uppercase">
              Our technology
            </p>
            <h2
              id={headingId}
              className="font-display text-title font-bold text-balance md:text-display"
            >
              NovoLase Gold, our dual-wavelength laser.
            </h2>
            <p className="text-on-scrim/80 md:text-heading md:font-normal">
              Our laser treatments use the NovoLase Gold diode laser. It sends two wavelengths of
              light in a single beam: 810 nm infrared for precise work on gums and soft tissue, and
              650 nm red light for gentle light therapy.
            </p>
            <p className="text-on-scrim/80">
              {laserDoctor.name} holds a {laserDoctor.fellowship?.toLowerCase()}.
            </p>
          </Reveal>

          <Reveal step={2}>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-on-scrim/10 lg:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label} className="flex flex-col gap-1 bg-scrim p-4">
                  <dt className="order-2 text-caption text-on-scrim/70">{spec.label}</dt>
                  <dd className="order-1 font-display text-heading font-bold text-highlight">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <ul className="grid gap-5 sm:grid-cols-2">
            {benefits.map(({ Icon, title, body }, index) => (
              <li key={title}>
                <Reveal step={index % 2} className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-highlight/15 text-highlight">
                    <Icon size={20} weight="duotone" aria-hidden />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display font-semibold">{title}</h3>
                    <p className="text-small text-on-scrim/75">{body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-on-scrim/10 pt-5">
            {link ? (
              <Link
                to={`/doctors/${laserDoctor.slug}`}
                viewTransition
                className="group inline-flex items-center gap-2 font-semibold text-highlight"
              >
                Meet {laserDoctor.name}
                <ArrowRightIcon
                  size={18}
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            ) : null}
            <p className="text-caption text-on-scrim/60">
              Product images and specifications:{' '}
              <a
                href={PRODUCT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-on-scrim"
              >
                NovoLase
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
