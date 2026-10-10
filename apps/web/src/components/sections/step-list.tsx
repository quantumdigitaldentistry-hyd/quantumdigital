import { Reveal } from '@/components/reveal';
import { cx } from '@/lib/cx';

export type Step = { title: string; body: string };

/** Numbered steps as cards. Used on treatment pages and the dental tourism page. */
export function StepList({
  steps,
  className,
  tone = 'canvas',
}: {
  steps: Step[];
  className?: string;
  /** Card background: canvas on surface sections, surface on canvas sections. */
  tone?: 'canvas' | 'surface';
}) {
  return (
    <ol className={cx('flex flex-col gap-4', className)}>
      {steps.map((step, index) => (
        <li key={step.title}>
          <Reveal
            step={index}
            className={cx(
              'flex gap-4 rounded-container border border-line p-5',
              tone === 'canvas' ? 'bg-canvas' : 'bg-surface',
            )}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand font-mono text-small font-medium text-on-brand">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-heading font-semibold">{step.title}</h3>
              <p className="text-ink-muted">{step.body}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
