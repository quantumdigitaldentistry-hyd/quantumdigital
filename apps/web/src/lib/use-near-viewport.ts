import { useEffect, useState, type RefObject } from 'react';

/**
 * True once the element comes within `margin` of the viewport (and stays true). Used to
 * load heavy pieces just before they're needed, never during the first paint.
 */
export function useNearViewport(ref: RefObject<Element | null>, margin = '100% 0px') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setNear(true);
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin, near]);
  return near;
}
