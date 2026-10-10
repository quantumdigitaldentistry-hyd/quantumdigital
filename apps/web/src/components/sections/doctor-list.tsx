import { Reveal } from '@/components/reveal';
import { doctors } from '@/content/clinic';

export function DoctorList() {
  return (
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
  );
}
