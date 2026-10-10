import { useEffect } from 'react';

import { prefersReducedMotion } from '@/lib/gsap';

/**
 * Lenis smooth scrolling for mouse and trackpad users. Touch devices keep native
 * scrolling (it already feels right and Lenis would fight it), and reduced-motion users
 * get native scrolling too. Loaded after first paint; dialogs scroll natively.
 */
export function SmoothScroll() {
  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer || prefersReducedMotion()) return;

    let destroyed = false;
    let destroy: (() => void) | undefined;
    import('lenis').then(({ default: Lenis }) => {
      if (destroyed) return;
      const lenis = new Lenis({
        autoRaf: true,
        anchors: true,
        lerp: 0.11,
        // Never smooth-scroll inside an open dialog or the page behind it.
        prevent: (node) => node.closest('dialog') !== null,
      });
      destroy = () => lenis.destroy();
    });
    return () => {
      destroyed = true;
      destroy?.();
    };
  }, []);

  return null;
}
