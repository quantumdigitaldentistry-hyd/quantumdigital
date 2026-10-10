import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cx } from '@/lib/cx';

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  hint?: string;
  error?: string;
  /** Fixed text before the input, e.g. "+91". */
  prefix?: ReactNode;
};

/**
 * Labelled text input. The label is always visible (never placeholder-only) and the error
 * sits right under the field, announced to screen readers.
 */
export function Field({ label, hint, error, prefix, className, ...rest }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-label font-medium">
        {label}
      </label>
      <div
        className={cx(
          'flex min-h-12 items-center rounded-control border bg-surface transition-colors focus-within:border-brand',
          error ? 'border-danger' : 'border-line-strong',
        )}
      >
        {prefix ? <span className="pl-3 font-mono text-small text-ink-muted">{prefix}</span> : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(hint && hintId, error && errorId) || undefined}
          className="h-12 w-full min-w-0 bg-transparent px-3 text-body outline-none placeholder:text-ink-subtle"
          {...rest}
        />
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-caption text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
