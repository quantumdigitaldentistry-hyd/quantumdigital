import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import logoAvif from '@/assets/brand/logo-mark.avif';
import logoWebp from '@/assets/brand/logo-mark.webp';
import { cx } from '@/lib/cx';
import { canRender3D } from '@/lib/device';

import type { SceneColours } from './tooth-scene';

// three.js + react-three-fiber live in this chunk, fetched only when needed.
const ToothScene = lazy(() => import('./tooth-scene'));

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const useReducedMotion = () =>
  useSyncExternalStore(
    (onChange) => {
      reducedMotionQuery.addEventListener('change', onChange);
      return () => reducedMotionQuery.removeEventListener('change', onChange);
    },
    () => reducedMotionQuery.matches,
  );

const readColours = (): SceneColours => {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  return { brand: token('--color-brand'), aqua: token('--color-aqua'), tooth: '#ffffff' };
};

/**
 * Hero artwork. Paints the logo immediately (no layout shift, fast LCP), then fades the
 * 3D scene in once the browser is idle, the hero is on screen and the device can handle
 * it. The render loop pauses when the hero scrolls out of view.
 */
export function HeroVisual({ className }: { className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [idle, setIdle] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [supported] = useState(canRender3D);
  const [colours, setColours] = useState(readColours);

  // Re-read the colour tokens whenever the resolved theme flips (dark mode lightens brand
  // blue), including device changes while the mode is "system".
  useEffect(() => {
    const observer = new MutationObserver(() => setColours(readColours()));
    observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      rootMargin: '200px',
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => setIdle(true), { timeout: 2500 });
      return () => cancelIdleCallback(handle);
    }
    const timer = setTimeout(() => setIdle(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const load3D = supported && idle && (inView || sceneReady);

  return (
    <div
      ref={container}
      data-scene-ready={sceneReady}
      className={cx('relative aspect-square w-full', className)}
    >
      <picture>
        <source srcSet={logoAvif} type="image/avif" />
        <img
          src={logoWebp}
          alt=""
          width={400}
          height={373}
          fetchPriority="high"
          className={cx(
            'absolute inset-[18%] size-[64%] object-contain transition-[opacity,scale] duration-700 ease-out',
            sceneReady ? 'scale-90 opacity-0' : 'opacity-100',
          )}
        />
      </picture>
      {load3D ? (
        <Suspense fallback={null}>
          <div
            className={cx(
              'absolute inset-0 transition-opacity duration-700 ease-out',
              sceneReady ? 'opacity-100' : 'opacity-0',
            )}
          >
            <ToothScene
              colours={colours}
              active={inView}
              reducedMotion={reducedMotion}
              onReady={() => setSceneReady(true)}
            />
          </div>
        </Suspense>
      ) : null}
    </div>
  );
}
