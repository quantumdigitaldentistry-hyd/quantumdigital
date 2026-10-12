# Quantum Digital Dentistry: sharp 3D logo (vector)

The logo has been redrawn as a vector, so it stays sharp at every size and on every screen.

## Use this one

**`logo-3d.svg`** is a single file that is responsive, has a transparent background and is only a few KB.

```html
<img
  src="/logo-vector/logo-3d.svg"
  alt="Quantum Digital Dentistry"
  width="545"
  height="520"
  style="width:100%;max-width:420px;height:auto"
  fetchpriority="high"
  decoding="async"
/>
```

- Keep `width`/`height` (for the aspect ratio) so the page doesn't jump while it loads.
- Size it with CSS only (`width:100%; max-width:…`); there is nothing else to configure.
- Off-screen use: replace `fetchpriority="high"` with `loading="lazy"`.

## Other files

- `logo.svg`: the flat (non-3D) vector logo for headers, favicons and print.
- `logo-3d-400/800/1600.webp`: raster fallbacks for places that don't accept SVG, such as some email clients or social uploads.
