import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

import { cx } from '@/lib/cx';

type ShellProps = {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
};

/**
 * Label, control, hint and error, wired together. The label is always visible (never
 * placeholder-only) and the error sits right under the control, announced to screen
 * readers. `children` receives the ids the control must use.
 */
function FieldShell({
  label,
  hint,
  error,
  className,
  children,
}: ShellProps & {
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = cx(hint && !error && hintId, error && errorId) || undefined;
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-label font-medium">
        {label}
      </label>
      {children({ id, describedBy, invalid: !!error })}
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

const controlBox = (invalid: boolean) =>
  cx(
    'rounded-control border bg-surface transition-colors focus-within:border-brand',
    invalid ? 'border-danger' : 'border-line-strong',
  );

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'prefix'> &
  ShellProps & {
    /** Fixed text before the input, e.g. "+91". */
    prefix?: ReactNode;
  };

/** Labelled text input. */
export function Field({ label, hint, error, prefix, className, ...rest }: FieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className={cx('flex min-h-12 items-center', controlBox(invalid))}>
          {prefix ? (
            <span className="pl-3 font-mono text-small text-ink-muted">{prefix}</span>
          ) : null}
          <input
            id={id}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className="h-12 w-full min-w-0 bg-transparent px-3 text-body outline-none placeholder:text-ink-subtle"
            {...rest}
          />
        </div>
      )}
    </FieldShell>
  );
}

export type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> &
  ShellProps & { options: { value: string; label: string }[]; placeholder?: string };

/** Labelled native select (native for the best phone picker and accessibility). */
export function SelectField({
  label,
  hint,
  error,
  className,
  options,
  placeholder,
  ...rest
}: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className={cx('relative min-h-12', controlBox(invalid))}>
          <select
            id={id}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className="h-12 w-full appearance-none bg-transparent px-3 pr-10 text-body outline-none"
            {...rest}
          >
            {placeholder ? <option value="">{placeholder}</option> : null}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 size-2.5 -translate-y-2/3 rotate-45 border-r-2 border-b-2 border-ink-muted"
          />
        </div>
      )}
    </FieldShell>
  );
}

export type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> &
  ShellProps;

/** Labelled multi-line input. */
export function TextAreaField({ label, hint, error, className, ...rest }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className={controlBox(invalid)}>
          <textarea
            id={id}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            rows={3}
            className="block w-full resize-y bg-transparent px-3 py-2.5 text-body outline-none placeholder:text-ink-subtle"
            {...rest}
          />
        </div>
      )}
    </FieldShell>
  );
}
