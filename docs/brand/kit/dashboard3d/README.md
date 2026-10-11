# qdd-logo-3d — Interactive 3D logo (Quantum Digital Dentistry)

Drop-in web component (three.js r160 from CDN). Works in plain HTML, React, Next.js, Vue, Angular.

## Files

- `qdd-logo-3d.js` — the component
- `logo-mark.png` — transparent logo texture (keep next to the JS, or pass `logo-src`)

## Usage

```html
<script type="module" src="/qdd-logo-3d/qdd-logo-3d.js"></script>
<qdd-logo-3d
  theme="brand"
  style="width:100%;height:420px;border-radius:24px;overflow:hidden"
></qdd-logo-3d>
```

React / Next.js (client only):

```jsx
useEffect(() => {
  import('/qdd-logo-3d/qdd-logo-3d.js');
}, []);
return <qdd-logo-3d theme={activeTheme} compact style={{ display: 'block', height: 260 }} />;
```

## Attributes

- `theme` — `brand` | `independence` | `republic` | `diwali` | `holi` | `ganesh` | `navratri` | `janmashtami` | `raksha` | `sankranti` | `onam` | `eid` | `christmas` (live-switchable; matches `tokens/festival-themes.json`)
- `background` — any CSS colour, or `transparent` (default: theme stage colour)
- `compact` — fewer particles; use for dashboard cards / mobile
- `logo-src` — custom logo URL (high-res PNG with transparency recommended)

## Events

- `logo-click` — fired on click/tap (not on drag).

## Interaction

Hover/move: tilts toward pointer + light follows · Drag: spin with inertia, snaps back to front · Click: pulse + ring spin-up · Idle: gentle float/sway. Touch: horizontal drag spins, vertical scroll still works.

## Performance

Pauses when off-screen or tab hidden · DPR capped at 2 · respects `prefers-reduced-motion` · disposes GPU resources on removal. For mobile apps use inside a WebView, or show `gifs/orbit.gif` as fallback.
