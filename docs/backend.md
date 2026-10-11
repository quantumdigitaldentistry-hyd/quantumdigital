# Backend and staff area

The website runs on Supabase: Postgres with row-level security, Auth, Storage, Realtime and three Edge Functions. Everything lives in this repo:

| Piece                                           | Where                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| Database schema, security rules, storage bucket | `supabase/migrations/20261011000000_clinic_backend.sql`                   |
| Edge Functions                                  | `supabase/functions/` (`book-appointment`, `team-invite`, `send-message`) |
| Auth and function settings                      | `supabase/config.toml`                                                    |
| Staff area (dashboard)                          | `apps/web/src/staff/` (routes under `/staff`)                             |
| Public content hooks                            | `apps/web/src/lib/live-content.ts`, `site-settings.ts`                    |

## Who can do what

|                                                 | Visitor                      | Staff | Doctor | Super admin (clinic account) |
| ----------------------------------------------- | ---------------------------- | ----- | ------ | ---------------------------- |
| Book / request a call back                      | yes (via `book-appointment`) |       |        |                              |
| See and manage appointments, calendar, messages |                              | yes   | yes    | yes                          |
| Festival package, opening hours                 | read                         | yes   | yes    | yes                          |
| Articles, before/after, gallery                 | read published               | yes   | yes    | yes                          |
| Add doctors and staff, switch access off        |                              |       | yes    | yes                          |
| Make someone a super admin                      |                              |       |        | yes                          |

These rules are enforced in the database (RLS policies and `SECURITY DEFINER` functions), so they hold even if someone calls the API directly. The hidden dot in the navbar only keeps the staff link out of patients' way; it is not a security feature.

- Accounts are **invite-only**: public sign-up is off. Doctors and the super admin add people from **Team** (email invite, or a one-time temporary password).
- Nobody can change their own role or switch themselves off. Roles are changed only by `set_team_member()`.
- `quantumdigitaldentistry@gmail.com` becomes **super admin** automatically when that account is created.
- Passwords: 10+ characters with upper and lower case, a number and a symbol. Changing a password needs a recent sign-in or an emailed code.
- The database refuses to confirm two overlapping appointments for the same doctor.
- Website bookings are validated, rate-limited (5 per client per 30 minutes) and have a honeypot for bots.
- Uploaded photos are resized and re-encoded in the browser, which removes EXIF data such as GPS location. Before/after cases can't be published without the patient-consent box ticked.
- Gallery videos are added as YouTube or Google Drive links. Only the video ID is stored (the database checks its format), and the site builds the player address itself, so a gallery row can only ever embed `youtube-nocookie.com` or `drive.google.com`. Drive files must be shared as "Anyone with the link" for visitors to play them.

## Run it locally

Needs Docker Desktop.

```bash
npx supabase start                    # first run downloads the images
npx supabase db reset                 # (re)applies the migration on a clean database
npx supabase status -o env            # prints API_URL and ANON_KEY
```

Put the local URL and anon key in `apps/web/.env.local` (git-ignored):

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<ANON_KEY from status>
```

Create the local super admin and serve the functions:

```bash
SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY> \
SUPER_ADMIN_PASSWORD='<password>' node scripts/create-super-admin.mjs

npx supabase functions serve --env-file supabase/functions/.env
```

`supabase/functions/.env` (git-ignored) needs at least `ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4321`, `SITE_URL=http://localhost:5173` and `RATE_LIMIT_SALT=<random>`. Emails sent by Auth locally (invites, password resets) appear in Mailpit at http://127.0.0.1:54324.

## Go live

1. **Create a Supabase project** (region: Mumbai, `ap-south-1`), then link and push:
   ```bash
   npx supabase link --project-ref <ref>
   npx supabase db push
   npx supabase functions deploy book-appointment --no-verify-jwt
   npx supabase functions deploy team-invite
   npx supabase functions deploy send-message
   ```
2. **Auth settings** (Dashboard › Authentication):
   - URL configuration: Site URL `https://<your domain>`, redirect URLs `https://<your domain>/staff/**`.
   - Sign-ups: turn **off** "Allow new users to sign up".
   - SMTP: set a custom SMTP sender (the same Gmail account works: `smtp.gmail.com`, port 465, the app password below), so invite and reset emails are delivered reliably.
3. **Secrets for the functions**:
   ```bash
   npx supabase secrets set \
     ALLOWED_ORIGINS=https://<your domain> \
     SITE_URL=https://<your domain> \
     RATE_LIMIT_SALT=<long random string> \
     CLINIC_EMAIL=quantumdigitaldentistry@gmail.com \
     SMTP_USER=quantumdigitaldentistry@gmail.com \
     SMTP_PASS=<Google app password>
   ```
   The **Google app password** comes from the clinic Google account › Security › 2-Step Verification › App passwords (2-Step Verification must be on). It is not the account password, and it can be revoked at any time.
4. **Create the super admin** with `scripts/create-super-admin.mjs` (see the comments in it), using the project's URL and service role key.
5. **Website env** (Vercel › Project › Environment Variables): `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Dashboard › Settings › API. **Never** the service role key.

## Festival packages

Staff pick a festival in **Festival & hours**. The site then switches to that festival's palette and adds, on every page:

- the festival's deity or symbol in a glowing medallion next to the logo (Unsplash photos, credited);
- festive particles with depth and scroll parallax (diya embers, marigold petals, gulal, snow, kites, tricolour confetti) and warm ambient lighting;
- on Home, a 3D greeting banner with the blessing and the offer, plus the festival logo, loader and browser icon;
- a greeting popup, once per visit, when an offer is set with "Show a welcome popup" on. The medallion reopens it.

The **offer** (discount, title, details, valid-until date, popup on or off) is saved with the festival in `site_settings` and validated by the database. An offer past its date disappears by itself. Eid, Christmas, the national days, Onam, Sankranti and Raksha Bandhan use symbols rather than deity images.

## Messages to patients

- **New request email**: `book-appointment` emails the clinic through Gmail SMTP (port 465; Edge Functions block 587). Without `SMTP_USER` / `SMTP_PASS` it skips the email and the request still appears in the staff area.
- **WhatsApp / SMS from the staff phone** (works today, free): in an appointment, "WhatsApp" and "SMS from this phone" open the phone's app with the message pre-filled: the confirmation, or "available times" built from the doctor's free slots. Each one is logged on the appointment.
- **Automatic confirmation SMS** (optional): needs an MSG91 account and India DLT registration (a sender ID plus an approved template with variables `name`, `date`, `time`, `doctor`). Then:
  ```bash
  npx supabase secrets set MSG91_AUTH_KEY=<key> MSG91_CONFIRM_TEMPLATE_ID=<flow template id>
  ```
  DLT only allows approved templates, so custom messages stay on the WhatsApp/SMS-from-phone path.

## Security headers

`apps/web/vercel.json` sets a Content-Security-Policy (only this site, `*.supabase.co`, the Google Maps embed and YouTube / Google Drive gallery videos), HSTS, `nosniff`, a referrer policy and a permissions policy, and `noindex` for `/staff`. If you change the inline theme script in `index.html`, run `pnpm --filter web check:csp` and update its hash in `vercel.json`.
