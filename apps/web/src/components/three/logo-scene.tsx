import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  NormalBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  TorusGeometry,
  WebGLRenderer,
  type Texture,
} from 'three';

import logoUrl from '@/assets/brand/logo-mark.webp';

import { LOGO_THEMES, type LogoTheme } from './logo-themes';

/**
 * Interactive 3D logo, ported from assets/dashboard3d/qdd-logo-3d.js (the brand kit's
 * web component) onto the app's bundled three.js, so there's no CDN script and the 3D
 * code is shared with the other scenes.
 *
 * The logo is stacked 44 layers deep for real thickness, with two orbit rings, a halo
 * and coloured dust. Pointer: tilts toward it and the light follows. Drag: spins with
 * inertia, then settles front-on. Tap/click: pulse and ring spin-up. Idle: gentle float.
 * Pauses off-screen and in background tabs.
 */

function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export default function LogoScene({
  theme = 'brand',
  active,
  reducedMotion,
  compact = false,
  onLight = false,
  onReady,
}: {
  theme?: LogoTheme;
  /** False when scrolled away: the loop stops. */
  active: boolean;
  reducedMotion: boolean;
  /** Fewer particles, for phones and small cards. */
  compact?: boolean;
  /** Transparent over a light background: glows use normal blending (additive vanishes on white). */
  onLight?: boolean;
  onReady?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ setTheme: (t: LogoTheme) => void; setActive: (a: boolean) => void } | null>(
    null,
  );
  // Latest props for the one-time setup below (kept in a ref so setup never re-runs).
  const settings = useRef({ reducedMotion, onReady, theme, active });
  useEffect(() => {
    settings.current = { reducedMotion, onReady, theme, active };
  });

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const { reducedMotion: reduce } = settings.current;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = SRGBColorSpace;
    // Shader compile logs are for development; in production they only cost time and
    // surface harmless driver notes as console warnings.
    renderer.debug.checkShaderErrors = import.meta.env.DEV;
    Object.assign(renderer.domElement.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
    });
    el.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(35, 1, 0.1, 100);
    const textures: Texture[] = [];
    const logoTexture = new TextureLoader().load(logoUrl, () => renderer.render(scene, camera));
    logoTexture.colorSpace = SRGBColorSpace;
    logoTexture.anisotropy = 8;
    const glow = glowTexture();
    const blending = onLight ? NormalBlending : AdditiveBlending;

    // Soft contact shadow on the "floor" under the logo: a squashed radial sprite that
    // shrinks and fades as the logo floats up, which is what sells the depth.
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d')!;
    const shadowGradient = shadowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    shadowGradient.addColorStop(0, 'rgba(7,13,40,0.55)');
    shadowGradient.addColorStop(0.5, 'rgba(7,13,40,0.22)');
    shadowGradient.addColorStop(1, 'rgba(7,13,40,0)');
    shadowCtx.fillStyle = shadowGradient;
    shadowCtx.fillRect(0, 0, 128, 128);
    const shadowTexture = new CanvasTexture(shadowCanvas);
    textures.push(logoTexture, glow, shadowTexture);

    const root = new Group();
    const logo = new Group();
    scene.add(root);
    root.add(logo);

    // Stacked layers give the flat logo real depth; the edge layers shade blue to navy.
    const width = 2.6;
    const plane = new PlaneGeometry(width, (width * 373) / 400);
    const layers = compact ? 28 : 44;
    const depth = 0.38;
    const edgeBack = new Color('#0d1f6e');
    const edgeFront = new Color('#2b5fe0');
    for (let i = 0; i < layers; i++) {
      const u = i / (layers - 1);
      const material =
        i === layers - 1
          ? new MeshStandardMaterial({
              map: logoTexture,
              alphaTest: 0.5,
              roughness: 0.32,
              metalness: 0.12,
            })
          : i === 0
            ? new MeshStandardMaterial({
                map: logoTexture,
                alphaTest: 0.5,
                roughness: 0.5,
                side: DoubleSide,
              })
            : new MeshBasicMaterial({
                map: logoTexture,
                alphaTest: 0.5,
                color: edgeBack.clone().lerp(edgeFront, u),
                side: DoubleSide,
              });
      const layer = new Mesh(plane, material);
      layer.position.z = -depth / 2 + depth * u;
      logo.add(layer);
    }

    const halo = new Sprite(
      new SpriteMaterial({
        map: glow,
        transparent: true,
        opacity: onLight ? 0.3 : 0.55,
        depthWrite: false,
        blending,
      }),
    );
    halo.scale.set(5.2, 5.2, 1);
    halo.position.z = -0.8;
    root.add(halo);

    type Ring = {
      group: Group;
      line: Mesh<TorusGeometry, MeshBasicMaterial>;
      aura: Mesh<TorusGeometry, MeshBasicMaterial>;
      satellite: Mesh;
      satelliteGlow: Sprite;
      radius: number;
      speed: number;
      angle: number;
    };
    const rings: Ring[] = (
      [
        [1.85, 1.22, 0],
        [1.6, 1.05, 0.55],
      ] as const
    ).map(([radius, rx, ry], i) => {
      const group = new Group();
      group.rotation.set(rx, ry, 0);
      const line = new Mesh(
        new TorusGeometry(radius, 0.02, 12, 240),
        new MeshBasicMaterial({ transparent: true, opacity: 0.95 }),
      );
      const aura = new Mesh(
        new TorusGeometry(radius, 0.075, 12, 240),
        new MeshBasicMaterial({
          transparent: true,
          opacity: onLight ? 0.14 : 0.2,
          blending,
          depthWrite: false,
        }),
      );
      const satellite = new Mesh(
        new SphereGeometry(0.065, 20, 20),
        new MeshBasicMaterial({ color: '#ffffff' }),
      );
      const satelliteGlow = new Sprite(
        new SpriteMaterial({
          map: glow,
          transparent: true,
          blending,
          depthWrite: false,
        }),
      );
      satelliteGlow.scale.set(0.6, 0.6, 1);
      satellite.add(satelliteGlow);
      group.add(line, aura, satellite);
      root.add(group);
      return {
        group,
        line,
        aura,
        satellite,
        satelliteGlow,
        radius,
        speed: i ? -0.7 : 0.5,
        angle: i * 2,
      };
    });

    // Coloured dust in a soft shell around the logo.
    const count = compact ? 140 : 320;
    const positions = new Float32Array(count * 3);
    const colours = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.3 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.set(
        [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.7,
          r * Math.cos(phi) * 0.6,
        ],
        i * 3,
      );
    }
    const dustGeometry = new BufferGeometry();
    dustGeometry.setAttribute('position', new BufferAttribute(positions, 3));
    dustGeometry.setAttribute('color', new BufferAttribute(colours, 3));
    const dust = new Points(
      dustGeometry,
      new PointsMaterial({
        size: compact ? 0.07 : 0.06,
        map: glow,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending,
      }),
    );
    scene.add(dust);

    const shadow = new Sprite(
      new SpriteMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.8,
      }),
    );
    shadow.position.set(0, -1.75, -0.4);
    shadow.scale.set(2.8, 0.42, 1);
    scene.add(shadow);

    scene.add(new AmbientLight('#ffffff', 1.1));
    const key = new DirectionalLight('#ffffff', 1.4);
    key.position.set(2, 3, 5);
    scene.add(key);
    const spot = new PointLight('#ffffff', 25, 9);
    spot.position.set(0, 0, 2.5);
    scene.add(spot);

    const setTheme = (name: LogoTheme) => {
      const t = LOGO_THEMES[name];
      rings.forEach((ring, i) => {
        const c = t.v[(i + 1) % t.v.length]!;
        ring.line.material.color.set(c);
        ring.aura.material.color.set(c);
        (ring.satelliteGlow.material as SpriteMaterial).color.set(t.v[i % t.v.length]!);
      });
      (halo.material as SpriteMaterial).color.set(t.glow);
      spot.color.set(t.glow);
      const c = new Color();
      for (let i = 0; i < count; i++) {
        c.set(t.v[i % t.v.length]!);
        colours.set([c.r, c.g, c.b], i * 3);
      }
      dustGeometry.attributes.color!.needsUpdate = true;
    };
    setTheme(settings.current.theme);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = (compact ? 6.6 : 8) / Math.min(1, camera.aspect * 1.05);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(el);
    resize();

    // Pointer: tilt, drag-to-spin with inertia, click pulse.
    const pointer = { nx: 0, ny: 0, inside: false, down: false, lastX: 0, moved: 0 };
    let spin = 0;
    let velocity = 0;
    let pulse = 0;
    let boost = 0;
    let scale = 1;
    let rx = 0;
    let ry = 0;
    const locate = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const onMove = (e: PointerEvent) => {
      locate(e);
      pointer.inside = e.pointerType === 'mouse' || pointer.down;
      if (pointer.down) {
        const dx = e.clientX - pointer.lastX;
        pointer.lastX = e.clientX;
        pointer.moved += Math.abs(dx);
        velocity = dx * 0.012;
        spin += velocity;
      }
    };
    const onDown = (e: PointerEvent) => {
      locate(e);
      pointer.down = true;
      pointer.lastX = e.clientX;
      pointer.moved = 0;
      velocity = 0;
      el.style.cursor = 'grabbing';
      el.setPointerCapture(e.pointerId);
    };
    const onUp = () => {
      if (pointer.down && pointer.moved < 6) {
        pulse = 1;
        boost = 6;
        velocity += 0.32;
      }
      pointer.down = false;
      el.style.cursor = 'grab';
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', onLeave);

    let raf = 0;
    let last = performance.now();
    let t = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const tx = pointer.inside ? pointer.ny * 0.38 : reduce ? 0 : Math.sin(t * 0.6) * 0.08;
      const ty = pointer.inside ? pointer.nx * 0.55 : reduce ? 0 : Math.sin(t * 0.45) * 0.3;
      rx += (tx - rx) * 0.08;
      ry += (ty - ry) * 0.08;
      if (!pointer.down) {
        velocity *= 0.95;
        spin += velocity;
        if (Math.abs(velocity) < 0.01) {
          const target = Math.round(spin / (Math.PI * 2)) * Math.PI * 2;
          spin += (target - spin) * 0.06;
        }
      }
      logo.rotation.set(rx, ry + spin, 0);
      root.rotation.set(rx * 0.5, ry * 0.5, 0);
      root.position.y = reduce ? 0 : Math.sin(t * 1.3) * 0.07;
      // Higher logo: smaller, fainter shadow.
      const lift = root.position.y / 0.07;
      shadow.scale.set(2.8 - lift * 0.25, 0.42 - lift * 0.04, 1);
      (shadow.material as SpriteMaterial).opacity = (onLight ? 0.8 : 0.55) - lift * 0.15;
      pulse *= 0.92;
      boost *= 0.95;
      scale += ((pointer.inside ? 1.06 : 1) + pulse * 0.12 - scale) * 0.12;
      logo.scale.setScalar(scale);
      (halo.material as SpriteMaterial).opacity = 0.45 + pulse * 0.5 + (pointer.inside ? 0.1 : 0);
      for (const ring of rings) {
        ring.angle += dt * ring.speed * (1 + boost);
        ring.satellite.position.set(
          Math.cos(ring.angle) * ring.radius,
          Math.sin(ring.angle) * ring.radius,
          0,
        );
        ring.group.rotation.z += dt * ring.speed * 0.15 * (1 + boost);
        ring.group.scale.setScalar(1 + pulse * 0.08 + (pointer.inside ? 0.03 : 0));
      }
      dust.rotation.y += dt * (0.05 + boost * 0.05);
      dust.rotation.x = rx * 0.3;
      spot.position.set(pointer.nx * 3, -pointer.ny * 2.2, 2.6);
      renderer.render(scene, camera);
    };

    const setActive = (running: boolean) => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    api.current = { setTheme, setActive };
    setActive(settings.current.active);
    settings.current.onReady?.();

    return () => {
      api.current = null;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('pointerleave', onLeave);
      scene.traverse((object) => {
        const item = object as Mesh;
        item.geometry?.dispose();
        const material = item.material;
        if (material) (Array.isArray(material) ? material : [material]).forEach((m) => m.dispose());
      });
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [compact, onLight]);

  useEffect(() => {
    api.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    api.current?.setActive(active);
  }, [active]);

  return (
    <div
      ref={host}
      aria-hidden
      // Horizontal drags spin the logo; vertical swipes still scroll the page.
      className="absolute inset-0 cursor-grab touch-pan-y select-none"
    />
  );
}
