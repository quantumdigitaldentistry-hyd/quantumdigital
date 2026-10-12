import { XIcon } from '@phosphor-icons/react';
import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';

import { cx } from '@/lib/cx';
import type { ActionOrigin } from '@/lib/quick-actions';

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

const GAP = 12;
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_IN = 'cubic-bezier(0.5, 0, 0.75, 0)';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * From md up, sit the panel beside the button it came from (above it when the button is
 * in the lower half of the screen, below otherwise), kept inside the viewport. Phones
 * keep the bottom sheet.
 */
function placeBeside(dialog: HTMLDialogElement, origin: ActionOrigin | null | undefined) {
  const style = dialog.style;
  if (!origin || !window.matchMedia('(min-width: 768px)').matches) {
    style.removeProperty('inset');
    style.removeProperty('left');
    style.removeProperty('top');
    style.removeProperty('margin');
    return;
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = dialog.offsetWidth;
  const height = dialog.offsetHeight;
  const left = origin.x < vw / 2 ? origin.x : origin.x + origin.width - width;
  const top = origin.y > vh / 2 ? origin.y - GAP - height : origin.y + origin.height + GAP;
  style.inset = 'auto';
  style.margin = '0';
  style.left = `${Math.min(Math.max(GAP, left), vw - width - GAP)}px`;
  style.top = `${Math.min(Math.max(GAP, top), vh - height - GAP)}px`;
}

/** Grow the panel out of (or shrink it back into) the button it was opened from. */
function morph(dialog: HTMLDialogElement, origin: ActionOrigin, direction: 'in' | 'out') {
  const box = dialog.getBoundingClientRect();
  dialog.style.transformOrigin = `${origin.x + origin.width / 2 - box.left}px ${
    origin.y + origin.height / 2 - box.top
  }px`;
  const radius = getComputedStyle(dialog).borderRadius;
  const small = { scale: '0.1', opacity: 0, borderRadius: '9999px' };
  const full = { scale: '1', opacity: 1, borderRadius: radius };
  return direction === 'in'
    ? dialog.animate([small, full], { duration: 420, easing: EASE_OUT })
    : dialog.animate([full, small], { duration: 240, easing: EASE_IN, fill: 'forwards' });
}

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: keyof typeof variants;
  /** The button it was opened from: the panel grows out of it and sits beside it. */
  origin?: ActionOrigin | null;
  /**
   * Replaces the plain title row with an illustrated header. It must render the title
   * (and description, if any) with the ids it is given, so the dialog stays labelled.
   */
  banner?: (ids: { titleId: string; descriptionId: string }) => ReactNode;
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
  origin,
  banner,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const exit = useRef<Animation | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Layout effect: placement and the first animation frame land before the first paint.
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const animate = !!origin && !reducedMotion();
    if (open && !dialog.open) {
      exit.current?.cancel();
      exit.current = null;
      dialog.showModal();
      placeBeside(dialog, origin);
      if (animate) morph(dialog, origin, 'in');
    } else if (!open && dialog.open) {
      if (animate) {
        const animation = morph(dialog, origin, 'out');
        exit.current = animation;
        animation.finished.then(() => dialog.close()).catch(() => {});
      } else {
        dialog.close();
      }
    }
  }, [open, origin]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      // Esc: close through state, so the panel can shrink back into its button first.
      onCancel={(event) => {
        if (!origin) return;
        event.preventDefault();
        onClose();
      }}
      // The dialog element itself is only "hit" outside the content box: the backdrop.
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className={cx(
        'dialog max-h-[92dvh] overflow-y-auto border-0 bg-surface p-0 text-ink',
        variants[variant],
        origin && 'dialog-origin md:max-h-[min(42rem,calc(100dvh-1.5rem))]! md:w-[24rem]!',
        className,
      )}
    >
      <div className="flex flex-col gap-5 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:p-6">
        {banner ? (
          <div className="relative">
            {banner({ titleId, descriptionId })}
            <IconButton
              label="Close"
              onClick={onClose}
              className="absolute -top-1 -right-2 z-10 bg-surface/80 backdrop-blur-sm"
            >
              <XIcon size={20} aria-hidden />
            </IconButton>
          </div>
        ) : (
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
        )}
        {children}
      </div>
    </dialog>
  );
}
