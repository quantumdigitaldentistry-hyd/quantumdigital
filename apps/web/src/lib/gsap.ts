import { useEffect, type DependencyList, type RefObject } from 'react';

/**
 * GSAP + ScrollTrigger, loaded on demand so they never weigh on the first paint. Pages
 * render complete without them; scroll scenes are an enhancement layered on top.
 */
let loading: Promise<{
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
}> | null = null;

export function loadGsap() {
  loading ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
    ([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      // Mobile address bars resize the viewport while scrolling; re-measuring then causes jumps.
      ScrollTrigger.config({ ignoreMobileResize: true });
      return { gsap, ScrollTrigger };
    },
  );
  return loading;
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Gsap = Awaited<ReturnType<typeof loadGsap>>;

/**
 * Runs `setup` inside a gsap.context scoped to `scope`, and reverts everything it created
 * on unmount (safe under StrictMode). Skipped entirely for reduced motion.
 */
export function useScrollScene(
  scope: RefObject<HTMLElement | null>,
  setup: (tools: Gsap, element: HTMLElement) => void | (() => void),
  deps: DependencyList = [],
) {
  useEffect(() => {
    const element = scope.current;
    if (!element || prefersReducedMotion()) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    loadGsap().then((tools) => {
      if (cancelled) return;
      let extraCleanup: void | (() => void);
      const context = tools.gsap.context(() => {
        extraCleanup = setup(tools, element);
      }, element);
      revert = () => {
        extraCleanup?.();
        context.revert();
      };
    });
    return () => {
      cancelled = true;
      revert?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are provided by the caller
  }, deps);
}
