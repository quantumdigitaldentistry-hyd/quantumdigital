import { useEffect, useRef } from 'react';

import type { FestivalEffect } from '@/lib/festival-packs';
import { prefersReducedMotion } from '@/lib/motion';

type Particle = {
  x: number; // 0..1 of width
  y: number; // 0..1 of height
  z: number; // depth 0.25 (far) .. 1 (near)
  size: number;
  spin: number;
  angle: number;
  phase: number;
  colour: string;
};

const PALETTES: Record<FestivalEffect, string[]> = {
  embers: ['#ffb703', '#ff8c1a', '#ffd166', '#ff6d00'],
  snow: ['#ffffff', '#e8f4ff', '#d9ecff'],
  gulal: ['#ff2e93', '#ffbe0b', '#00c2a8', '#3a86ff', '#8338ec', '#fb5607'],
  petals: ['#ff9f1c', '#ffbf00', '#e85d04', '#ffd166', '#d00000'],
  sparkle: ['#ffd166', '#f2b53c', '#ffffff', '#7fd1ff'],
  stars: ['#ffe8a3', '#ffd166', '#ffffff'],
  kites: ['#ff006e', '#ffbe0b', '#00bbf9', '#00f5d4', '#fb5607'],
  tricolour: ['#ff9933', '#ffffff', '#138808', '#000080'],
};

// How each effect moves: vertical speed (+ falls, - rises) and density.
const MOTION: Record<FestivalEffect, { fall: number; density: number }> = {
  embers: { fall: -0.035, density: 1 },
  snow: { fall: 0.03, density: 1.2 },
  gulal: { fall: -0.012, density: 0.45 },
  petals: { fall: 0.028, density: 0.8 },
  sparkle: { fall: -0.01, density: 0.9 },
  stars: { fall: 0, density: 0.9 },
  kites: { fall: -0.008, density: 0.25 },
  tricolour: { fall: 0.03, density: 0.8 },
};

function draw(
  ctx: CanvasRenderingContext2D,
  effect: FestivalEffect,
  p: Particle,
  x: number,
  y: number,
  t: number,
) {
  const s = p.size * (0.4 + p.z);
  const alpha = 0.25 + p.z * 0.6;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = alpha;
  switch (effect) {
    case 'embers':
    case 'sparkle': {
      // Glowing point of light, twinkling.
      const twinkle = 0.6 + 0.4 * Math.sin(t * 3 + p.phase);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2.6);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.25, p.colour);
      glow.addColorStop(1, 'transparent');
      ctx.globalAlpha = alpha * twinkle;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, s * 2.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'stars': {
      const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.4 + p.phase));
      ctx.globalAlpha = alpha * twinkle;
      ctx.fillStyle = p.colour;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? s * 1.4 : s * 0.45;
        const a = (i * Math.PI) / 4;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'snow': {
      ctx.fillStyle = p.colour;
      ctx.shadowColor = 'rgba(255,255,255,0.8)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'gulal': {
      // Soft cloud of coloured powder.
      const cloud = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 5);
      cloud.addColorStop(0, p.colour);
      cloud.addColorStop(1, 'transparent');
      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.arc(0, 0, s * 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'petals': {
      // Marigold petal: a tilted ellipse that flips as it falls (3D).
      ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.sin(t * 1.2 + p.phase)));
      ctx.fillStyle = p.colour;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 1.1, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'tricolour': {
      // Confetti ribbon that turns in 3D.
      ctx.scale(Math.cos(t * 2 + p.phase), 1);
      ctx.fillStyle = p.colour;
      ctx.fillRect(-s * 0.5, -s * 0.9, s, s * 1.8);
      break;
    }
    case 'kites': {
      ctx.fillStyle = p.colour;
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.6);
      ctx.lineTo(s * 1.1, 0);
      ctx.lineTo(0, s * 1.6);
      ctx.lineTo(-s * 1.1, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = p.colour;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, s * 1.6);
      for (let i = 1; i <= 4; i++)
        ctx.lineTo(Math.sin(t * 2 + i + p.phase) * s * 0.6, s * 1.6 + i * s * 0.9);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

/**
 * Festival ambience: a fixed, click-through canvas behind the page content with the
 * festival's particles (embers for Diwali, marigold petals, snow, gulal, kites,
 * tricolour confetti…). Each particle has a depth: near ones are larger, brighter and
 * move more with scroll and pointer, so the layer reads as 3D space.
 * Off for reduced motion; paused in background tabs.
 */
export function FestivalAmbience({ effect }: { effect: FestivalEffect }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const ctx = context;
    if (prefersReducedMotion()) return;

    const palette = PALETTES[effect];
    const motion = MOTION[effect];
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let seed = 7;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.round(Math.min(90, ((width * height) / 22000) * motion.density));
      particles = Array.from({ length: count }, () => ({
        x: random(),
        y: random(),
        z: 0.25 + random() * 0.75,
        size: 2 + random() * 5,
        spin: (random() - 0.5) * 1.6,
        angle: random() * Math.PI * 2,
        phase: random() * Math.PI * 2,
        colour: palette[Math.floor(random() * palette.length)]!,
      }));
      particles.sort((a, b) => a.z - b.z);
    };

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (event: PointerEvent) => {
      pointer.tx = (event.clientX / width - 0.5) * 2;
      pointer.ty = (event.clientY / height - 0.5) * 2;
    };

    let frame = 0;
    let last = 0;
    let time = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      time += dt;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      const scroll = window.scrollY;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y += (motion.fall * p.z + (effect === 'stars' ? 0 : 0)) * dt;
        p.x += Math.sin(time * 0.5 + p.phase) * 0.004 * dt * 10 * p.z;
        p.angle += p.spin * dt;
        if (p.y > 1.08) p.y -= 1.16;
        if (p.y < -0.08) p.y += 1.16;
        // Depth parallax: near particles shift more with scroll and the pointer.
        const parallaxY = ((scroll * 0.25 * p.z) % height) / height;
        let y = (p.y - parallaxY) % 1.16;
        if (y < -0.08) y += 1.16;
        const x = p.x * width + pointer.x * 30 * p.z;
        draw(ctx, effect, p, x, y * height + pointer.y * 20 * p.z, time);
      }
      frame = document.hidden ? 0 : requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && !document.hidden) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    resize();
    start();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', start);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', start);
    };
  }, [effect]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] size-full mix-blend-normal"
    />
  );
}
