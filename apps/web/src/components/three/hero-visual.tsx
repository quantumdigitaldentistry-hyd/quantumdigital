import type { FestivalKey } from '@quantam/shared';

import logo3d from '@/assets/dashbaordlogo/logo-3d.svg';
import { cx } from '@/lib/cx';
import { useFestival } from '@/lib/festival';

import { LOGO_THEMES, type LogoTheme } from './logo-themes';

/** Festival campaign → the brand kit's logo theme (its glow colour). */
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

/**
 * Hero artwork: the 3D logo from the brand kit (assets/dashbaordlogo/logo-3d.svg). It is
 * a vector, so it stays sharp at every size, and carries its own extruded edge and floor
 * shadow. A soft glow in the festival's colour sits behind it and a drop shadow lifts it
 * off the hero. It settles in once on load and drifts back as the hero scrolls away
 * (.hero-logo-in / .hero-logo-scroll in styles.css).
 */
export function HeroVisual({ className }: { className?: string }) {
  const theme = themeForFestival[useFestival((s) => s.festival)];

  return (
    <div className={cx('relative grid aspect-square w-full place-items-center', className)}>
      {/* Depth: a soft pool of the theme's glow behind the logo. */}
      <div
        aria-hidden
        className="absolute inset-[4%]"
        style={{
          backgroundImage: `radial-gradient(closest-side, ${LOGO_THEMES[theme].glow}55, transparent)`,
        }}
      />
      <div className="hero-logo-scroll relative w-[72%] max-w-104">
        <img
          src={logo3d}
          alt=""
          width={545}
          height={520}
          fetchPriority="high"
          decoding="async"
          className="hero-logo-in block h-auto w-full drop-shadow-[0_28px_36px_rgb(7_13_40/0.28)]"
        />
      </div>
    </div>
  );
}
