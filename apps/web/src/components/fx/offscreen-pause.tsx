import { useEffect } from 'react';

/** Looping decorative animations (styles.css) that only need to run while seen. */
const LOOPS =
  '.float-y, .marquee-track, .festival-ring, .festival-halo, .festival-shrine, .festival-sheen, .festival-sweep, .festival-shimmer, [data-loop]';

/**
 * Pauses looping animations while they are off screen (`data-offscreen`, styles.css).
 * A running animation anywhere on the page makes the browser produce a new frame every
 * vsync, which costs the whole page's layer work even when nothing visible moves; on a
 * long page that was the main thing slowing scrolling on modest laptops and phones.
 * Mounted once in the root layout; it also picks up content that renders later.
 */
export function OffscreenPause() {
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const visibility = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting);
        }
      },
      { rootMargin: '200px 0px' },
    );
    const watch = (root: ParentNode) => {
      root.querySelectorAll(LOOPS).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        visibility.observe(element);
      });
    };
    watch(document);
    let pending = 0;
    const changes = new MutationObserver(() => {
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        watch(document);
      });
    });
    changes.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(pending);
      changes.disconnect();
      visibility.disconnect();
    };
  }, []);

  return null;
}
