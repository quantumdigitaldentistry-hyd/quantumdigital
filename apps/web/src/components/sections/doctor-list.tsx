import { Reveal } from '@/components/reveal';
import { doctors } from '@/content/clinic';

export function DoctorList() {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {doctors.map((doctor, index) => (
        <li key={doctor.name}>
          <Reveal step={index}>
            <div className="group flex items-center gap-5 rounded-container border border-line bg-surface p-5 transition-[border-color,transform] duration-300 ease-out hover:-translate-y-1 hover:border-aqua md:p-8">
              <span
                aria-hidden
                className="grid size-16 shrink-0 place-items-center rounded-full bg-linear-to-br from-hero-from to-hero-to font-display text-heading font-bold text-on-hero transition-transform duration-300 ease-out group-hover:scale-105 md:size-20 md:text-title"
              >
                {doctor.initials}
              </span>
              <div className="flex flex-col gap-0.5">
                <h3 className="font-display text-heading font-semibold md:text-title">
                  {doctor.name}
                </h3>
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
