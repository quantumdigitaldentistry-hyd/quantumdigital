import { MonitorIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';

import { cx } from '@/lib/cx';
import { useTheme, type ThemeMode } from '@/lib/theme';

const options: { mode: ThemeMode; label: string; Icon: typeof SunIcon }[] = [
  { mode: 'system', label: 'Device theme', Icon: MonitorIcon },
  { mode: 'light', label: 'Light theme', Icon: SunIcon },
  { mode: 'dark', label: 'Dark theme', Icon: MoonIcon },
];

/** Three-way segmented control. Icons only, with labels for screen readers and tooltips. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cx('inline-flex rounded-full border border-line bg-sunken p-1', className)}
    >
      {options.map(({ mode: option, label, Icon }) => {
        const selected = option === mode;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setMode(option)}
            className={cx(
              'grid size-11 place-items-center rounded-full transition-colors duration-150 md:size-9',
              selected ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
            )}
          >
            <Icon size={18} weight={selected ? 'fill' : 'regular'} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
