// Fails if index.html's inline script no longer matches the hash allowed by the
// Content-Security-Policy in vercel.json (the browser would block it in production).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const html = read('../index.html');
const csp = JSON.parse(read('../vercel.json'))
  .headers.flatMap((rule) => rule.headers)
  .find((header) => header.key === 'Content-Security-Policy').value;

let failed = false;
for (const [, body] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  const hash = `sha256-${createHash('sha256').update(body).digest('base64')}`;
  if (csp.includes(`'${hash}'`)) console.log(`ok    inline script ${hash}`);
  else {
    failed = true;
    console.error(`FAIL  inline script ${hash} is not in the CSP script-src in vercel.json`);
  }
}
if (failed) process.exit(1);
console.log('CSP allows every inline script.');
