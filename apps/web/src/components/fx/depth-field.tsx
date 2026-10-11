import { useEffect, useRef } from 'react';

import { cx } from '@/lib/cx';

type Bubble = { x: number; y: number; z: number; r: number; phase: number; hue: 0 | 1 | 2 };

/**
 * A field of glossy bubbles at different depths, drifting slowly upward. Near bubbles are
 * larger, brighter and move more with the pointer (parallax), far ones are small and
 * faint, so the layer reads as 3D space. Drawn on a 2D canvas with perspective maths:
 * no WebGL context, so it's cheap to use on several sections. Pauses off screen and in
 * background tabs; with reduced motion it draws once and stays still.
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
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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
      const count = Math.round(Math.min(70, ((width * height) / 26000) * density));
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
      const ratio = Math.min(window.devicePixelRatio, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      populate();
    };

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let time = 0;

    const draw = () => {
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
        const colour = palette[bubble.hue]!;
        // A lit sphere: bright highlight up-left, body colour, soft dark edge.
        const gradient = ctx.createRadialGradient(
          px - radius * 0.35,
          py - radius * 0.4,
          radius * 0.08,
          px,
          py,
          radius,
        );
        gradient.addColorStop(0, `rgba(255,255,255,${Math.min(1, alpha * 3.2)})`);
        gradient.addColorStop(0.35, withAlpha(colour, alpha * 1.4));
        gradient.addColorStop(1, withAlpha(colour, 0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let frame = 0;
    let last = 0;
    let visible = false;
    const tick = (now: number) => {
      frame = 0;
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
