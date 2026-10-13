import type { WebGLRenderer } from 'three';

/** Phones, tablets and computers with few cores: skip optional extras like shadows. */
export const lightDevice = () =>
  window.matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 4) < 6;

/**
 * Keeps a scroll-driven 3D scene at a smooth frame rate on any device. It starts sharp
 * (up to 1.5× resolution, 1.25× on touch screens) and watches the time between frames
 * while the scene is moving; when the median of a batch is slower than ~42 fps, it drops
 * the drawing resolution a step (down to 0.75×). Fewer pixels is the biggest saving for a
 * GPU-bound scene, and it never steps back up, so quality doesn't oscillate. On a slow
 * phone or laptop the scene stays fluid and scrolling never stalls inside it.
 */
export function adaptiveQuality(renderer: WebGLRenderer, onResolutionChange: () => void) {
  const touch = window.matchMedia('(pointer: coarse)').matches;
  let ratio = Math.min(window.devicePixelRatio, touch ? 1.25 : 1.5);
  const floor = 0.75;
  renderer.setPixelRatio(ratio);
  const batch: number[] = [];

  return {
    /** Report the time since the previous drawn frame (ms), while the scene is moving. */
    sample(intervalMs: number) {
      // Ignore gaps (the tab was hidden, or the scene was idle).
      if (intervalMs <= 0 || intervalMs > 120 || ratio <= floor) return;
      batch.push(intervalMs);
      if (batch.length < 18) return;
      batch.sort((a, b) => a - b);
      const median = batch[batch.length >> 1]!;
      batch.length = 0;
      if (median > 24) {
        ratio = Math.max(floor, ratio - 0.25);
        renderer.setPixelRatio(ratio);
        onResolutionChange();
      }
    },
  };
}
