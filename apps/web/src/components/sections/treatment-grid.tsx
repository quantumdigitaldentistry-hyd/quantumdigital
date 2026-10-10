import { Reveal } from '@/components/reveal';
import { Card } from '@/components/ui/card';
import { treatments, type Treatment } from '@/content/clinic';

export function TreatmentCard({ treatment }: { treatment: Treatment }) {
  const { Icon, name, summary } = treatment;
  return (
    <Card className="group flex h-full flex-col gap-3 transition-[border-color,transform] duration-300 ease-out hover:-translate-y-1 hover:border-aqua">
      <span className="grid size-12 place-items-center rounded-control bg-aqua-soft text-on-aqua-soft transition-transform duration-300 ease-out group-hover:-rotate-6">
        <Icon size={26} weight="duotone" aria-hidden />
      </span>
      <h3 className="font-display text-heading font-semibold">{name}</h3>
      <p className="text-small text-ink-muted">{summary}</p>
    </Card>
  );
}

/** One column on phones, two on tablets, four on desktop. */
export function TreatmentGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {treatments.map((treatment, index) => (
        <li key={treatment.slug}>
          <Reveal step={index} className="h-full">
            <TreatmentCard treatment={treatment} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
