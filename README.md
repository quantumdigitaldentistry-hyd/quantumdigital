# Quantam Dental

Web app for **Quantum Digital Dentistry**: a public clinic site now, with doctor tools for patient contacts, appointments and reminders (WhatsApp, SMS, voice) planned next. It's built mobile first and scales up to tablets and desktops.

## Tech stack

| Layer          | Choice                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Monorepo       | pnpm workspaces + Turborepo                                                                      |
| App            | React 19, TypeScript 6, Vite 8                                                                   |
| Routing        | React Router 8 (data mode, every page lazy-loaded, View Transitions)                             |
| Styling        | Tailwind CSS v4 with the "Clinic Sky" design tokens                                              |
| 3D             | three.js (plain, tree-shaken), loaded only when cheap enough                                     |
| Data           | TanStack Query (server state), Zustand (client state), zod (schemas shared in `@quantam/shared`) |
| Backend        | Supabase (Postgres, Auth, Storage, Realtime, Edge Functions, pg_cron)                            |
| Icons and type | Phosphor icons; Sora, Instrument Sans and IBM Plex Mono self-hosted via Fontsource               |
| Hosting        | Any static host; Vercel config included                                                          |
| CI             | GitHub Actions: typecheck, lint, contrast check, build                                           |

## Repo layout

```
apps/
  web/               React web app (Vite)
packages/
  shared/            zod schemas and constants (appointment statuses, festivals, campaigns)
  supabase/          createSupabaseClient() + generated Database types
  config/            Shared tsconfig base
supabase/            Supabase CLI project: config.toml, migrations/, functions/
docs/                Design system and brand kit
```

`apps/dental` (the earlier Expo mobile app) and `packages/ui` (its React Native components) are set aside: they're excluded from the workspace in `pnpm-workspace.yaml` and aren't built. They can be deleted, or brought back when mobile apps are needed.

**Design system:** "Clinic Sky", built from the clinic signage, with light/dark themes and Indian festival themes for offers. See [docs/design-system.md](docs/design-system.md), open `/design` in the running app to see it live, and run `pnpm check:contrast` after any colour change.

Packages export TypeScript source directly (`"main": "src/index.ts"`), so Vite compiles them along with the app with no build step.

## Getting started

Requirements: Node ≥ 22.22, pnpm 10 (`corepack enable`), and Git.

```bash
git clone https://github.com/quantumdigitaldentistry-hyd/quantumdigital.git
cd quantumdigital
pnpm install
cp apps/web/.env.example apps/web/.env   # add your Supabase URL + anon key
pnpm dev                                 # http://localhost:5173
```

### AI agent skills (optional)

The design and animation skills used with Claude Code and other coding agents aren't committed. They're listed in `skills-lock.json`; restore them with:

```bash
npx skills experimental_install
```

## Commands (run from the repo root)

| Command                        | What it does                                                |
| ------------------------------ | ----------------------------------------------------------- |
| `pnpm dev`                     | Vite dev server                                             |
| `pnpm build`                   | Production build to `apps/web/dist` (Turborepo, cached)     |
| `pnpm preview`                 | Serve the production build locally                          |
| `pnpm typecheck` / `pnpm lint` | Checks across every package (Turborepo)                     |
| `pnpm check:contrast`          | WCAG AA check of every colour pair, including festivals     |
| `pnpm format`                  | Prettier                                                    |
| `pnpm db:types`                | Regenerate Supabase types (after `pnpm exec supabase link`) |

## Dependency policy

`pnpm-workspace.yaml` sets `minimumReleaseAge: 20160`, so pnpm only installs versions that have been public for **14 days**, including transitive dependencies. New releases are where regressions and compromised packages usually show up. If an install fails with `ERR_PNPM_NO_MATCHING_VERSION`, pick the newest version older than 14 days rather than turning the rule off.

The install, build and browser console currently show **no warnings and no deprecations**. Keep it that way: treat a new warning as a bug.

## Performance

- The first load is about 114 kB of gzipped JavaScript. Each page is a separate chunk.
- The 3D hero never blocks first paint: the logo shows instantly, and three.js loads only after idle, when the hero is visible, on devices with WebGL2 and enough memory, and not on data saver.
- Images are AVIF/WebP (the logo dropped from 279 kB to 17 kB), fonts are self-hosted, and hashed assets are cached for a year.
- Details and budgets are in [docs/design-system.md](docs/design-system.md#performance-budget).

## Supabase

1. Create a free project at [supabase.com](https://supabase.com) and copy its **URL** and **anon key** into `apps/web/.env`.
2. Link the CLI: `pnpm exec supabase login`, then `pnpm exec supabase link --project-ref <ref>`.
3. Add SQL migrations in `supabase/migrations/`, apply them with `pnpm exec supabase db push`, then run `pnpm db:types`.

Running Supabase locally (`supabase start`) needs Docker, but it's optional: the cloud project works on its own. Never put the `service_role` key in the app. `VITE_*` values are bundled into the site.

## Security: what's never committed

`.gitignore` keeps these out of the repo:

- **Secrets:** `.env` files (only `.env.example` is committed), signing keys and service-account files
- **Generated files:** `node_modules/`, `dist/`, `.turbo/`
- **Local tool state:** Supabase CLI temp files, installed agent skills, OS/editor files

If a secret is ever committed by mistake, **rotate it** (for example, regenerate the Supabase key). Deleting the file in a later commit doesn't remove it from git history.

## Hosting

Any static host works. For Vercel, import the repo and set the **Root Directory** to `apps/web`; `vercel.json` handles the install, build, SPA routing and asset caching. Add the `VITE_SUPABASE_*` env vars in the Vercel dashboard. Netlify and Cloudflare Pages also work (build command `pnpm build`, output directory `apps/web/dist`, and a rewrite of all paths to `/index.html`).

## Costs: what's free and what isn't

| Item                                                          | Cost                                                                              |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Supabase free tier, Vercel/Netlify hobby tier, GitHub Actions | Free (with usage limits; free Supabase projects pause after a week of inactivity) |
| WhatsApp Cloud API, SMS, voice-call agents                    | Pay per message or minute (only trial credits are free)                           |

## Roadmap

1. Doctor auth and DB schema (`clinics`, `doctors`, `patients`, `appointments`, `reminders`, `campaigns`) with row-level security
2. Patient contacts and appointment calendar
3. Online booking from the public site
4. Festival campaigns managed by the clinic (drives the festive theme and offer banners)
5. Reminder engine: pg_cron → Edge Function → WhatsApp Cloud API / SMS, then a voice-call agent on the same queue
