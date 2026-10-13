import { useEffect, useRef } from 'react';

import { cx } from '@/lib/cx';
import { prefersReducedMotion } from '@/lib/motion';

type Bubble = { x: number; y: number; z: number; r: number; phase: number; hue: 0 | 1 | 2 };

/**
 * A field of glossy bubbles at different depths, drifting slowly upward. Near bubbles are
 * larger, brighter and move more with the pointer (parallax), far ones are small and
 * faint, so the layer reads as 3D space. Drawn on a 2D canvas with perspective maths:
 * no WebGL context, so it's cheap to use on several sections. Each colour's bubble is
 * painted once to a small sprite and stamped, rather than building gradients every frame.
 * It draws at ~30 fps and holds still while the page scrolls; touch devices also get
 * fewer bubbles and a 1× canvas. Pauses off screen and in background tabs; with reduced
 * motion it draws once and stays still.
 */
export function DepthField({
  className,
  density = 1,
  tone = 'light',
}: {
  className?: string;
  /** Multiplier on the number of bubbles (area-based). */
  density?: number;
  /** light: on pale backgrounds. dark: on dark ones (brighter, additive). */
  tone?: 'light' | 'dark';
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const ctx = context;
    const still = prefersReducedMotion();
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    // Phones and tablets: lighter field, half the frame rate, no hi-DPI canvas.
    const light = !finePointer;

    // Colours from the theme tokens, so the field follows light/dark and festival themes.
    const styles = getComputedStyle(document.documentElement);
    const palette = ['--color-aqua', '--color-brand', '--color-highlight'].map(
      (name) => styles.getPropertyValue(name).trim() || '#5fd0e0',
    );

    let width = 0;
    let height = 0;
    let bubbles: Bubble[] = [];
    let seed = 3;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

    const populate = () => {
      const count = Math.round(
        Math.min(light ? 24 : 70, ((width * height) / 26000) * density * (light ? 0.55 : 1)),
      );
      bubbles = Array.from({ length: count }, () => ({
        x: random(),
        y: random(),
        z: 0.15 + random() * 0.85,
        r: 6 + random() * 26,
        phase: random() * Math.PI * 2,
        hue: (random() < 0.62 ? 0 : random() < 0.75 ? 1 : 2) as Bubble['hue'],
      }));
      // Far first, so near bubbles draw on top.
      bubbles.sort((a, b) => a.z - b.z);
    };

    const resize = () => {
      const ratio = light ? 1 : Math.min(window.devicePixelRatio, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      populate();
    };

    // One sprite per colour: a lit sphere (highlight up-left, body colour, soft edge),
    // drawn at full strength and faded per bubble with globalAlpha.
    const SPRITE = 64;
    const sprites = palette.map((colour) => {
      const sprite = document.createElement('canvas');
      sprite.width = sprite.height = SPRITE;
      const g = sprite.getContext('2d')!;
      const c = SPRITE / 2;
      const gradient = g.createRadialGradient(c * 0.65, c * 0.6, c * 0.08, c, c, c);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.35, withAlpha(colour, 0.44));
      gradient.addColorStop(1, withAlpha(colour, 0));
      g.fillStyle = gradient;
      g.beginPath();
      g.arc(c, c, c, 0, Math.PI * 2);
      g.fill();
      return sprite;
    });

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let time = 0;

    const draw = () => {
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = tone === 'dark' ? 'lighter' : 'source-over';
      for (const bubble of bubbles) {
        const depth = bubble.z;
        // Drift up (faster when near), wrap around, sway sideways.
        const y = ((((bubble.y - time * 0.012 * depth) % 1.15) + 1.15) % 1.15) - 0.075;
        const sway = Math.sin(time * 0.6 + bubble.phase) * 0.012;
        const px = (bubble.x + sway) * width + pointer.x * 34 * depth;
        const py = y * height + pointer.y * 24 * depth;
        const radius = bubble.r * (0.35 + depth);
        const alpha = (tone === 'dark' ? 0.32 : 0.34) * depth * depth + 0.05;
        ctx.globalAlpha = Math.min(1, alpha * 3.2);
        ctx.drawImage(sprites[bubble.hue]!, px - radius, py - radius, radius * 2, radius * 2);
      }
    };

    let frame = 0;
    let last = 0;
    let visible = false;
    // The page is scrolling: hold the bubbles still so every frame goes to the scroll.
    let scrolling = false;
    let scrollIdle = 0;
    const tick = (now: number) => {
      frame = 0;
      // ~30 fps everywhere (the drift is slow enough not to show), and nothing at all
      // while the page scrolls. Redrawing a canvas also costs a compositor commit, so
      // this keeps the main thread free for scrolling on slower machines.
      if (scrolling || (last && now - last < 30)) {
        if (visible && !document.hidden) frame = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      time += dt;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      draw();
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (still) return draw();
      if (!frame && visible && !document.hidden) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      scrolling = true;
      window.clearTimeout(scrollIdle);
      scrollIdle = window.setTimeout(() => {
        scrolling = false;
        // Pick up where the drift left off, without a jump.
        last = 0;
      }, 180);
    };
    if (!still) window.addEventListener('scroll', onScroll, { passive: true });

    const onPointer = (event: PointerEvent) => {
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    if (finePointer && !still) window.addEventListener('pointermove', onPointer, { passive: true });

    const sizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    sizeObserver.observe(canvas);
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      start();
    });
    viewObserver.observe(canvas);
    const onVisibility = () => start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(scrollIdle);
      window.removeEventListener('scroll', onScroll);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [density, tone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cx('pointer-events-none absolute inset-0 size-full', className)}
    />
  );
}

/**
 * DepthField behind a tall section: the canvas stays viewport-sized and sticks while the
 * section scrolls past, instead of being as tall as the section (memory).
 */
export function DepthBackdrop({
  density = 0.7,
  className,
}: {
  density?: number;
  className?: string;
}) {
  return (
    <div aria-hidden className={cx('pointer-events-none absolute inset-0 -z-10', className)}>
      <div className="sticky top-0 h-svh">
        <DepthField density={density} />
      </div>
    </div>
  );
}

/** A CSS colour (hex or rgb) with the given alpha. */
function withAlpha(colour: string, alpha: number) {
  const a = Math.max(0, Math.min(1, alpha)).toFixed(3);
  if (colour.startsWith('#')) {
    const hex = colour.length === 4 ? colour.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3') : colour;
    const n = Number.parseInt(hex.slice(1, 7), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  return colour.replace(/rgba?\(([^)]+)\)/, (_, parts: string) => {
    const [r, g, b] = parts.split(/[\s,/]+/);
    return `rgba(${r},${g},${b},${a})`;
  });
}
