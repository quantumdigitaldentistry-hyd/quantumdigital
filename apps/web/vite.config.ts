import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    // Inline only tiny assets; images and the loader stay separate, cacheable files.
    assetsInlineLimit: 2048,
    // The one chunk above Vite's 500 kB default is the 3D scene (tree-shaken three.js,
    // ~550 kB, ~137 kB gzipped). It is never part of the first load: hero-visual.tsx fetches
    // it after idle, on capable devices, when the hero is in view. The limit sits just
    // above it, so any growth or any other big chunk still warns.
    chunkSizeWarningLimit: 600,
  },
});
