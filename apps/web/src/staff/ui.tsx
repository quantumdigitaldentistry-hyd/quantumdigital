import { InfoIcon, WarningCircleIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

/** Page header for staff screens. */
export function StaffPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-title font-bold">{title}</h1>
          {description ? (
            <p className="max-w-[60ch] text-small text-ink-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

/** Bordered panel. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-3xl border border-line bg-surface p-4 md:p-5', className)}>
      {children}
    </section>
  );
}

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'error' | 'success';
  children: ReactNode;
}) {
  const Icon = tone === 'error' ? WarningCircleIcon : InfoIcon;
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx(
        'flex items-start gap-2 rounded-control p-3 text-small',
        tone === 'error' && 'bg-danger-soft text-danger',
        tone === 'success' && 'bg-success-soft text-success',
        tone === 'info' && 'bg-brand-soft text-on-brand-soft',
      )}
    >
      <Icon size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-3xl border border-dashed border-line-strong p-8 text-center text-small text-ink-muted">
      {children}
    </p>
  );
}

/** Small status pill. */
export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-semibold whitespace-nowrap',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Labelled checkbox / switch row. */
export function Toggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cx('flex items-start gap-3', disabled ? 'opacity-60' : 'cursor-pointer')}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 accent-brand"
      />
      <span className="flex flex-col">
        <span className="text-small font-medium">{label}</span>
        {hint ? <span className="text-caption text-ink-muted">{hint}</span> : null}
      </span>
    </label>
  );
}
