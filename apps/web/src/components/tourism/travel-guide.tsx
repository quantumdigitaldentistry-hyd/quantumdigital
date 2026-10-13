import {
  AirplaneTiltIcon,
  ArrowUpRightIcon,
  BankIcon,
  BedIcon,
  CheckCircleIcon,
  HospitalIcon,
  MapPinIcon,
  SubwayIcon,
  TrainIcon,
  type Icon,
} from '@phosphor-icons/react';

import { Reveal } from '@/components/reveal';
import { Section } from '@/components/sections/section';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { clinic } from '@/config/site';
import { doctors } from '@/content/clinic';
import { photos } from '@/content/photos';

/*
 * The travel guide on the dental tourism page: why Hyderabad, the cost advantage,
 * getting to the clinic in S R Nagar, what to bring, support at each stage and what to
 * see in the city. General information. TODO(clinic): confirm travel times, the
 * accommodation help offered and the quality points before publishing widely.
 */

const [orthodontist, prosthodontist] = [
  doctors.find((doctor) => doctor.specialty === 'Orthodontics')!,
  doctors.find((doctor) => doctor.specialty === 'Prosthodontics')!,
];

/** A white card with an icon, title and short text. */
function InfoCard({ Icon, title, body }: { Icon: Icon; title: string; body: string }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-3xl border border-line bg-surface p-5 shadow-sm transition-[translate,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-aqua hover:shadow-lg hover:shadow-elevation/10 md:p-6">
      <span className="grid size-12 place-items-center rounded-2xl bg-aqua-soft text-on-aqua-soft">
        <Icon size={24} weight="duotone" aria-hidden />
      </span>
      <h3 className="font-display text-heading font-semibold">{title}</h3>
      <p className="text-small text-ink-muted">{body}</p>
    </article>
  );
}

/** A list with brand-blue tick marks. */
function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-small">
          <CheckCircleIcon
            size={20}
            weight="fill"
            className="mt-px shrink-0 text-brand"
            aria-hidden
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function WhyHyderabad() {
  const cards: { Icon: Icon; title: string; body: string }[] = [
    {
      Icon: AirplaneTiltIcon,
      title: 'International airport',
      body: 'Rajiv Gandhi International Airport has direct flights to the Middle East, Europe and Southeast Asia, and connections worldwide.',
    },
    {
      Icon: HospitalIcon,
      title: 'Specialist dental care',
      body: `${clinic.name}: MDS specialists, digital scans and planning, and the NovoLase Gold dental laser.`,
    },
    {
      Icon: BedIcon,
      title: 'Comfortable stay',
      body: 'Hotels and serviced apartments within a short drive of the clinic in S R Nagar, Ameerpet and Begumpet.',
    },
    {
      Icon: BankIcon,
      title: 'Rich heritage',
      body: 'Fit sightseeing around your appointments in one of India’s most historic cities.',
    },
  ];
  return (
    <Section
      eyebrow="Why Hyderabad"
      title="One of India’s leading healthcare destinations."
      intro="Hyderabad is known for modern hospitals, skilled specialists, good infrastructure and affordable care, with easy international connections and a safe, welcoming city."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <li key={card.title}>
            <Reveal step={index} className="h-full">
              <InfoCard {...card} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function CostAdvantage() {
  return (
    <section aria-labelledby="cost-title" className="border-y border-line bg-surface">
      <Container className="grid items-center gap-10 py-12 md:grid-cols-[1.1fr_1fr] md:gap-14 md:py-20">
        <Reveal className="flex flex-col gap-4">
          <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
            Cost advantage
          </p>
          <h2
            id="cost-title"
            className="heading-3d font-display text-title font-bold text-balance md:text-display"
          >
            High-quality care at a lower cost.
          </h2>
          <p className="text-ink-muted md:text-heading md:font-normal">
            Patients from the USA, Canada, the UK, Australia, New Zealand, Europe and the Middle
            East often find dental treatment in Hyderabad much more affordable, even after travel
            and accommodation, without compromising on quality, safety or comfort.
          </p>
          <p className="text-ink-muted">
            Running costs in India are lower, while the clinical standards, specialist training and
            materials stay high. You get a written estimate before any treatment begins.
          </p>
        </Reveal>
        <Reveal
          step={1}
          className="flex flex-col gap-5 rounded-4xl border border-line bg-canvas p-6 shadow-lg shadow-elevation/10 md:p-8"
        >
          <h3 className="font-display text-heading font-semibold">Quality without compromise</h3>
          <CheckList
            items={[
              'Internationally recognised implant systems',
              'Zirconia and ceramic crowns, bridges and veneers',
              'Digital scans and X-rays for precise planning',
              'Strict sterilisation at every step',
              'A clear cost estimate before treatment begins',
            ]}
          />
        </Reveal>
      </Container>
    </section>
  );
}

export function GettingHere() {
  const routes: { Icon: Icon; title: string; body: string }[] = [
    {
      Icon: AirplaneTiltIcon,
      title: 'By air',
      body: 'From Rajiv Gandhi International Airport, the clinic is about an hour by airport taxi, Uber or Ola, depending on traffic.',
    },
    {
      Icon: SubwayIcon,
      title: 'By metro',
      body: 'S R Nagar station on the Red Line is a short walk away, and Ameerpet interchange (Red and Blue lines) is one stop on.',
    },
    {
      Icon: TrainIcon,
      title: 'By train',
      body: 'Begumpet, Hyderabad Deccan (Nampally) and Secunderabad Junction stations are all a short drive from the clinic.',
    },
    {
      Icon: BedIcon,
      title: 'Where to stay',
      body: 'Business and budget hotels and serviced apartments are close by in S R Nagar, Ameerpet and Begumpet. We can suggest options that suit your appointment times.',
    },
  ];
  return (
    <section aria-labelledby="getting-here-title">
      <Container className="grid gap-12 py-12 md:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <Reveal className="flex flex-col gap-3">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              Travel and accommodation
            </p>
            <h2
              id="getting-here-title"
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              Getting to our clinic in S R Nagar.
            </h2>
            <p className="text-ink-muted">
              {clinic.name} is in Sanjeeva Reddy Nagar, central Hyderabad, close to Ameerpet,
              Punjagutta and Begumpet.
            </p>
            <a
              href={clinic.address.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex w-fit items-start gap-2 rounded-2xl bg-brand-soft px-4 py-3 text-small text-on-brand-soft transition-colors hover:bg-brand hover:text-on-brand"
            >
              <MapPinIcon size={20} weight="fill" className="mt-px shrink-0" aria-hidden />
              <span>
                {clinic.address.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
              <ArrowUpRightIcon
                size={16}
                aria-hidden
                className="mt-0.5 shrink-0 transition-transform duration-300 group-hover:rotate-45"
              />
            </a>
          </Reveal>
          <ul className="grid gap-4 sm:grid-cols-2">
            {routes.map((route, index) => (
              <li key={route.title}>
                <Reveal step={index % 2} className="h-full">
                  <InfoCard {...route} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal step={1} className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
            Before you travel
          </p>
          <h2 className="heading-3d font-display text-title font-bold">What to bring.</h2>
          <p className="text-ink-muted">
            Planning ahead helps us finish your treatment smoothly within your stay.
          </p>
          <div className="rounded-4xl border border-line bg-surface p-6 shadow-lg shadow-elevation/10">
            <CheckList
              items={[
                'Passport and visa, if you need one',
                'Previous dental records, X-rays or CBCT scans',
                'A list of your current medicines and medical history',
                'Health insurance details, if applicable',
                'Your confirmed appointment dates, before you book flights',
              ]}
            />
          </div>
          <p className="text-small text-ink-muted">
            We welcome patients from the{' '}
            <strong className="font-semibold text-ink">
              USA, Canada, UK, Australia, New Zealand, the Middle East, Europe, Africa and Southeast
              Asia
            </strong>
            , as well as from across India.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

export function PatientSupport() {
  const stages = [
    {
      title: 'Before your visit',
      items: [
        'Online consultation and scheduling',
        'An estimate once we have your photos and X-rays',
        'Help planning your travel and stay',
      ],
    },
    {
      title: 'During treatment',
      items: [
        `Implants, crowns and veneers with ${prosthodontist.name}`,
        `Braces and aligners with ${orthodontist.name}`,
        'Each step explained, with a written plan',
        'Appointments grouped to make the most of your stay',
      ],
    },
    {
      title: 'After treatment',
      items: [
        'Aftercare instructions and your records to take home',
        'Follow-up by phone or video call',
        'Guidance if you need help urgently',
        'Advice on long-term care',
      ],
    },
  ];
  return (
    <Section
      eyebrow="Patient support"
      title="Personalised care at every step."
      intro="Support before, during and after your treatment, for patients from Hyderabad, other cities and abroad."
      tinted
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {stages.map((stage, index) => (
          <li key={stage.title}>
            <Reveal
              step={index}
              className="flex h-full flex-col gap-4 rounded-3xl border border-line bg-canvas p-6"
            >
              <p className="flex items-center gap-2.5 font-display text-heading font-semibold">
                <span className="grid size-8 place-items-center rounded-full bg-brand font-mono text-small text-on-brand">
                  {index + 1}
                </span>
                {stage.title}
              </p>
              <CheckList items={stage.items} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function ExploreHyderabad() {
  const places = [
    'Charminar',
    'Golconda Fort',
    'Hussain Sagar Lake',
    'Salar Jung Museum',
    'Chowmahalla Palace',
    'Ramoji Film City',
    'Birla Mandir',
    'Necklace Road',
  ];
  return (
    <section
      aria-labelledby="explore-title"
      className="relative isolate overflow-clip bg-scrim text-on-scrim"
    >
      {/* Golconda Fort behind, drifting gently as the section scrolls past. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <Photo
          photo={photos.golconda}
          sizes="100vw"
          className="block size-full"
          imgClassName="parallax-img scale-110 object-[center_70%]"
        />
        {/* Dark on the text side, opening up to the fort; a little at the bottom too. */}
        <div className="absolute inset-0 bg-linear-to-r from-scrim/90 via-scrim/60 to-scrim/10" />
        <div className="absolute inset-0 bg-linear-to-t from-scrim/70 via-transparent to-transparent" />
      </div>
      <Container className="flex min-h-[32rem] flex-col justify-center gap-8 py-16 md:min-h-[36rem] md:py-24">
        <Reveal className="flex max-w-xl flex-col gap-3">
          <p className="text-label font-semibold tracking-[0.14em] text-highlight uppercase">
            Explore Hyderabad
          </p>
          <h2
            id="explore-title"
            className="font-display text-title font-bold text-balance drop-shadow-[0_2px_12px_rgb(0_0_0/0.35)] md:text-display"
          >
            Combine treatment with a memorable visit.
          </h2>
          <p className="opacity-90 md:text-heading md:font-normal">
            Many patients fit sightseeing around their appointments in one of India’s most historic
            and vibrant cities. Tap a place to see it on Google.
          </p>
        </Reveal>
        <Reveal step={1}>
          <ul className="flex max-w-3xl flex-wrap gap-2">
            {places.map((place) => (
              <li key={place}>
                {/* Google's page for the place: photos, timings, reviews and directions. */}
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${place}, Hyderabad`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 text-small font-medium text-white backdrop-blur-md transition-[background-color,color,translate] duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-ink"
                >
                  {place}
                  <ArrowUpRightIcon
                    size={14}
                    aria-hidden
                    className="opacity-80 transition-[rotate] duration-200 group-hover:rotate-45"
                  />
                  <span className="sr-only"> (opens Google in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
        <p className="text-caption opacity-70">Golconda Fort, Hyderabad</p>
      </Container>
    </section>
  );
}
