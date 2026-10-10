import { useEffect, useRef } from 'react';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
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
  SphereGeometry,
  SRGBColorSpace,
  Timer,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
 * Hero 3D: a glossy tooth with two orbit rings and "network" nodes, echoing the logo
 * (tooth + swoosh + connected dots). Plain three.js with named imports, so the bundle
 * keeps only the classes used here. Built from lathe profiles, so there is no model file
 * to download. This module is code-split and only loaded by hero-visual.tsx.
 */

export type SceneColours = { brand: string; aqua: string; tooth: string };

/** Radius/height pairs from the base up, spun around the Y axis. */
const CROWN_PROFILE: [number, number][] = [
  [0.0, -0.12],
  [0.64, -0.12],
  [0.78, 0.0],
  [0.9, 0.22],
  [0.95, 0.5],
  [0.92, 0.8],
  [0.8, 1.02],
  [0.62, 1.12],
  [0.42, 1.1],
  [0.22, 0.98],
  [0.0, 0.92],
];

const ROOT_PROFILE: [number, number][] = [
  [0.0, -0.15],
  [0.38, -0.15],
  [0.3, -0.6],
  [0.2, -1.05],
  [0.1, -1.3],
  [0.0, -1.35],
];

const lathe = (profile: [number, number][]) =>
  new LatheGeometry(
    profile.map(([r, y]) => new Vector2(r, y)),
    64,
  );

type Ring = { pivot: Group; spin: Group; material: MeshStandardMaterial; speed: number };

function makeRing(
  radius: number,
  nodes: number,
  tilt: [number, number, number],
  speed: number,
): Ring {
  const material = new MeshStandardMaterial({ roughness: 0.3, emissiveIntensity: 0.45 });
  const pivot = new Group();
  pivot.rotation.set(...tilt);
  const spin = new Group();
  spin.add(new Mesh(new TorusGeometry(radius, 0.018, 12, 180), material));
  const node = new SphereGeometry(0.045, 16, 16);
  for (let i = 0; i < nodes; i++) {
    const angle = (i / nodes) * Math.PI * 2;
    const dot = new Mesh(node, material);
    dot.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    spin.add(dot);
  }
  pivot.add(spin);
  return { pivot, spin, material, speed };
}

export default function ToothScene({
  colours,
  active,
  reducedMotion,
  onReady,
}: {
  colours: SceneColours;
  /** False when the hero is scrolled away: the render loop stops completely. */
  active: boolean;
  reducedMotion: boolean;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{
    setColours: (c: SceneColours) => void;
    setRunning: (running: boolean) => void;
  } | null>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  // Build the scene once; props are pushed in through `api` below.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    // Sharp on retina without paying for 3x on phones.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; // studio reflections, no HDR download
    pmrem.dispose();

    const camera = new PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0.1, 5.1); // far enough that the outer ring never clips

    const rimLight = new DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-4, -1, -3);
    const keyLight = new DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(3, 4, 5);
    scene.add(new AmbientLight(0xffffff, 0.4), keyLight, rimLight);

    const enamel = new MeshPhysicalMaterial({
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      sheen: 0.6,
    });
    const tooth = new Group();
    const body = new Group();
    body.scale.set(1, 1, 0.86);
    body.add(new Mesh(lathe(CROWN_PROFILE), enamel));
    const rootGeometry = lathe(ROOT_PROFILE);
    for (const side of [-1, 1]) {
      const root = new Mesh(rootGeometry, enamel);
      root.position.x = side * 0.34;
      root.rotation.z = side * 0.14;
      body.add(root);
    }
    const rings = [
      makeRing(1.45, 7, [1.2, 0.35, 0], 0.35),
      makeRing(1.65, 5, [1.35, -0.4, 0.3], -0.22),
    ];
    tooth.add(body, ...rings.map((r) => r.pivot));
    scene.add(tooth);

    // Pointer position in -1..1, from anywhere on the page (passive, no re-renders).
    const pointer = new Vector2();
    const onPointerMove = (event: PointerEvent) => {
      pointer.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const timer = new Timer();
    timer.connect(document); // pauses the clock while the tab is hidden
    const frame = (time: number) => {
      timer.update(time);
      const delta = Math.min(timer.getDelta(), 0.1);
      const t = timer.getElapsed();
      // Idle float plus a slow turn; the pointer tilts the tooth towards it (damped).
      tooth.position.y = Math.sin(t * 1.1) * 0.06;
      tooth.rotation.y += delta * 0.22;
      tooth.rotation.x = MathUtils.damp(tooth.rotation.x, -pointer.y * 0.25, 4, delta);
      tooth.rotation.z = MathUtils.damp(tooth.rotation.z, pointer.x * 0.15, 4, delta);
      for (const ring of rings) ring.spin.rotation.z += delta * ring.speed;
      renderer.render(scene, camera);
    };

    api.current = {
      setColours: ({ brand, aqua, tooth: toothColour }) => {
        enamel.color = new Color(toothColour);
        enamel.sheenColor = new Color(aqua);
        rimLight.color = new Color(aqua);
        const [inner, outer] = rings;
        inner?.material.color.set(brand);
        inner?.material.emissive.set(brand);
        outer?.material.color.set(aqua);
        outer?.material.emissive.set(aqua);
        renderer.render(scene, camera);
      },
      setRunning: (running) => {
        renderer.setAnimationLoop(running ? frame : null);
        if (!running) renderer.render(scene, camera); // leave a still frame
      },
    };

    resize();
    onReadyRef.current?.();

    return () => {
      api.current = null;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      timer.dispose();
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

  useEffect(() => {
    api.current?.setColours(colours);
  }, [colours]);

  useEffect(() => {
    api.current?.setRunning(active && !reducedMotion);
  }, [active, reducedMotion]);

  return <canvas ref={canvasRef} aria-hidden className="block size-full" />;
}
