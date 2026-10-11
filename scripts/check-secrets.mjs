// Fails if a secret is tracked by git: a real .env file, a key file, or a value that
// looks like a Supabase service key, JWT, private key or filled-in secret variable.
// Runs in CI; run it yourself with `pnpm check:secrets` before pushing.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const forbiddenFile = [
  /(^|\/)\.env(\.(?!example$)[^/]*)?$/, // .env, .env.local, .env.production … (not .env.example)
  /\.(pem|key|p8|p12|jks|keystore)$/,
  /service-?account.*\.json$/i,
];

const secretValue = [
  ['JWT / Supabase key', /eyJhbGciOi[\w-]{10,}\.[\w-]{20,}\.[\w-]{20,}/],
  ['Supabase secret key', /sb_secret_[\w-]{10,}/],
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Google API key', /AIza[\w-]{35}/],
  // NAME=value where the value isn't empty or a placeholder like <…> / your-…
  [
    'filled-in secret variable',
    /\b(SUPABASE_SERVICE_ROLE_KEY|SMTP_PASS|MSG91_AUTH_KEY|RATE_LIMIT_SALT|SUPER_ADMIN_PASSWORD)=(?!$|<|your-|\$|'<)[^\s'"]{6,}/m,
  ],
];

const problems = [];
for (const file of files) {
  if (forbiddenFile.some((pattern) => pattern.test(file))) {
    problems.push(`${file}: this file must not be in git`);
    continue;
  }
  if (/(^|\/)(pnpm-lock\.yaml|.*\.(png|jpe?g|webp|avif|gif|ico|woff2?|glb|mp4))$/.test(file))
    continue;
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue; // deleted in the working tree
  }
  for (const [label, pattern] of secretValue) {
    if (pattern.test(text)) problems.push(`${file}: looks like a ${label}`);
  }
}

if (problems.length) {
  console.error(problems.map((p) => `FAIL  ${p}`).join('\n'));
  console.error('\nMove the value to an ignored .env file and rotate it if it was ever pushed.');
  process.exit(1);
}
console.log(`No secrets in ${files.length} tracked files.`);
