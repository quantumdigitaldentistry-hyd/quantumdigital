import { useEffect } from 'react';

import { loadGsap, prefersReducedMotion } from '@/lib/gsap';
import { setActiveLenis } from '@/lib/scroll';

/**
 * Lenis smooth scrolling for mouse and trackpad users, driven by GSAP's ticker so Lenis,
 * ScrollTrigger and the 3D scenes all update in the same frame (separate loops are what
 * makes scroll scenes judder). Touch devices keep native scrolling, which already feels
 * right; reduced motion gets native scrolling too. Dialogs always scroll natively.
 */
export function SmoothScroll() {
  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer || prefersReducedMotion()) return;

    let destroyed = false;
    let destroy: (() => void) | undefined;
    Promise.all([import('lenis'), loadGsap()]).then(
      ([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
        if (destroyed) return;
        const lenis = new Lenis({
          autoRaf: false,
          anchors: true,
          lerp: 0.12,
          wheelMultiplier: 0.9,
          prevent: (node) => node.closest('dialog') !== null,
        });
        setActiveLenis(lenis);
        lenis.on('scroll', ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        destroy = () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
          setActiveLenis(null);
        };
      },
    );
    return () => {
      destroyed = true;
      destroy?.();
    };
  }, []);

  return null;
}
