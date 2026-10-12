import logoAvif from '@/assets/brand/logo-mark.avif';
import logoWebp from '@/assets/brand/logo-mark.webp';
import wordmarkAvif from '@/assets/brand/wordmark.avif';
import wordmarkWebp from '@/assets/brand/wordmark.webp';
import { useEffect, useState, type CSSProperties } from 'react';

const SEEN_KEY = 'qd-intro-seen';

/** First visit in this browser (not on refresh), motion allowed, not the staff area. */
function shouldPlay() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (location.pathname.startsWith('/staff')) return false;
  try {
    return !localStorage.getItem(SEEN_KEY);
  } catch {
    // Storage blocked (private mode): don't risk replaying it on every page load.
    return false;
  }
}

/**
 * The opening titles, on the very first visit only (never again on refresh): on a dark
 * stage the tooth mark swings in out of depth, the wordmark tilts upright under a sweep of
 * light, then the camera pushes into the logo and the stage closes like an iris onto the
 * site behind it. About 2.6 s; a tap,
 * click or Escape skips it. Transform, opacity and clip-path only (styles.css, `.intro-*`).
 * Decorative, so it's hidden from screen readers, who get the page straight away.
 */
export function IntroReveal() {
  const [phase, setPhase] = useState<'playing' | 'leaving' | 'done'>(() =>
    shouldPlay() ? 'playing' : 'done',
  );

  // Remember as soon as it starts, so a refresh mid-intro doesn't replay it.
  useEffect(() => {
    if (phase !== 'playing') return;
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      // ignore
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'done') return;
    const leave = window.setTimeout(() => setPhase('leaving'), phase === 'playing' ? 1900 : 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPhase('leaving');
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(leave);
      window.removeEventListener('keydown', onKey);
    };
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      aria-hidden
      onClick={() => setPhase('leaving')}
      onAnimationEnd={(event) => {
        if (event.animationName === 'intro-iris') setPhase('done');
      }}
      className="intro-stage fixed inset-0 z-[100] grid cursor-pointer place-items-center overflow-hidden"
      data-phase={phase}
    >
      <span className="intro-rays pointer-events-none absolute inset-[-50%]" />
      <div className="intro-camera relative flex flex-col items-center gap-6 px-6">
        <picture className="intro-mark block">
          <source srcSet={logoAvif} type="image/avif" />
          <img src={logoWebp} alt="" width={400} height={373} className="h-28 w-auto md:h-36" />
        </picture>
        <span className="intro-word relative block">
          <picture className="block">
            <source srcSet={wordmarkAvif} type="image/avif" />
            <img
              src={wordmarkWebp}
              alt=""
              width={960}
              height={248}
              className="h-14 w-auto md:h-20"
            />
          </picture>
          <span
            className="intro-shine absolute inset-0"
            style={
              {
                maskImage: `url(${wordmarkWebp})`,
                WebkitMaskImage: `url(${wordmarkWebp})`,
              } as CSSProperties
            }
          />
        </span>
        <span className="intro-tagline text-center text-label font-semibold tracking-[0.16em] whitespace-nowrap text-white/75 uppercase md:tracking-[0.3em]">
          Specialist dentistry · Hyderabad
        </span>
      </div>
    </div>
  );
}
