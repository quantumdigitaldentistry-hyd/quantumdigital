import type { FestivalKey } from '@quantam/shared';
import { HandGrabbingIcon } from '@phosphor-icons/react';
import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { LogoMark } from '@/components/brand/logo';
import { cx } from '@/lib/cx';
import { canRender3D } from '@/lib/device';
import { useFestival } from '@/lib/festival';
import { getResolvedTheme, subscribeResolvedTheme } from '@/lib/theme';

import { LOGO_THEMES, type LogoTheme } from './logo-themes';

// three.js lives in this chunk, fetched only when needed.
const LogoScene = lazy(() => import('./logo-scene'));

/** Festival campaign → the brand kit's 3D logo theme. */
const themeForFestival: Record<FestivalKey, LogoTheme> = {
  clinic: 'brand',
  'new-year': 'brand',
  'oral-health': 'brand',
  sankranti: 'sankranti',
  holi: 'holi',
  ugadi: 'onam',
  eid: 'eid',
  national: 'independence',
  ganesh: 'ganesh',
  raksha: 'raksha',
  janmashtami: 'janmashtami',
  onam: 'onam',
  dasara: 'navratri',
  diwali: 'diwali',
  christmas: 'christmas',
};

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const useReducedMotion = () =>
  useSyncExternalStore(
    (onChange) => {
      reducedMotionQuery.addEventListener('change', onChange);
      return () => reducedMotionQuery.removeEventListener('change', onChange);
    },
    () => reducedMotionQuery.matches,
  );

/**
 * Hero artwork: the brand kit's interactive 3D logo, floating free over the hero (no
 * background) with a soft glow behind it and a contact shadow beneath it. The flat logo
 * paints immediately; the 3D version fades in once the browser is idle, the hero is on
 * screen and the device can handle it. Its loop pauses when scrolled away.
 */
export function HeroVisual({ className }: { className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const resolvedTheme = useSyncExternalStore(subscribeResolvedTheme, getResolvedTheme);
  const theme = themeForFestival[useFestival((s) => s.festival)];
  const [inView, setInView] = useState(false);
  const [idle, setIdle] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [supported] = useState(canRender3D);
  const [compact] = useState(() => window.matchMedia('(max-width: 767px)').matches);

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
    <div ref={container} className={cx('relative aspect-square w-full', className)}>
      {/* Depth: a soft pool of the theme's glow behind the logo. */}
      <div
        aria-hidden
        className="absolute inset-[4%] transition-[background-image] duration-700"
        style={{
          backgroundImage: `radial-gradient(closest-side, ${LOGO_THEMES[theme].glow}55, transparent)`,
        }}
      />
      {/* Poster: the flat logo with a soft drop shadow, until the 3D is ready. */}
      <LogoMark
        priority
        className={cx(
          'absolute inset-[22%] h-auto w-[56%] drop-shadow-[0_24px_24px_rgb(7_13_40/0.28)] transition-[opacity,scale] duration-700 ease-out',
          sceneReady ? 'scale-90 opacity-0' : 'opacity-100',
        )}
      />
      {load3D ? (
        <Suspense fallback={null}>
          <div
            className={cx(
              'absolute inset-0 transition-opacity duration-700 ease-out',
              sceneReady ? 'opacity-100' : 'opacity-0',
            )}
          >
            <LogoScene
              theme={theme}
              active={inView}
              reducedMotion={reducedMotion}
              compact={compact}
              onLight={resolvedTheme === 'light'}
              onReady={() => setSceneReady(true)}
            />
          </div>
        </Suspense>
      ) : null}
      {sceneReady ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-1 flex items-center justify-center gap-1.5 text-caption font-medium text-on-hero-muted">
          <HandGrabbingIcon size={14} aria-hidden />
          Drag to spin · tap to pulse
        </p>
      ) : null}
    </div>
  );
}
