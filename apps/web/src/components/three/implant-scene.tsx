import { useEffect, useImperativeHandle, useRef } from 'react';
import {
  ACESFilmicToneMapping,
  AmbientLight,
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
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

import type { ScrollSceneProps } from './types';

/**
 * "Implant, assembled": a scroll-scrubbed 3D explainer. Progress 0 → 1 drives three
 * phases: the titanium post screws into the bone, the abutment seats on it, the crown
 * lands on top. It renders only when progress or size changes (no animation loop), so
 * it costs nothing while the visitor isn't scrolling.
 */

// Material colours for the 3D model (not UI colours, so they don't come from tokens).
const MATERIALS = {
  bone: 0xf2e7d5,
  gum: 0xe79aa6,
  titanium: 0xb9c3cd,
  enamel: 0xffffff,
};

const lathe = (profile: [number, number][], segments = 64) =>
  new LatheGeometry(
    profile.map(([r, y]) => new Vector2(r, y)),
    segments,
  );

/** Threaded implant body: a tapered core plus a helical thread. */
function buildPost(material: MeshStandardMaterial) {
  const post = new Group();
  post.add(
    new Mesh(
      lathe([
        [0, -1.3],
        [0.1, -1.3],
        [0.17, -1.15],
        [0.2, -0.6],
        [0.22, 0],
        [0.2, 0.06],
        [0, 0.06],
      ]),
      material,
    ),
  );
  const turns = 8;
  const points: Vector3[] = [];
  for (let i = 0; i <= turns * 32; i++) {
    const t = i / (turns * 32);
    const angle = t * turns * Math.PI * 2;
    const y = -1.18 + t * 1.12;
    const radius = MathUtils.lerp(0.17, 0.235, MathUtils.smoothstep(t, 0, 0.35));
    points.push(new Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
  }
  post.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(points), 300, 0.03, 6), material));
  return post;
}

function buildAbutment(material: MeshStandardMaterial) {
  return new Mesh(
    lathe([
      [0, 0.06],
      [0.16, 0.06],
      [0.27, 0.32],
      [0.24, 0.36],
      [0.15, 0.4],
      [0.13, 0.72],
      [0.09, 0.76],
      [0, 0.76],
    ]),
    material,
  );
}

function buildCrown(material: MeshPhysicalMaterial) {
  const crown = new Mesh(
    lathe([
      [0, 0.34],
      [0.38, 0.34],
      [0.5, 0.48],
      [0.6, 0.74],
      [0.62, 0.98],
      [0.55, 1.18],
      [0.4, 1.28],
      [0.22, 1.22],
      [0, 1.17],
    ]),
    material,
  );
  crown.scale.set(1, 1, 0.88);
  return crown;
}

const phase = (progress: number, start: number, end: number) =>
  MathUtils.smoothstep(progress, start, end);

export default function ImplantScene({ ref, onReady }: ScrollSceneProps) {
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
    // 1.5x is visually identical here and ~30% cheaper per frame than 2x on phones.
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

    const camera = new PerspectiveCamera(34, 1, 0.1, 50);
    const keyLight = new DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 5, 4);
    scene.add(new AmbientLight(0xffffff, 0.5), keyLight);

    const titanium = new MeshStandardMaterial({
      color: MATERIALS.titanium,
      metalness: 1,
      roughness: 0.28,
    });
    const enamel = new MeshPhysicalMaterial({
      color: MATERIALS.enamel,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });

    // See-through bone with a gum layer on top, like an X-ray cutaway.
    const jaw = new Group();
    const bone = new Mesh(
      new RoundedBoxGeometry(2.6, 1.5, 1.4, 4, 0.18),
      new MeshPhysicalMaterial({
        color: MATERIALS.bone,
        roughness: 0.6,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
    );
    bone.position.y = -0.72;
    const gum = new Mesh(
      new RoundedBoxGeometry(2.64, 0.22, 1.44, 4, 0.1),
      new MeshPhysicalMaterial({
        color: MATERIALS.gum,
        roughness: 0.5,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    jaw.add(bone, gum);

    const post = buildPost(titanium);
    const abutment = buildAbutment(titanium);
    const crown = buildCrown(enamel);
    const assembly = new Group();
    assembly.add(post, abutment, crown);
    scene.add(jaw, assembly);

    const render = () => renderer.render(scene, camera);

    const setProgress = (progress: number) => {
      const p = MathUtils.clamp(progress, 0, 1);
      // Phase 1: post screws in (turns as it descends).
      const p1 = phase(p, 0.02, 0.32);
      post.visible = p > 0.005;
      post.position.y = MathUtils.lerp(2.4, 0, p1);
      post.rotation.y = (1 - p1) * Math.PI * 6;
      // Phase 2: abutment seats.
      const p2 = phase(p, 0.36, 0.62);
      abutment.visible = p > 0.34;
      abutment.position.y = MathUtils.lerp(2.2, 0, p2);
      // Phase 3: crown lands with a small settle.
      const p3 = phase(p, 0.68, 0.94);
      crown.visible = p > 0.66;
      crown.position.y = MathUtils.lerp(2.4, 0, p3);
      crown.rotation.y = (1 - p3) * 0.8;
      // Camera orbits slowly around the model across the whole story.
      const angle = MathUtils.lerp(-0.6, 0.5, p);
      const distance = camera.aspect < 0.9 ? 7.2 : 6;
      camera.position.set(Math.sin(angle) * distance, 1.5, Math.cos(angle) * distance);
      camera.lookAt(0, 0.05, 0);
      render();
    };
    // Scroll can report several positions per frame; draw at most once per frame.
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
