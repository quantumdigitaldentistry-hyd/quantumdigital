# Developer guide

Technical README for **Quantum Digital Dentistry**. For what the product does, see the main [README](README.md).

## Tech stack

| Layer          | Choice                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Monorepo       | pnpm workspaces + Turborepo                                                                        |
| App            | React 19, TypeScript 6, Vite 8                                                                     |
| Routing        | React Router 8 (data mode, every page lazy-loaded, View Transitions)                               |
| Styling        | Tailwind CSS v4 with the "Clinic Sky" design tokens                                                |
| 3D and motion  | three.js (tree-shaken, loaded on idle), GSAP ScrollTrigger, Lenis, CSS scroll-driven animations    |
| Data           | TanStack Query (server state), Zustand (client state), zod                                         |
| Backend        | Supabase: Postgres with row-level security, Auth, Storage, Realtime, Edge Functions (Deno)         |
| Email and SMS  | Gmail SMTP (nodemailer, port 465) from an Edge Function; MSG91 (optional); WhatsApp/SMS deep links |
| Icons and type | Phosphor icons; Sora, Instrument Sans and IBM Plex Mono self-hosted via Fontsource                 |
| Hosting        | Vercel (`apps/web/vercel.json`); any static host works                                             |
| Local backend  | Docker (via the Supabase CLI)                                                                      |
| CI             | GitHub Actions: secrets scan, typecheck, lint, contrast check, build                               |

## Repo layout

```
apps/
  web/                    React web app (Vite)
    src/routes/           Public pages (home, treatments, studio, tourism, gallery, articles…)
    src/components/       UI, landing sections, 3D/fx, gallery, brand (festival)
    src/staff/            Staff area under /staff (appointments, patients, festival, content, team)
    src/lib/              Supabase client, live content hooks, site settings, festival logic
    src/content/          Static clinic content (treatments, doctors, photos and credits)
    vercel.json           Hosting config: SPA rewrite, CSP and security headers, caching
packages/
  shared/                 zod schemas and constants
  supabase/               createSupabaseClient() + generated Database types
  config/                 Shared tsconfig base
supabase/
  migrations/             Database schema, RLS policies, functions (applied in order)
  functions/              Edge Functions: book-appointment, team-invite, send-message
  config.toml             Local Supabase settings (localhost only)
scripts/                  create-super-admin.mjs, check-secrets.mjs
docs/                     Backend guide, design system, brand kit, README screenshots
docs/private/             Deployment runbook (git-ignored, local only)
```

`apps/dental` (an earlier Expo mobile app) and `packages/ui` are excluded from the workspace in `pnpm-workspace.yaml` and aren't built.

## Getting started

Requirements: Node ≥ 22.22, pnpm 10 (`corepack enable`), Git, and **Docker Desktop** for the local backend.

```bash
git clone https://github.com/quantumdigitaldentistry-hyd/quantumdigital.git
cd quantumdigital
pnpm install

# Local backend (Docker must be running)
npx supabase start
npx supabase db reset
npx supabase status -o env            # API_URL, ANON_KEY, SERVICE_ROLE_KEY

cp apps/web/.env.example apps/web/.env.local                  # local URL + anon key
cp supabase/functions/.env.example supabase/functions/.env    # origins, salt, (SMTP)
cp .env.example .env                                          # for the admin script
pnpm admin:create                                             # local super admin

npx supabase functions serve --env-file supabase/functions/.env
pnpm dev                                                      # http://localhost:5173
```

Without a backend (no `VITE_SUPABASE_*`), the public site still runs on its built-in content, and the staff area says the backend isn't connected.

Local emails (invites, password resets) go to Mailpit at http://127.0.0.1:54324.

## Commands (run from the repo root)

| Command                        | What it does                                                       |
| ------------------------------ | ------------------------------------------------------------------ |
| `pnpm dev`                     | Vite dev server                                                    |
| `pnpm build`                   | Production build to `apps/web/dist` (Turborepo, cached)            |
| `pnpm preview`                 | Serve the production build locally                                 |
| `pnpm typecheck` / `pnpm lint` | Checks across every package                                        |
| `pnpm check:contrast`          | WCAG AA check of every colour pair, including festival palettes    |
| `pnpm --filter web check:csp`  | Inline scripts in `index.html` match the CSP hash in `vercel.json` |
| `pnpm check:secrets`           | Fails if a `.env` file, key file or secret value is tracked by git |
| `pnpm admin:create`            | Create the super admin from the root `.env`                        |
| `pnpm db:types`                | Regenerate Supabase types (linked project)                         |
| `pnpm format`                  | Prettier                                                           |
| `npx supabase db diff`         | Must be empty: the database matches the migrations                 |

## Backend

How the database, security rules, Edge Functions, email/SMS and festival packages work is documented in [docs/backend.md](docs/backend.md), including:

- roles (staff, doctor, super admin) and what each can do, enforced by RLS
- invite-only accounts, password rules, the double-booking guard
- the booking function's validation, rate limit and honeypot
- where every secret lives (local `.env` files, Vercel, Supabase secrets)

**Migrations:** add a new file with `npx supabase migration new <name>`. Never edit a migration that has already been applied to the live project.

## Design system

"Clinic Sky", built from the clinic signage, with light/dark themes and Indian festival palettes. See [docs/design-system.md](docs/design-system.md), open `/design` in the running app to see it live, and run `pnpm check:contrast` after any colour change.

## Security

- **Secrets** live only in git-ignored `.env` files and in the Vercel / Supabase secret stores; each `.env.example` lists the names. `pnpm check:secrets` runs in CI. If a secret is ever committed, **rotate it**: deleting it in a later commit doesn't remove it from history.
- `VITE_*` values are bundled into the website, so only the Supabase URL and anon key go there. **Never** the service role key.
- `apps/web/vercel.json` sets a strict Content-Security-Policy (self, `*.supabase.co`, Google Maps, YouTube/Drive embeds), HSTS, `nosniff`, a referrer and permissions policy, and `noindex` for `/staff`.
- Uploaded photos are re-encoded in the browser (EXIF and GPS removed). Gallery videos store only a validated YouTube/Drive ID.

## Deployment

Production is **Supabase Cloud + Vercel**; Docker is only used locally. The step-by-step runbook (first go-live, releases, rollback, sharing a local build, moving to Firebase) is in `docs/private/deployment.md`, which is **git-ignored**. Ask the project owner for a copy. In short:

1. `npx supabase link` → `db push` → `functions deploy` → `secrets set --env-file …`
2. Vercel: import the repo, Root Directory `apps/web`, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Point the domain's DNS at Vercel.

## Dependency policy

`pnpm-workspace.yaml` sets `minimumReleaseAge: 20160`: pnpm only installs versions that have been public for **14 days**, including transitive dependencies. If an install fails with `ERR_PNPM_NO_MATCHING_VERSION`, pick the newest version older than 14 days rather than turning the rule off.

Install, build and the browser console show no warnings or deprecations. Treat a new warning as a bug.

## Performance

- First load is about 114 kB of gzipped JavaScript; each page is a separate chunk.
- The 3D hero never blocks first paint: three.js loads only after idle, when visible, on devices with WebGL2 and enough memory, and not on data saver.
- Images are AVIF/WebP, fonts self-hosted, hashed assets cached for a year. Festival particles pause when the tab is hidden and switch off for reduced motion.
- Budgets: [docs/design-system.md](docs/design-system.md#performance-budget).

## AI agent skills (optional)

Design and animation skills used with coding agents aren't committed. They're listed in `skills-lock.json`; restore them with `npx skills experimental_install`.
