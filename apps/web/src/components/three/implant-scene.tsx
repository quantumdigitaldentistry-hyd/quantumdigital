import { useEffect, useImperativeHandle, useRef } from 'react';
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  PMREMGenerator,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  Shape,
  ShadowMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

import { adaptiveQuality, lightDevice } from './adaptive-quality';
import type { ScrollSceneProps } from './types';

/**
 * "An implant, assembled": a scroll-scrubbed 3D explainer in a sectioned jaw.
 * Scroll progress 0 → 1 drives three phases: the threaded titanium post screws into a
 * prepared site and the bone knits around it, the abutment seats, the crown lands.
 *
 * Smoothness: scroll sets a target and every frame eases towards it, so wheel steps
 * become one continuous motion; while on screen the model also breathes gently. The
 * loop runs only while the canvas is visible and the tab is in front.
 */

// Material colours for the model (anatomy, not UI colours, so not design tokens).
const COLOURS = {
  bone: 0xeee1c8,
  gum: 0xe1848f,
  gumSheen: 0xffc4cc,
  titanium: 0xc5ccd4,
  abutment: 0xd2b06d,
  enamel: 0xf6f1e6,
  root: 0xe8d9b8,
  knit: 0x47c7da,
};

// Jaw layout (model units). The gum crest is at y = 0, the bone crest just below.
const JAW_LENGTH = 3.7;
const BONE_CREST = -0.2;
const JAW_BOTTOM = -2;
const TOOTH_X = 1.2;
/** The section plane sits behind the implant and roots, so they show whole in front of it. */
const SECTION_Z = -0.3;

const ease = (p: number, start: number, end: number) => MathUtils.smoothstep(p, start, end);
/** Ease out with a small overshoot, for things that land. */
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

const lathe = (profile: [number, number][], segments = 72) =>
  new LatheGeometry(
    profile.map(([r, y]) => new Vector2(r, y)),
    segments,
  );

/** Smooth normals across a lathe's seam. */
function smooth(geometry: BufferGeometry) {
  geometry.deleteAttribute('normal');
  geometry.deleteAttribute('uv');
  const merged = mergeVertices(geometry, 1e-4);
  merged.computeVertexNormals();
  return merged;
}

/** Cross-section of the alveolar ridge: narrow rounded crest, wider base. */
function ridgeShape() {
  const shape = new Shape();
  shape.moveTo(-0.62, BONE_CREST - 0.55);
  shape.splineThru([
    new Vector2(-0.4, BONE_CREST - 0.18),
    new Vector2(0, BONE_CREST),
    new Vector2(0.4, BONE_CREST - 0.18),
    new Vector2(0.62, BONE_CREST - 0.55),
    new Vector2(0.8, -1.25),
    new Vector2(0.62, JAW_BOTTOM + 0.12),
    new Vector2(0, JAW_BOTTOM),
    new Vector2(-0.62, JAW_BOTTOM + 0.12),
    new Vector2(-0.8, -1.25),
    new Vector2(-0.62, BONE_CREST - 0.55),
  ]);
  return shape;
}

/** The gum band over the crest. */
function gumShape() {
  const shape = new Shape();
  shape.moveTo(-0.72, -0.66);
  shape.splineThru([new Vector2(-0.44, -0.16), new Vector2(0, 0), new Vector2(0.44, -0.16)]);
  shape.lineTo(0.72, -0.66);
  shape.lineTo(0.64, -0.8);
  shape.splineThru([
    new Vector2(0.38, BONE_CREST - 0.2),
    new Vector2(0, BONE_CREST),
    new Vector2(-0.38, BONE_CREST - 0.2),
    new Vector2(-0.64, -0.8),
  ]);
  shape.closePath();
  return shape;
}

/** Extrude a cross-section along x, centred on the origin. */
function alongX(shape: Shape) {
  const geometry = new ExtrudeGeometry(shape, {
    depth: JAW_LENGTH,
    bevelEnabled: false,
    curveSegments: 28,
  });
  geometry.rotateY(-Math.PI / 2);
  geometry.translate(JAW_LENGTH / 2, 0, 0);
  return geometry;
}

/** Painted cut face: gum, cortical rim, spongy bone, the drilled site. */
function cutFaceTexture() {
  const width = 1024;
  const height = 560;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const y = (modelY: number) => ((0 - modelY) / (0 - JAW_BOTTOM)) * height;
  const x = (modelX: number) => ((modelX + JAW_LENGTH / 2) / JAW_LENGTH) * width;

  // Spongy (cancellous) bone with a denser cortical shell.
  ctx.fillStyle = '#e9d9ba';
  ctx.fillRect(0, 0, width, height);
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 900; i++) {
    const px = random() * width;
    const py = y(BONE_CREST - 0.12) + random() * (height - y(BONE_CREST - 0.12) - 18);
    const r = 2 + random() * 7;
    ctx.fillStyle = `rgba(196, 160, 118, ${0.25 + random() * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(px, py, r * (0.7 + random() * 0.8), r, random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const cortical = ctx.createLinearGradient(0, y(BONE_CREST), 0, y(BONE_CREST - 0.12));
  cortical.addColorStop(0, '#fbf3e3');
  cortical.addColorStop(1, 'rgba(251, 243, 227, 0)');
  ctx.fillStyle = cortical;
  ctx.fillRect(0, y(BONE_CREST), width, y(BONE_CREST - 0.12) - y(BONE_CREST));
  ctx.fillStyle = '#f7eedb';
  ctx.fillRect(0, height - 16, width, 16);
  // Gum band on top.
  const gum = ctx.createLinearGradient(0, 0, 0, y(BONE_CREST));
  gum.addColorStop(0, '#e98e99');
  gum.addColorStop(1, '#cf6f7c');
  ctx.fillStyle = gum;
  ctx.fillRect(0, 0, width, y(BONE_CREST));
  // The prepared site, centred, where the implant goes.
  ctx.fillStyle = 'rgba(120, 82, 52, 0.55)';
  const siteWidth = x(0.2) - x(-0.2);
  ctx.beginPath();
  ctx.roundRect(x(-0.2), y(BONE_CREST) - 2, siteWidth, y(-1.33) - y(BONE_CREST), [
    0,
    0,
    siteWidth / 2,
    siteWidth / 2,
  ]);
  ctx.fill();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** A molar crown: rounded body, four cusps and a central fossa on top. */
function molarGeometry() {
  const geometry = smooth(
    lathe(
      [
        [0, -0.03],
        [0.34, -0.03],
        [0.43, 0.08],
        [0.5, 0.3],
        [0.53, 0.55],
        [0.5, 0.74],
        [0.42, 0.85],
        [0.3, 0.9],
        [0.14, 0.87],
        [0, 0.84],
      ],
      96,
    ),
  );
  const position = geometry.getAttribute('position') as BufferAttribute;
  const v = new Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    const r = Math.hypot(v.x, v.z);
    const angle = Math.atan2(v.z, v.x) + Math.PI / 4;
    const top = MathUtils.smoothstep(v.y, 0.62, 0.86);
    const cusps = 0.075 * (0.5 + 0.5 * Math.cos(4 * angle)) * MathUtils.smoothstep(r, 0.08, 0.38);
    const fossa = -0.06 * (1 - MathUtils.smoothstep(r, 0, 0.24));
    v.y += (cusps + fossa) * top;
    v.z *= 0.9;
    position.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Radius of the implant body at height y (tapered towards the apex). */
const bodyRadius = (y: number) => MathUtils.lerp(0.205, 0.15, MathUtils.smoothstep(-y, 0.25, 1.25));

/** A cut screw thread: a triangular profile swept along a helix. */
function threadGeometry(from: number, to: number, turns: number, depth: number) {
  const perTurn = 56;
  const count = turns * perTurn;
  const pitch = (to - from) / turns;
  const half = pitch * 0.4;
  const positions: number[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const angle = t * turns * Math.PI * 2;
    const y = MathUtils.lerp(from, to, t);
    const r = bodyRadius(y) - 0.006;
    // Thread runs out smoothly at both ends.
    const d = depth * MathUtils.smoothstep(t, 0, 0.06) * (1 - MathUtils.smoothstep(t, 0.94, 1));
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    for (const [radius, dy] of [
      [r, -half],
      [r + d, 0],
      [r, half],
    ] as const) {
      positions.push(c * radius, y + dy, s * radius);
    }
  }
  const indices: number[] = [];
  for (let i = 0; i < count; i++) {
    const a = i * 3;
    const b = a + 3;
    // Lower flank and upper flank of the thread.
    indices.push(a, b, a + 1, a + 1, b, b + 1, a + 1, b + 1, a + 2, a + 2, b + 1, b + 2);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

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

    const renderer = new WebGLRenderer({
      canvas,
      // High-density screens don't need edge smoothing; skipping it saves GPU time.
      antialias: window.devicePixelRatio < 2,
      alpha: true,
    });
    // 1.5x is visually identical here and ~30% cheaper per frame than 2x on phones.
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.debug.checkShaderErrors = import.meta.env.DEV;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.localClippingEnabled = true;
    // Soft shadows cost a whole extra pass: kept for capable computers, off on phones.
    renderer.shadowMap.enabled = !lightDevice();
    renderer.shadowMap.type = PCFShadowMap;

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new PerspectiveCamera(32, 1, 0.1, 60);

    const key = new DirectionalLight(0xffffff, 1.6);
    key.position.set(2.5, 6, 4.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -3;
    key.shadow.radius = 4;
    key.shadow.bias = -0.0004;
    const rim = new DirectionalLight(0xcfeeff, 0.9);
    rim.position.set(-4, 3, -3);
    scene.add(new HemisphereLight(0xffffff, 0xe9dccb, 0.55), key, rim);

    // Bone and gum in front of the section plane are cut away, like a model jaw.
    const section = [new Plane(new Vector3(0, 0, -1), SECTION_Z)];

    const model = new Group();
    scene.add(model);

    // Jaw: bone and gum, sectioned, with a painted cut face.
    const boneMaterial = new MeshStandardMaterial({
      color: COLOURS.bone,
      roughness: 0.82,
      clippingPlanes: section,
      side: DoubleSide,
    });
    const gumMaterial = new MeshPhysicalMaterial({
      color: COLOURS.gum,
      roughness: 0.42,
      sheen: 0.6,
      sheenColor: COLOURS.gumSheen,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
      clippingPlanes: section,
      side: DoubleSide,
    });
    const bone = new Mesh(alongX(ridgeShape()), boneMaterial);
    const gum = new Mesh(alongX(gumShape()), gumMaterial);
    bone.receiveShadow = true;
    gum.receiveShadow = true;
    gum.castShadow = true;
    const cutFace = new Mesh(
      new PlaneGeometry(JAW_LENGTH, -JAW_BOTTOM),
      new MeshStandardMaterial({ map: cutFaceTexture(), roughness: 0.9 }),
    );
    cutFace.position.set(0, JAW_BOTTOM / 2, SECTION_Z + 0.001);
    cutFace.receiveShadow = true;
    model.add(bone, gum, cutFace);

    // Neighbouring natural teeth, so the implant fills a real gap.
    const enamel = new MeshPhysicalMaterial({
      color: COLOURS.enamel,
      roughness: 0.24,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
      sheen: 0.25,
      sheenColor: 0xffffff,
    });
    const rootMaterial = new MeshStandardMaterial({ color: COLOURS.root, roughness: 0.6 });
    const molar = molarGeometry();
    const rootGeometry = smooth(
      lathe([
        [0, -1.42],
        [0.06, -1.4],
        [0.16, -1.1],
        [0.26, -0.5],
        [0.31, -0.1],
        [0.33, 0],
        [0, 0],
      ]),
    );
    for (const side of [-1, 1]) {
      const tooth = new Group();
      const crown = new Mesh(molar, enamel);
      const root = new Mesh(rootGeometry, rootMaterial);
      root.scale.set(1, 1, 0.85);
      crown.castShadow = root.castShadow = true;
      crown.receiveShadow = true;
      tooth.add(crown, root);
      tooth.position.x = side * TOOTH_X;
      tooth.rotation.y = side * 0.4;
      model.add(tooth);
    }

    // The implant: threaded titanium post, gold abutment, crown.
    const titanium = new MeshPhysicalMaterial({
      color: COLOURS.titanium,
      metalness: 1,
      roughness: 0.3,
      clearcoat: 0.2,
    });
    const darkHole = new MeshBasicMaterial({ color: 0x2b3138 });
    const post = new Group();
    const body = new Mesh(
      smooth(
        lathe([
          [0, -1.36],
          [0.07, -1.35],
          [0.12, -1.3],
          [bodyRadius(-1.2), -1.2],
          [bodyRadius(-0.9), -0.9],
          [bodyRadius(-0.6), -0.6],
          [bodyRadius(-0.3), -0.3],
          [0.212, -0.18],
          [0.216, -0.11],
          [0.2, -0.1],
          [0.1, -0.1],
          [0, -0.1],
        ]),
      ),
      titanium,
    );
    const thread = new Mesh(threadGeometry(-1.27, -0.2, 9, 0.05), titanium);
    const socket = new Mesh(new CylinderGeometry(0.085, 0.085, 0.004, 6), darkHole);
    socket.position.y = -0.098;
    body.castShadow = thread.castShadow = true;
    post.add(body, thread, socket);

    const abutment = new Group();
    const abutmentBody = new Mesh(
      smooth(
        lathe([
          [0, -0.1],
          [0.19, -0.1],
          [0.21, -0.04],
          [0.265, 0.1],
          [0.27, 0.15],
          [0.205, 0.2],
          [0.185, 0.44],
          [0.15, 0.5],
          [0, 0.5],
        ]),
      ),
      new MeshPhysicalMaterial({
        color: COLOURS.abutment,
        metalness: 1,
        roughness: 0.28,
        clearcoat: 0.3,
      }),
    );
    const screwAccess = new Mesh(new CylinderGeometry(0.06, 0.06, 0.004, 24), darkHole);
    screwAccess.position.y = 0.502;
    abutmentBody.castShadow = true;
    abutment.add(abutmentBody, screwAccess);

    const crown = new Mesh(molar, enamel);
    crown.castShadow = true;

    // Bone knitting around the post (osseointegration): particles drawn in, a soft glow.
    const knitCount = 240;
    const knitFrom = new Float32Array(knitCount * 3);
    const knitPositions = new Float32Array(knitCount * 3);
    let seed = 11;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < knitCount; i++) {
      // Scattered either side of the post, between the cut face and the post's front.
      const side = random() < 0.5 ? -1 : 1;
      knitFrom[i * 3] = side * (0.32 + random() * 0.55);
      knitFrom[i * 3 + 1] = -0.25 - random() * 1.05;
      knitFrom[i * 3 + 2] = SECTION_Z + 0.03 + random() * 0.4;
    }
    const knitGeometry = new BufferGeometry();
    knitGeometry.setAttribute('position', new BufferAttribute(knitPositions, 3));
    const knitMaterial = new PointsMaterial({
      color: COLOURS.knit,
      size: 0.06,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const knit = new Points(knitGeometry, knitMaterial);

    // A soft ring on the gum when the crown lands.
    const pulseMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const pulse = new Mesh(new RingGeometry(0.5, 0.56, 64), pulseMaterial);
    pulse.rotation.x = -Math.PI / 2;
    pulse.position.y = 0.012;

    model.add(post, abutment, crown, knit, pulse);

    // Contact shadow on an invisible floor.
    const floor = new Mesh(new PlaneGeometry(12, 12), new ShadowMaterial({ opacity: 0.14 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = JAW_BOTTOM - 0.02;
    floor.receiveShadow = true;
    scene.add(floor);

    // ---- Animation ---------------------------------------------------------------
    let target = 0; // from scroll
    let shown = 0; // eased towards target every frame
    let elapsed = 0;

    const pose = (p: number, time: number) => {
      // Phase 1: the post screws down into the prepared site.
      const p1 = ease(p, 0.03, 0.27);
      post.visible = p > 0.01;
      post.position.y = MathUtils.lerp(2.6, 0, p1);
      post.rotation.y = (1 - p1) * Math.PI * 7;
      // Bone knits around it, then settles.
      const k = ease(p, 0.18, 0.34);
      const settle = 1 - ease(p, 0.36, 0.5);
      for (let i = 0; i < knitCount; i++) {
        const fx = knitFrom[i * 3]!;
        const fz = knitFrom[i * 3 + 2]!;
        // Drawn in to the post's surface.
        knitPositions[i * 3] = MathUtils.lerp(fx, Math.sign(fx) * 0.23, k);
        knitPositions[i * 3 + 1] = knitFrom[i * 3 + 1]! + Math.sin(time * 1.6 + i) * 0.01;
        knitPositions[i * 3 + 2] = MathUtils.lerp(fz, fz * 0.3, k);
      }
      knitGeometry.getAttribute('position').needsUpdate = true;
      knitMaterial.opacity = 0.95 * Math.min(1, k * 1.6) * settle;
      // Phase 2: the abutment turns into place and seats.
      const p2 = ease(p, 0.4, 0.6);
      abutment.visible = p > 0.38;
      abutment.position.y = MathUtils.lerp(1.9, 0, p2);
      abutment.rotation.y = (1 - p2) * Math.PI * 2;
      // Phase 3: the crown lands with a small settle, and the gum pulses.
      const p3 = MathUtils.clamp((p - 0.68) / 0.24, 0, 1);
      crown.visible = p > 0.66;
      crown.position.y = MathUtils.lerp(2.2, 0, easeOutBack(p3));
      crown.rotation.y = (1 - ease(p3, 0, 1)) * 0.9;
      const ring = ease(p, 0.88, 1);
      pulse.visible = ring > 0 && ring < 1;
      pulse.scale.setScalar(1 + ring * 1.4);
      pulseMaterial.opacity = 0.55 * (1 - ring);
      // A gentle breath, and the camera moving in for the post, out for the crown.
      model.rotation.y = Math.sin(time * 0.35) * 0.05;
      model.position.y = Math.sin(time * 0.7) * 0.02;
      const angle = MathUtils.lerp(-0.55, 0.42, p) + Math.sin(time * 0.25) * 0.03;
      // Fit the jaw (width) and the teeth (height) for this canvas, then zoom by phase.
      const tanHalf = Math.tan(MathUtils.degToRad(camera.fov / 2));
      const fit = Math.max(1.95 / (tanHalf * camera.aspect), 1.75 / tanHalf);
      const distance = fit * MathUtils.lerp(0.9, 1.02, ease(p, 0.3, 0.95));
      const height = MathUtils.lerp(0.9, 1.6, ease(p, 0.25, 0.9));
      camera.position.set(Math.sin(angle) * distance, height, Math.cos(angle) * distance);
      camera.lookAt(0, MathUtils.lerp(-0.55, -0.15, ease(p, 0.25, 0.9)), 0);
    };

    const render = () => renderer.render(scene, camera);
    // Drops the resolution on devices that can't keep up (see adaptive-quality.ts).
    const quality = adaptiveQuality(renderer, () => resize());

    // Loop only while the canvas is on screen and the tab is visible.
    let frame = 0;
    let last = 0;
    let lastDrawn = 0;
    let onScreen = false;
    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      elapsed += dt;
      // Critically damped follow: smooth on wheel steps, still close behind the scroll.
      shown += (target - shown) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - shown) < 0.0002) shown = target;
      const moving = shown !== target;
      // At rest only the slow idle sway is left: ~20 fps is plenty for it, and keeps the
      // main thread free so the next scroll starts instantly.
      if (moving || now - lastDrawn > 48) {
        if (moving && lastDrawn) quality.sample(now - lastDrawn);
        lastDrawn = now;
        pose(shown, elapsed);
        render();
      }
      if (onScreen && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && onScreen && !document.hidden) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting;
      start();
    });
    visibility.observe(canvas);
    const onVisibility = () => start();
    document.addEventListener('visibilitychange', onVisibility);

    setProgressRef.current = (p: number) => {
      target = MathUtils.clamp(p, 0, 1);
      start();
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      pose(shown, elapsed);
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    onReadyRef.current?.();

    return () => {
      setProgressRef.current = () => {};
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      const disposed = new Set<object>();
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof Points) {
          for (const item of [
            object.geometry,
            ...(Array.isArray(object.material) ? object.material : [object.material]),
          ]) {
            if (disposed.has(item)) continue;
            disposed.add(item);
            if (item instanceof MeshStandardMaterial) item.map?.dispose();
            item.dispose();
          }
        }
      });
      scene.environment?.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="block size-full" />;
}
