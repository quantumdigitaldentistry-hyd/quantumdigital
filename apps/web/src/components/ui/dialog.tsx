import { XIcon } from '@phosphor-icons/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

import { cx } from '@/lib/cx';

import { IconButton } from './icon-button';

const variants = {
  /** Bottom sheet on phones, centred dialog from md up. */
  sheet: cx(
    'dialog-sheet mx-0 mt-auto mb-0 w-full max-w-full rounded-t-container',
    'md:m-auto md:w-[28rem] md:rounded-container',
  ),
  /** Full-height panel from the right, for menus. */
  drawer: 'dialog-drawer my-0 mr-0 ml-auto h-dvh max-h-none w-[min(22rem,88vw)] max-w-none',
};

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: keyof typeof variants;
  children?: ReactNode;
  className?: string;
};

/**
 * Modal built on the native <dialog>: focus is trapped and restored, Esc closes, and it
 * renders in the top layer above everything. Clicking the backdrop also closes it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  variant = 'sheet',
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      // The dialog element itself is only "hit" outside the content box: the backdrop.
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className={cx(
        'dialog max-h-[92dvh] overflow-y-auto border-0 bg-surface p-0 text-ink',
        variants[variant],
        className,
      )}
    >
      <div className="flex flex-col gap-5 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="font-display text-heading font-semibold md:text-title">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-small text-ink-muted">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton label="Close" onClick={onClose} className="-mt-1 -mr-2 shrink-0">
            <XIcon size={20} aria-hidden />
          </IconButton>
        </div>
        {children}
      </div>
    </dialog>
  );
}
