import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/** Pointer effects only where there's a real hover pointer and motion is welcome. */
export const pointerFxEnabled = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !prefersReducedMotion();

/**
 * 3D tilt toward the pointer. Writes --rx / --ry (degrees) and --gx / --gy (glare
 * position, %) on the element, at most once per frame, and sets data-active while the
 * pointer is over it. Styling lives in styles.css (.tilt, .tilt-glare).
 */
export function usePointerTilt(ref: RefObject<HTMLElement | null>, max = 7) {
  useEffect(() => {
    const element = ref.current;
    if (!element || !pointerFxEnabled()) return;
    let frame = 0;
    let event: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      if (!event) return;
      const box = element.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      element.style.setProperty('--ry', `${((x - 0.5) * 2 * max).toFixed(2)}deg`);
      element.style.setProperty('--rx', `${((0.5 - y) * 2 * max).toFixed(2)}deg`);
      element.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
      element.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    };
    const onMove = (next: PointerEvent) => {
      event = next;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onEnter = () => element.setAttribute('data-active', '');
    const onLeave = () => {
      event = null;
      cancelAnimationFrame(frame);
      frame = 0;
      element.removeAttribute('data-active');
      element.style.setProperty('--rx', '0deg');
      element.style.setProperty('--ry', '0deg');
    };

    element.addEventListener('pointerenter', onEnter);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('pointerenter', onEnter);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
    };
  }, [ref, max]);
}

/**
 * Depth parallax for a hero: eases --px / --py (-1 … 1) on the element toward the
 * pointer's position over it, so children with .depth-1/2/3 drift by different amounts.
 */
export function usePointerParallax(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element || !pointerFxEnabled()) return;
    let frame = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const step = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      element.style.setProperty('--px', current.x.toFixed(3));
      element.style.setProperty('--py', current.y.toFixed(3));
      const settled = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) < 0.002;
      frame = settled ? 0 : requestAnimationFrame(step);
    };
    const run = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };
    const onMove = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      target.x = ((event.clientX - box.left) / box.width - 0.5) * 2;
      target.y = ((event.clientY - box.top) / box.height - 0.5) * 2;
      run();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      run();
    };
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
    };
  }, [ref]);
}
