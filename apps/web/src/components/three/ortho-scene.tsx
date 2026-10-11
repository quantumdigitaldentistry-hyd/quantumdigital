import { useEffect, useImperativeHandle, useRef } from 'react';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  CatmullRomCurve3,
  DirectionalLight,
  Group,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import type { ScrollSceneProps } from './types';

/**
 * "Straightening, step by step": an upper arch of 12 teeth that starts crowded and
 * crooked. Scroll progress 0 → 1: brackets appear, the archwire draws in, then the teeth
 * glide and rotate into a smooth arch. Renders only when progress or size changes.
 */

const MATERIALS = { enamel: 0xffffff, gum: 0xe79aa6, metal: 0xc5ced6 };
const TEETH = 12;

/**
 * The ideal arch: x = 1.75t, z = -1.35t² for t in [-1, 1] (front teeth forward).
 * Each tooth faces outward along the arch normal (local +z is the tooth's front face).
 */
const ARCH_WIDTH = 1.75;
const ARCH_DEPTH = 1.35;
function archPoint(t: number, outward = 0) {
  const nx = 2 * ARCH_DEPTH * t;
  const nz = ARCH_WIDTH;
  const length = Math.hypot(nx, nz);
  return {
    x: ARCH_WIDTH * t + (nx / length) * outward,
    z: -ARCH_DEPTH * t * t + (nz / length) * outward,
    rotationY: Math.atan2(nx, nz),
  };
}
const archSlot = (i: number) => archPoint((i / (TEETH - 1)) * 2 - 1);

/** Deterministic "crooked" offsets, so the scene looks the same on every visit. */
const crooked = Array.from({ length: TEETH }, (_, i) => {
  const r = (n: number) => Math.sin(i * 12.9898 + n * 78.233) * 0.5;
  return { dx: r(1) * 0.22, dz: r(2) * 0.38, dy: r(3) * 0.1, ry: r(4) * 1.1, rz: r(5) * 0.35 };
});

function toothGeometry(width: number, height: number) {
  const profile: [number, number][] = [
    [0, -height * 0.55],
    [width * 0.45, -height * 0.5],
    [width * 0.55, -height * 0.1],
    [width * 0.5, height * 0.3],
    [width * 0.35, height * 0.48],
    [0, height * 0.5],
  ];
  const geometry = new LatheGeometry(
    profile.map(([r, y]) => new Vector2(r, y)),
    32,
  );
  geometry.scale(1, 1, 0.62);
  return geometry;
}

const phase = (p: number, a: number, b: number) => MathUtils.smoothstep(p, a, b);

export default function OrthoScene({ ref, onReady }: ScrollSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setProgressRef = useRef<(progress: number) => void>(() => {});
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useImperativeHandle(ref, () => ({ setProgress: (p) => setProgressRef.current(p) }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = SRGBColorSpace;
    // Shader compile logs are for development; in production they only cost time and
    // surface harmless driver notes as console warnings.
    renderer.debug.checkShaderErrors = import.meta.env.DEV;
    renderer.toneMapping = ACESFilmicToneMapping;

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new PerspectiveCamera(32, 1, 0.1, 50);
    const key = new DirectionalLight(0xffffff, 1.3);
    key.position.set(2, 4, 5);
    scene.add(new AmbientLight(0xffffff, 0.55), key);

    const enamel = new MeshPhysicalMaterial({
      color: MATERIALS.enamel,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });
    const metal = new MeshStandardMaterial({
      color: MATERIALS.metal,
      metalness: 1,
      roughness: 0.25,
      transparent: true,
      opacity: 0,
    });
    const gumMaterial = new MeshPhysicalMaterial({
      color: MATERIALS.gum,
      roughness: 0.55,
      transparent: true,
      opacity: 0.85,
    });

    // Gum line following the ideal arch.
    const archPoints = Array.from({ length: 40 }, (_, i) => {
      const { x, z } = archPoint((i / 39) * 2 - 1);
      return new Vector3(x, 0.42, z);
    });
    const archCurve = new CatmullRomCurve3(archPoints);
    const gum = new Mesh(new TubeGeometry(archCurve, 120, 0.2, 12), gumMaterial);
    gum.scale.set(1, 0.6, 1);

    // Teeth: incisors narrow, canines pointed-ish, premolars/molars wider.
    const widths = [0.42, 0.4, 0.34, 0.3, 0.27, 0.3, 0.3, 0.27, 0.3, 0.34, 0.4, 0.42];
    const teeth = widths.map((w, i) => {
      const group = new Group();
      const tooth = new Mesh(toothGeometry(w, i === 5 || i === 6 ? 0.62 : 0.55), enamel);
      const bracket = new Mesh(new BoxGeometry(0.13, 0.11, 0.05), metal);
      bracket.position.set(0, -0.05, w * 0.36);
      group.add(tooth, bracket);
      scene.add(group);
      return { group, slot: archSlot(i), offset: crooked[i]! };
    });

    // Archwire through the bracket line, drawn in with progress.
    const wirePoints = Array.from({ length: 60 }, (_, i) => {
      const { x, z } = archPoint((i / 59) * 2 - 1, 0.17);
      return new Vector3(x, -0.05, z);
    });
    const wireGeometry = new TubeGeometry(new CatmullRomCurve3(wirePoints), 180, 0.018, 6);
    const wire = new Mesh(wireGeometry, metal);
    const wireIndexCount = wireGeometry.index?.count ?? 0;
    scene.add(gum, wire);

    const render = () => renderer.render(scene, camera);

    const setProgress = (progress: number) => {
      const p = MathUtils.clamp(progress, 0, 1);
      // 0.05 → 0.3: brackets and wire appear. 0.3 → 0.95: teeth align.
      const fit = phase(p, 0.05, 0.3);
      const align = phase(p, 0.3, 0.95);
      metal.opacity = fit;
      wireGeometry.setDrawRange(0, Math.floor((wireIndexCount * fit) / 3) * 3);
      for (const { group, slot, offset } of teeth) {
        const k = 1 - align;
        group.position.set(slot.x + offset.dx * k, offset.dy * k, slot.z + offset.dz * k);
        group.rotation.set(0, slot.rotationY + offset.ry * k, offset.rz * k);
      }
      // Camera starts low and front-on, rises to show the whole arch.
      const narrow = camera.aspect < 0.9;
      const distance = narrow ? 9.4 : 5.8;
      const lift = MathUtils.lerp(0.6, 2.6, p);
      camera.position.set(Math.sin(MathUtils.lerp(-0.25, 0.2, p)) * distance, lift, distance);
      camera.lookAt(0, -0.05, -0.55);
      render();
    };

    let lastProgress = 0;
    let frame = 0;
    setProgressRef.current = (p: number) => {
      lastProgress = p;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setProgress(lastProgress);
      });
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      setProgress(lastProgress);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    onReadyRef.current?.();

    return () => {
      setProgressRef.current = () => {};
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) =>
            m.dispose(),
          );
        }
      });
      scene.environment?.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="block size-full" />;
}
