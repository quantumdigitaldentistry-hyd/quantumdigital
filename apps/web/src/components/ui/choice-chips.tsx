import type { Icon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

export type Choice<T extends string> = {
  value: T;
  label: string;
  /** An icon, or any small visual (e.g. an illustration) before the label. */
  Icon?: Icon;
  visual?: ReactNode;
};

/**
 * Single-choice pills: a native radio group under a visible legend, so arrow keys,
 * forms and screen readers all work. The checked pill fills with the brand colour.
 */
export function ChoiceChips<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  tiles = false,
  className,
}: {
  legend: string;
  name: string;
  options: Choice<T>[];
  value: T | '';
  onChange: (value: T) => void;
  /** Equal-width tiles (icon above label) in one row, for a few short options. */
  tiles?: boolean;
  className?: string;
}) {
  return (
    <fieldset className={cx('flex min-w-0 flex-col gap-2', className)}>
      <legend className="mb-2 text-label font-medium">{legend}</legend>
      <div
        className={cx(tiles ? 'grid gap-2' : 'flex flex-wrap gap-2')}
        style={
          tiles ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` } : undefined
        }
      >
        {options.map(({ value: optionValue, label, Icon, visual }) => (
          <label
            key={optionValue}
            className={cx(
              tiles
                ? 'flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2'
                : 'inline-flex min-h-11 items-center gap-2 rounded-full px-3.5',
              'cursor-pointer border border-line-strong bg-surface text-small font-medium transition-[background-color,border-color,color,scale] duration-200 select-none hover:border-brand active:scale-[0.97] has-checked:border-brand has-checked:bg-brand has-checked:text-on-brand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand',
            )}
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
              className="sr-only"
            />
            {visual ?? (Icon ? <Icon size={18} weight="duotone" aria-hidden /> : null)}
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
