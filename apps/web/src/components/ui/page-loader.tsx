import { useEffect, useState } from 'react';

import logoWebp from '@/assets/brand/logo-mark.webp';
import fillWebp from '@/assets/gifs/fill.webp';
import { cx } from '@/lib/cx';

/**
 * Full-page loader: brand kit "C · Fill" (assets/gifs/fill.gif, re-encoded as a 16 kB
 * animated WebP). The art has a solid white background, so it sits on a white tile like
 * an app icon. Hidden for the first `delay` ms so fast loads never flash a loader.
 * With reduced motion, a still logo replaces the animation.
 */
export function PageLoader({
  label = 'Loading',
  delay = 200,
  className,
}: {
  label?: string;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  return (
    <div
      role="status"
      aria-label={label}
      className={cx(
        'grid min-h-[60dvh] place-items-center p-6 transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="size-28 overflow-hidden rounded-[28px] border border-line bg-logo-tile md:size-32">
          <img
            src={fillWebp}
            alt=""
            width={240}
            height={240}
            className="size-full motion-reduce:hidden"
          />
          <img
            src={logoWebp}
            alt=""
            width={400}
            height={373}
            loading="lazy"
            className="hidden size-full object-contain p-5 motion-reduce:block"
          />
        </div>
        <p className="text-small text-ink-muted">{label}</p>
      </div>
    </div>
  );
}
