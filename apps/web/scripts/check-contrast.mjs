// Checks every text/background pair in the design tokens against WCAG AA (4.5:1),
// in light and dark, including each festival palette. Run: pnpm check:contrast
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const css = read('../src/styles.css');
const festive = read('../src/lib/festive-themes.ts');

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/** [text token, background token] pairs that appear together in components. */
const corePairs = [
  ['ink', 'canvas'],
  ['ink', 'surface'],
  ['ink', 'sunken'],
  ['ink-muted', 'canvas'],
  ['ink-muted', 'surface'],
  ['ink-subtle', 'canvas'],
  ['ink-subtle', 'surface'],
  ['ink-subtle', 'sunken'],
  ['brand', 'canvas'],
  ['brand', 'surface'],
  ['on-brand', 'brand'],
  ['on-brand', 'brand-strong'],
  ['on-brand-soft', 'brand-soft'],
  ['on-aqua', 'aqua'],
  ['on-aqua-soft', 'aqua-soft'],
  ['ink', 'aqua-soft'],
  ['on-topbar', 'topbar'],
  ['on-scrim', 'scrim'],
  ['on-hero', 'hero-from'],
  ['on-hero', 'hero-to'],
  ['on-hero-muted', 'hero-from'],
  ['on-hero-muted', 'hero-to'],
  ['on-highlight', 'highlight'],
  ['on-highlight-soft', 'highlight-soft'],
  ['success', 'success-soft'],
  ['success', 'surface'],
  ['warning', 'warning-soft'],
  ['danger', 'danger-soft'],
  ['danger', 'surface'],
  ['on-danger', 'danger'],
  ['ink-muted', 'sunken'],
];

let failures = 0;
const report = (name, value) => {
  const ok = value >= 4.5;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${value.toFixed(2).padStart(5)}  ${name}`);
};

for (const theme of ['light', 'dark']) {
  // Light tokens live in `@theme { ... }`, dark overrides in `:root[data-theme='dark'] { ... }`.
  const opener = theme === 'light' ? '@theme {' : ":root[data-theme='dark'] {";
  const block = css.slice(css.indexOf(opener), css.indexOf('\n}', css.indexOf(opener)));
  const tokens = Object.fromEntries(
    [...block.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, k, v]) => [k, v]),
  );
  for (const [text, bg] of corePairs) {
    if (!tokens[text] || !tokens[bg]) throw new Error(`Missing token ${text} or ${bg} (${theme})`);
    report(`${theme} ${text} on ${bg}`, ratio(tokens[text], tokens[bg]));
  }
}

const palette =
  /(light|dark): \{\s*festive: '(#\w+)',\s*festiveEnd: '(#\w+)',\s*onFestive: '(#\w+)',\s*festiveSoft: '(#\w+)',\s*onFestiveSoft: '(#\w+)'/g;
const names = [...festive.matchAll(/^ {2}'?([\w-]+)'?: \{\n {4}label/gm)].map((m) => m[1]);
let index = 0;
for (const [, theme, start, end, on, soft, onSoft] of festive.matchAll(palette)) {
  const name = `${names[Math.floor(index++ / 2)]} ${theme}`;
  report(`festival ${name}: text on gradient start`, ratio(on, start));
  report(`festival ${name}: text on gradient end`, ratio(on, end));
  report(`festival ${name}: text on soft`, ratio(onSoft, soft));
}
if (index !== names.length * 2)
  throw new Error(`Parsed ${index} palettes for ${names.length} festivals`);

console.log(failures ? `\n${failures} pair(s) below 4.5:1` : '\nAll pairs pass WCAG AA.');
process.exit(failures ? 1 : 0);
