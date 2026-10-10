# Quantam Dental

Dental clinic app for doctors to manage patient contacts and track appointments, with reminder agents (WhatsApp, SMS, voice calls) planned for both doctors and patients.

One React Native codebase ships as:

| Target             | How                                                  |
| ------------------ | ---------------------------------------------------- |
| **Web** (main app) | `pnpm build:web` → static site in `apps/dental/dist` |
| **Android `.apk`** | `pnpm build:apk` → EAS cloud build, download link    |
| **iOS `.ipa`**     | `pnpm build:ipa` → EAS cloud build (no Mac needed)   |

## Tech stack

| Layer    | Choice                                                                                  |
| -------- | --------------------------------------------------------------------------------------- |
| Monorepo | pnpm workspaces + Turborepo                                                             |
| App      | Expo SDK 57, React Native 0.86, React 19, TypeScript                                    |
| Routing  | Expo Router (file-based, real URLs on web)                                              |
| Styling  | Tailwind CSS v4 via [Uniwind](https://uniwind.dev) (same `className` on web and native) |
| Data     | TanStack Query (server state), Zustand (client state)                                   |
| Forms    | react-hook-form + zod (schemas shared in `@quantam/shared`)                             |
| Backend  | Supabase (Postgres, Auth, Storage, Realtime, Edge Functions, pg_cron)                   |
| Builds   | EAS Build (mobile), any static host for web (Vercel config included)                    |
| CI       | GitHub Actions: typecheck, lint, web build                                              |

## Repo layout

```
apps/
  dental/            Expo app → web + Android + iOS
packages/
  ui/                Shared components (Button, Card, Screen) styled with Tailwind
  shared/            zod schemas, constants (appointment statuses, reminder channels)
  supabase/          createSupabaseClient() + generated Database types
  config/            Shared tsconfig base
supabase/            Supabase CLI project: config.toml, migrations/, functions/
```

Packages export TypeScript source directly (`"main": "src/index.ts"`), so Metro compiles them along with the app with no build step. To use Tailwind classes in a new package, add an `@source` line to `apps/dental/src/global.css`.

## Getting started

Requirements: Node ≥ 20.19 (22 recommended), pnpm 10 (`corepack enable`), and Git.

```bash
git clone https://github.com/quantumdigitaldentistry-hyd/quantumdigital.git
cd quantumdigital
pnpm install
cp apps/dental/.env.example apps/dental/.env   # add your Supabase URL + anon key
pnpm web                                       # dev server in the browser
pnpm android                                   # Expo dev server, then press "a" for an emulator/device
```

### AI agent skills (optional)

The design and animation skills used with Claude Code and other coding agents are not committed. They're listed in `skills-lock.json`; restore them with:

```bash
npx skills experimental_install
```

## Commands (run from the repo root)

| Command                                  | What it does                                                |
| ---------------------------------------- | ----------------------------------------------------------- |
| `pnpm web` / `pnpm android` / `pnpm ios` | Start the Expo dev server for that platform                 |
| `pnpm build:web`                         | Static web export to `apps/dental/dist`                     |
| `pnpm build:apk`                         | Android .apk on EAS (`preview` profile)                     |
| `pnpm build:ipa`                         | iOS .ipa on EAS (`preview` profile, ad-hoc)                 |
| `pnpm typecheck` / `pnpm lint`           | Checks across every package (Turborepo)                     |
| `pnpm format`                            | Prettier                                                    |
| `pnpm db:types`                          | Regenerate Supabase types (after `pnpm exec supabase link`) |

## Supabase

1. Create a free project at [supabase.com](https://supabase.com) and copy its **URL** and **anon key** into `apps/dental/.env`.
2. Link the CLI: `pnpm exec supabase login`, then `pnpm exec supabase link --project-ref <ref>`.
3. Add SQL migrations in `supabase/migrations/`, apply them with `pnpm exec supabase db push`, then run `pnpm db:types`.

Running Supabase locally (`supabase start`) needs Docker, but it's optional: the cloud project works on its own. Never put the `service_role` key in the app. `EXPO_PUBLIC_*` values are bundled into the client.

## Security: what's never committed

`.gitignore` keeps these out of the repo:

- **Secrets:** `.env` files (only `.env.example` is committed), signing keys (`*.jks`, `*.keystore`, `*.p12`, `*.p8`, `*.pem`, `*.key`), provisioning profiles, and Firebase/Google service files
- **Generated files:** `node_modules/`, `dist/`, `.expo/`, `.turbo/`, native `ios/` / `android/` folders, built `.apk` / `.aab` / `.ipa` files
- **Local tool state:** Supabase CLI temp files, installed agent skills, OS/editor files

If a secret is ever committed by mistake, **rotate it** (for example, regenerate the Supabase key). Deleting the file in a later commit doesn't remove it from git history.

## Mobile builds (EAS)

1. Sign up for a free account at [expo.dev](https://expo.dev), then from `apps/dental` run `npx eas-cli@latest login` and `npx eas-cli@latest init`.
2. `pnpm build:apk` builds an installable `.apk` you can sideload for free.
3. `pnpm build:ipa` needs an **Apple Developer account ($99/yr)**. EAS asks for your Apple login and handles certificates. Ad-hoc builds only install on registered devices (`npx eas-cli@latest device:create`).

Bundle IDs are `com.quantamdental.app` (iOS and Android) and are set in `apps/dental/app.json`. **Change them before your first store build**, because they can't be changed after release.

Build profiles (`apps/dental/eas.json`):

- `development`: dev client, used to test native modules that Expo Go doesn't include
- `preview`: internal `.apk` / ad-hoc `.ipa`
- `production`: Play Store AAB / App Store `.ipa`, with auto-incremented build numbers

## Web hosting

Any static host works. For Vercel, import the repo and set the **Root Directory** to `apps/dental`; `vercel.json` handles the rest. Add the `EXPO_PUBLIC_SUPABASE_*` env vars in the Vercel dashboard. Netlify and Cloudflare Pages work too (build command `pnpm build:web`, output directory `apps/dental/dist`).

## Costs: what's free and what isn't

| Item                                                                                     | Cost                                                                              |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Expo, EAS Build free tier, Supabase free tier, Vercel/Netlify hobby tier, GitHub Actions | Free (with usage limits; free Supabase projects pause after a week of inactivity) |
| Apple Developer Program (installable .ipa / App Store)                                   | $99 / year                                                                        |
| Google Play publishing                                                                   | $25 one-time (sideloading the .apk is free)                                       |
| WhatsApp Cloud API, SMS, voice-call agents                                               | Pay per message or minute (only trial credits are free)                           |

## Roadmap

1. Doctor auth and DB schema (`clinics`, `doctors`, `patients`, `appointments`, `reminders`) with row-level security
2. Patient contacts and appointment calendar screens
3. Reminder engine: pg_cron → Edge Function → WhatsApp Cloud API / SMS
4. Voice-call reminder agent using the same reminder queue
5. Public marketing pages (Expo web routes, or a separate `apps/site` if SEO needs it)
