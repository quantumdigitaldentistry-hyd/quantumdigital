import { ArrowRightIcon, CalendarPlusIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';

import { DoctorList } from '@/components/sections/doctor-list';
import { Section } from '@/components/sections/section';
import { TreatmentGrid } from '@/components/sections/treatment-grid';
import { HeroVisual } from '@/components/three/hero-visual';
import { Badge } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { useQuickActions } from '@/lib/quick-actions';

/** Home (the dashboard): hero with the 3D tooth, treatments, doctors. */
export default function HomePage() {
  const show = useQuickActions((s) => s.show);

  return (
    <>
      <section className="bg-linear-to-br from-hero-from to-hero-to text-on-hero">
        <Container className="grid items-center gap-4 pt-10 pb-6 md:grid-cols-[1.1fr_1fr] md:gap-10 md:py-20">
          <div className="flex flex-col gap-5">
            <Badge
              label="Invisalign provider · Implant center"
              tone="highlight"
              className="self-start"
            />
            <h1 className="font-display text-display font-bold text-balance md:text-display-lg">
              Implants, aligners and smile design, planned digitally.
            </h1>
            <p className="max-w-[52ch] text-on-hero-muted md:text-heading md:font-normal">
              Quantum Digital Dentistry brings implant, orthodontic, laser and cosmetic care under
              one roof, with specialists for each.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={buttonClass()} onClick={() => show('book')}>
                <CalendarPlusIcon size={20} aria-hidden />
                Book appointment
              </button>
              <Link to="/treatments" viewTransition className={buttonClass('secondary')}>
                See treatments
                <ArrowRightIcon size={18} aria-hidden />
              </Link>
            </div>
          </div>
          <HeroVisual className="mx-auto max-w-[min(100%,26rem)] md:max-w-none" />
        </Container>
      </section>

      <Section title="Treatments" intro="Four specialities, each with its own equipment and team.">
        <TreatmentGrid />
      </Section>

      <Section
        title="Your doctors"
        intro="Postgraduate specialists in the treatments they lead."
        tinted
      >
        <DoctorList />
      </Section>
    </>
  );
}
