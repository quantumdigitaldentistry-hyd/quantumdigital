import {
  ArrowRightIcon,
  LightningIcon,
  SmileyIcon,
  SparkleIcon,
  ToothIcon,
} from '@phosphor-icons/react';
import { useState } from 'react';

import { Reveal } from '@/components/reveal';
import { HeroVisual } from '@/components/three/hero-visual';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buttonClass } from '@/components/ui/button-class';
import { Card } from '@/components/ui/card';

// Treatments and doctors as listed on the clinic signage.
const treatments = [
  {
    Icon: SmileyIcon,
    name: 'Invisalign provider',
    body: 'Clear, removable aligners that straighten teeth without brackets or wires.',
  },
  {
    Icon: ToothIcon,
    name: 'Implant center',
    body: 'Fixed replacements for missing teeth, anchored in the jaw like a natural root.',
  },
  {
    Icon: LightningIcon,
    name: 'Laser dentistry',
    body: 'Laser treatment for gums and soft tissue, usually with less bleeding.',
  },
  {
    Icon: SparkleIcon,
    name: 'Smile design',
    body: 'A planned set of treatments for the shape, shade and line of your smile.',
  },
];

const doctors = [
  {
    name: 'Dr Mohana Bindu',
    initials: 'MB',
    degree: 'MDS, Prosthodontics (OSM)',
    focus: 'Crowns, bridges, implants and dentures',
  },
  {
    name: 'Dr D Reddy Pradeep',
    initials: 'RP',
    degree: 'MDS, Orthodontics (OSM)',
    focus: 'Braces and clear aligners',
  },
];

/** Hero actions. Online booking isn't built yet, so the button says so instead of faking one. */
function HeroActions() {
  const [state, setState] = useState<'idle' | 'loading' | 'soon'>('idle');
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Button
          loading={state === 'loading'}
          onClick={() => {
            setState('loading');
            window.setTimeout(() => setState('soon'), 900);
          }}
        >
          Book appointment
        </Button>
        <a href="#treatments" className={buttonClass('secondary')}>
          See treatments
          <ArrowRightIcon size={18} aria-hidden />
        </a>
      </div>
      <p aria-live="polite" className="min-h-5 text-small text-on-hero-muted">
        {state === 'soon' ? 'Online booking opens soon. Please call the clinic to book.' : ''}
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="bg-linear-to-br from-hero-from to-hero-to text-on-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-4 px-4 pt-10 pb-6 md:grid-cols-[1.1fr_1fr] md:gap-10 md:px-6 md:py-20">
          <div className="flex flex-col gap-5">
            <Badge
              label="Invisalign provider · Implant center"
              tone="highlight"
              className="self-start"
            />
            <h1 className="font-display text-display font-bold text-balance md:text-display-lg">
              Implants, aligners and smile design, planned digitally.
            </h1>
            <p className="max-w-[52ch] text-body text-on-hero-muted md:text-heading md:font-normal">
              Quantum Digital Dentistry brings implant, orthodontic, laser and cosmetic care under
              one roof, with specialists for each.
            </p>
            <HeroActions />
          </div>
          <HeroVisual className="mx-auto max-w-[min(100%,26rem)] md:max-w-none" />
        </div>
      </section>

      <section
        id="treatments"
        aria-labelledby="treatments-title"
        className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 md:px-6 md:py-20"
      >
        <Reveal className="mb-8 flex max-w-2xl flex-col gap-2">
          <h2 id="treatments-title" className="font-display text-title font-semibold">
            Treatments
          </h2>
          <p className="text-ink-muted">Four specialities, each with its own equipment and team.</p>
        </Reveal>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {treatments.map(({ Icon, name, body }, index) => (
            <li key={name}>
              <Reveal step={index} className="h-full">
                <Card className="group flex h-full flex-col gap-3 transition-[border-color,transform] duration-300 ease-out hover:-translate-y-1 hover:border-aqua">
                  <span className="grid size-12 place-items-center rounded-control bg-aqua-soft text-on-aqua-soft transition-transform duration-300 ease-out group-hover:rotate-[-6deg]">
                    <Icon size={26} weight="duotone" aria-hidden />
                  </span>
                  <h3 className="font-display text-heading font-semibold">{name}</h3>
                  <p className="text-small text-ink-muted">{body}</p>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="doctors-title" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <Reveal className="mb-8 flex flex-col gap-2">
            <h2 id="doctors-title" className="font-display text-title font-semibold">
              Your doctors
            </h2>
            <p className="text-ink-muted">Postgraduate specialists in the treatments they lead.</p>
          </Reveal>
          <ul className="grid gap-4 md:grid-cols-2">
            {doctors.map((doctor, index) => (
              <li key={doctor.name}>
                <Reveal step={index}>
                  <div className="flex items-center gap-4 rounded-container border border-line bg-canvas p-4 md:p-6">
                    <span
                      aria-hidden
                      className="grid size-14 shrink-0 place-items-center rounded-full bg-linear-to-br from-hero-from to-hero-to font-display text-heading font-bold text-on-hero"
                    >
                      {doctor.initials}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-display text-heading font-semibold">{doctor.name}</h3>
                      <p className="text-small font-medium text-brand">{doctor.degree}</p>
                      <p className="text-small text-ink-muted">{doctor.focus}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
