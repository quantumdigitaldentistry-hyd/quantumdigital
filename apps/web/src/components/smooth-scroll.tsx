import { useEffect } from 'react';

import { loadGsap, prefersReducedMotion } from '@/lib/gsap';
import { scrollToElement, setActiveLenis } from '@/lib/scroll';

/**
 * Enough headroom for script-driven scrolling. Lenis moves the page from the main
 * thread, so on a modest machine any busy frame shows up as scroll lag; the browser's
 * own scrolling runs on the compositor thread and stays smooth regardless (and Chrome,
 * Edge and Safari already smooth mouse-wheel steps themselves).
 */
function capableDevice() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores >= 6 && memory >= 4;
}

/**
 * Lenis smooth scrolling for mouse and trackpad users on capable machines, driven by
 * GSAP's ticker so Lenis, ScrollTrigger and the 3D scenes all update in the same frame
 * (separate loops are what makes scroll scenes judder). Touch devices, modest machines
 * and reduced motion keep native scrolling. Dialogs always scroll natively.
 */
export function SmoothScroll() {
  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer || prefersReducedMotion() || !capableDevice()) return;

    let destroyed = false;
    let destroy: (() => void) | undefined;
    Promise.all([import('lenis'), loadGsap()]).then(
      ([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
        if (destroyed) return;
        const lenis = new Lenis({
          autoRaf: false,
          // Same-page anchors are handled below: Lenis's own anchor scrolling stops short
          // on this page structure.
          anchors: false,
          lerp: 0.12,
          wheelMultiplier: 0.9,
          prevent: (node) => node.closest('dialog') !== null,
        });
        setActiveLenis(lenis);
        lenis.on('scroll', ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        // "#section" links glide to exactly where the section starts, below the sticky
        // header (the section's own scroll-margin, or 80px), and update the address.
        const onAnchor = (event: MouseEvent) => {
          if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey)
            return;
          const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
          const id = link?.getAttribute('href')?.slice(1);
          const target = id ? document.getElementById(decodeURIComponent(id)) : null;
          if (!target) return;
          event.preventDefault();
          const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 80;
          scrollToElement(target, margin);
          history.replaceState(history.state, '', `#${id}`);
        };
        document.addEventListener('click', onAnchor);

        destroy = () => {
          document.removeEventListener('click', onAnchor);
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
