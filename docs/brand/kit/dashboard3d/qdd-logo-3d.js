// Quantum Digital Dentistry — interactive 3D logo web component
// Usage: <script type="module" src="/qdd-logo-3d/qdd-logo-3d.js"></script>
//        <qdd-logo-3d theme="brand" style="display:block;width:100%;height:420px"></qdd-logo-3d>
// Attributes: theme (brand|independence|republic|diwali|holi|ganesh|navratri|janmashtami|raksha|sankranti|onam|eid|christmas)
//             logo-src (default ./logo-mark.png next to this file), compact (fewer particles), background (CSS color or "transparent")
import * as T from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const THEMES = {
  brand:        { stage: '#050a24', glow: '#29a9e6', v: ['#1f3fc4', '#29a9e6', '#6fd2e5', '#7b5cff', '#ffffff'] },
  independence: { stage: '#06123a', glow: '#ff9a1f', v: ['#ff7a00', '#ffffff', '#00b140', '#1a3cff', '#ffb300'] },
  republic:     { stage: '#061238', glow: '#3a6bff', v: ['#ff6a00', '#ffd23f', '#00c853', '#2448ff', '#38bdf8'] },
  diwali:       { stage: '#12052a', glow: '#ffb703', v: ['#ffb703', '#ff6d00', '#ff006e', '#9d4edd', '#ffe066'] },
  holi:         { stage: '#18062e', glow: '#ff006e', v: ['#ff006e', '#ffbe0b', '#00f5d4', '#3a86ff', '#8338ec', '#fb5607'] },
  ganesh:       { stage: '#2a0c00', glow: '#ff8c00', v: ['#ff6d00', '#ffc300', '#ff2e2e', '#ff8fab', '#ffe45e'] },
  navratri:     { stage: '#24031a', glow: '#ff4081', v: ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#2979ff', '#d500f9', '#ff4081'] },
  janmashtami:  { stage: '#03122b', glow: '#00d1ff', v: ['#00b4d8', '#06d6a0', '#ffd166', '#7b2cbf', '#4cc9f0'] },
  raksha:       { stage: '#2a0512', glow: '#ff0a54', v: ['#ff0a54', '#ffb703', '#ff5c8a', '#f72585', '#ffe066'] },
  sankranti:    { stage: '#03203d', glow: '#00bbf9', v: ['#ff006e', '#ffbe0b', '#00bbf9', '#00f5d4', '#fb5607'] },
  onam:         { stage: '#0b2006', glow: '#ffb703', v: ['#ffb703', '#fb8500', '#e10600', '#38b000', '#ffea00'] },
  eid:          { stage: '#021f17', glow: '#ffd166', v: ['#ffd166', '#06d6a0', '#118ab2', '#fff4d6', '#90e0ef'] },
  christmas:    { stage: '#03190f', glow: '#ff1e3c', v: ['#ff1e3c', '#00e676', '#ffd700', '#ffffff', '#40c4ff'] },
};
const DEFAULT_LOGO = new URL('./logo-mark.png', import.meta.url).href;

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}

class QddLogo3D extends HTMLElement {
  static get observedAttributes() { return ['theme', 'background']; }
  connectedCallback() {
    if (this._s) return;
    if (!this.style.display) this.style.display = 'block';
    this.style.position = this.style.position || 'relative';
    this.style.touchAction = 'pan-y'; this.style.cursor = 'grab'; this.style.userSelect = 'none';
    if (!this.style.height && !this.clientHeight) this.style.height = '360px';
    this._s = this.mount();
    this.applyBg();
  }
  disconnectedCallback() { this._s && this._s.dispose(); this._s = null; }
  attributeChangedCallback(n) { if (!this._s) return; if (n === 'theme') this._s.setTheme(this.theme()); this.applyBg(); }
  theme() { return THEMES[this.getAttribute('theme')] || THEMES.brand; }
  applyBg() { const b = this.getAttribute('background'); this.style.background = b === 'transparent' ? 'transparent' : (b || this.theme().stage); }

  mount() {
    const el = this, compact = this.hasAttribute('compact'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.outputColorSpace = T.SRGBColorSpace;
    Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
    el.appendChild(renderer.domElement);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(35, 1, .1, 100);
    const tex = new T.TextureLoader().load(this.getAttribute('logo-src') || DEFAULT_LOGO); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 8;
    const glow = glowTex();
    const root = new T.Group(), logo = new T.Group(); scene.add(root); root.add(logo);
    const LW = 2.6, LH = LW * 462 / 495, N = 44, D = .26, geo = new T.PlaneGeometry(LW, LH);
    const eA = new T.Color('#0d1f6e'), eB = new T.Color('#2b5fe0');
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1); let m;
      if (i === N - 1) m = new T.MeshStandardMaterial({ map: tex, alphaTest: .5, roughness: .32, metalness: .12 });
      else if (i === 0) m = new T.MeshStandardMaterial({ map: tex, alphaTest: .5, roughness: .5, side: T.DoubleSide });
      else m = new T.MeshBasicMaterial({ map: tex, alphaTest: .5, color: eA.clone().lerp(eB, u), side: T.DoubleSide });
      const p = new T.Mesh(geo, m); p.position.z = -D / 2 + D * u; logo.add(p);
    }
    const halo = new T.Sprite(new T.SpriteMaterial({ map: glow, transparent: true, opacity: .55, depthWrite: false, blending: T.AdditiveBlending }));
    halo.scale.set(5.2, 5.2, 1); halo.position.z = -.8; root.add(halo);
    const rings = [];
    [[1.85, 1.22, 0], [1.6, 1.05, .55]].forEach(([r, rx, ry], i) => {
      const g = new T.Group(); g.rotation.set(rx, ry, 0);
      const line = new T.Mesh(new T.TorusGeometry(r, .02, 12, 240), new T.MeshBasicMaterial({ transparent: true, opacity: .95 }));
      const aura = new T.Mesh(new T.TorusGeometry(r, .075, 12, 240), new T.MeshBasicMaterial({ transparent: true, opacity: .2, blending: T.AdditiveBlending, depthWrite: false }));
      const sat = new T.Mesh(new T.SphereGeometry(.065, 20, 20), new T.MeshBasicMaterial({ color: '#ffffff' }));
      const sg = new T.Sprite(new T.SpriteMaterial({ map: glow, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); sg.scale.set(.6, .6, 1); sat.add(sg);
      g.add(line, aura, sat); root.add(g); rings.push({ g, line, aura, sat, sg, r, speed: i ? -.7 : .5, a: i * 2 });
    });
    const PN = compact ? 140 : 320, pos = new Float32Array(PN * 3), col = new Float32Array(PN * 3);
    for (let i = 0; i < PN; i++) { const r = 2.3 + Math.random() * 1.6, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * .7, r * Math.cos(ph) * .6], i * 3); }
    const pgeo = new T.BufferGeometry(); pgeo.setAttribute('position', new T.BufferAttribute(pos, 3)); pgeo.setAttribute('color', new T.BufferAttribute(col, 3));
    const dust = new T.Points(pgeo, new T.PointsMaterial({ size: compact ? .07 : .06, map: glow, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    scene.add(dust);
    scene.add(new T.AmbientLight('#ffffff', 1.1));
    const key = new T.DirectionalLight('#ffffff', 1.4); key.position.set(2, 3, 5); scene.add(key);
    const spot = new T.PointLight('#ffffff', 25, 9); spot.position.set(0, 0, 2.5); scene.add(spot);

    const setTheme = th => {
      const v = th.v;
      rings.forEach((r, i) => { r.line.material.color.set(v[(i + 1) % v.length]); r.aura.material.color.set(v[(i + 1) % v.length]); r.sg.material.color.set(v[i % v.length]); });
      halo.material.color.set(th.glow); spot.color.set(th.glow);
      const c = new T.Color(); for (let i = 0; i < PN; i++) { c.set(v[i % v.length]); col.set([c.r, c.g, c.b], i * 3); } pgeo.attributes.color.needsUpdate = true;
    };
    setTheme(this.theme());

    const resize = () => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h;
      camera.position.z = (compact ? 6.6 : 8) / Math.min(1, camera.aspect * 1.05); camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();

    const P = { nx: 0, ny: 0, inside: false, down: false, lx: 0, moved: 0 };
    let spin = 0, vel = 0, pulse = 0, boost = 0, scale = 1, rx = 0, ry = 0;
    const pt = e => { const r = el.getBoundingClientRect(); P.nx = (e.clientX - r.left) / r.width * 2 - 1; P.ny = (e.clientY - r.top) / r.height * 2 - 1; };
    const onMove = e => { pt(e); P.inside = true; if (P.down) { const dx = e.clientX - P.lx; P.lx = e.clientX; P.moved += Math.abs(dx); vel = dx * .012; spin += vel; } };
    const onDown = e => { pt(e); P.down = true; P.lx = e.clientX; P.moved = 0; vel = 0; el.style.cursor = 'grabbing'; el.setPointerCapture && el.setPointerCapture(e.pointerId); };
    const onUp = () => { if (P.down && P.moved < 6) { pulse = 1; boost = 6; vel += .32; el.dispatchEvent(new CustomEvent('logo-click', { bubbles: true })); } P.down = false; el.style.cursor = 'grab'; };
    const onLeave = () => { P.inside = false; };
    el.addEventListener('pointermove', onMove); el.addEventListener('pointerdown', onDown); el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp); el.addEventListener('pointerleave', onLeave);

    let visible = true; const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(el);
    let raf, last = performance.now(), t = 0;
    const frame = now => {
      raf = requestAnimationFrame(frame); if (!visible || document.hidden) { last = now; return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
      const tx = P.inside ? P.ny * .38 : (reduce ? 0 : Math.sin(t * .6) * .08);
      const ty = P.inside ? P.nx * .55 : (reduce ? 0 : Math.sin(t * .45) * .3);
      rx += (tx - rx) * .08; ry += (ty - ry) * .08;
      if (!P.down) { vel *= .95; spin += vel; if (Math.abs(vel) < .01) { const tg = Math.round(spin / (Math.PI * 2)) * Math.PI * 2; spin += (tg - spin) * .06; } }
      logo.rotation.set(rx, ry + spin, 0); root.rotation.set(rx * .5, ry * .5, 0);
      root.position.y = reduce ? 0 : Math.sin(t * 1.3) * .07;
      pulse *= .92; boost *= .95; scale += ((P.inside ? 1.06 : 1) + pulse * .12 - scale) * .12; logo.scale.setScalar(scale);
      halo.material.opacity = .45 + pulse * .5 + (P.inside ? .1 : 0);
      rings.forEach(r => { r.a += dt * r.speed * (1 + boost); r.sat.position.set(Math.cos(r.a) * r.r, Math.sin(r.a) * r.r, 0);
        r.g.rotation.z += dt * r.speed * .15 * (1 + boost); r.g.scale.setScalar(1 + pulse * .08 + (P.inside ? .03 : 0)); });
      dust.rotation.y += dt * (.05 + boost * .05); dust.rotation.x = rx * .3;
      spot.position.set(P.nx * 3, -P.ny * 2.2, 2.6);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);
    return { setTheme, dispose: () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); renderer.domElement.remove();
      scene.traverse(o => { o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); }); } };
  }
}
if (!customElements.get('qdd-logo-3d')) customElements.define('qdd-logo-3d', QddLogo3D);
export default QddLogo3D;
