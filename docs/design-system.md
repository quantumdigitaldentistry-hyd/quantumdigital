# Quantam Dental design system: "Clinic Sky"

The design system for the **web app**, built mobile first and then scaled up for larger screens. Tokens are defined once in [`apps/web/src/styles.css`](../apps/web/src/styles.css) (Tailwind v4 `@theme`), festival palettes in [`apps/web/src/lib/festive-themes.ts`](../apps/web/src/lib/festive-themes.ts), and components in [`apps/web/src/components/ui`](../apps/web/src/components/ui). To see everything live, including every festival in light and dark, run `pnpm dev` and open **`/design`**.

## Direction

The palette comes from the clinic's own signage ([`docs/brand/clinic-signage.png`](brand/clinic-signage.png)): an **aqua sky**, the **royal-blue tooth mark**, and **sunshine-yellow pills with plum lettering**. Patients already know these colours from the clinic, so the app should feel like the same place: bright, clean, modern and friendly, and still calm enough for staff who use it all day.

Each colour has one job:

| Colour              | Job                                                  | Never                                    |
| ------------------- | ---------------------------------------------------- | ---------------------------------------- |
| **Brand blue**      | Buttons, links, focus, selected state                | Large decorative areas                   |
| **Aqua**            | Brand atmosphere: hero bands, headers, tinted panels | Button fills, or text colour             |
| **Sunshine yellow** | "New", "Featured", everyday offers                   | Warnings (warning has its own token)     |
| **Plum**            | Text on yellow only, as on the signage               | Anything else                            |
| **Festive**         | Offer banners and greetings while a festival runs    | Clinical screens, forms, patient records |

## Readability rules (apply to every screen)

1. **Every text colour has a home.** Text on `bg-x` uses `text-on-x`. Plain backgrounds (`canvas`, `surface`, `sunken`) use `text-ink`, `text-ink-muted` or `text-ink-subtle`. Never put white text on aqua or yellow.
2. **All pairs pass WCAG AA (4.5:1) in light and dark.** That's 130 pairs, including every festival. `pnpm check:contrast` checks them, so run it after changing any colour.
3. **Gradients carry text only when the text passes on both stops.** That's why each gradient has two close stops, not a rainbow.
4. **Colour never carries meaning alone.** Statuses and offers always have a text label.
5. Text is navy ink, never pure black. Body text is at least 16px; nothing is smaller than 12px.

## Colour tokens

Use semantic tokens (`bg-surface`, `text-ink-muted`). **Never put hex values or Tailwind palette classes (`bg-sky-500`) in components.** Each token switches automatically between light and dark.

### Backgrounds and text

| Token         | Light     | Dark      | Use for                                         |
| ------------- | --------- | --------- | ----------------------------------------------- |
| `canvas`      | `#F4F8FA` | `#0A121A` | App background (cool white with an aqua cast)   |
| `surface`     | `#FFFFFF` | `#111C26` | Cards, sheets, list rows                        |
| `sunken`      | `#E8F0F4` | `#070D13` | Input wells, table headers, skeletons           |
| `aqua-soft`   | `#DDF5FA` | `#0E2A33` | Tinted sections, such as "about the clinic"     |
| `line`        | `#D5E2E9` | `#1F2E3B` | Hairlines, card borders                         |
| `line-strong` | `#A9BDC8` | `#33475A` | Input borders, dividers that must be seen       |
| `ink`         | `#0D1B2A` | `#E6EEF4` | Primary text                                    |
| `ink-muted`   | `#46586A` | `#9DB0C0` | Secondary text                                  |
| `ink-subtle`  | `#5D6E7E` | `#7F93A5` | Placeholders and meta (still 4.5:1 on `sunken`) |

### Brand and status

| Token pair (bg / text)                           | Light                 | Dark                  |
| ------------------------------------------------ | --------------------- | --------------------- |
| `brand` / `on-brand`                             | `#1A5BC4` / `#FFFFFF` | `#7FB2FF` / `#06162E` |
| `brand-soft` / `on-brand-soft`                   | `#E3EEFB` / `#13469B` | `#13284A` / `#B7D3FF` |
| `aqua` / `on-aqua`                               | `#6DD3E6` / `#0D1B2A` | `#5CC8DC` / `#04141A` |
| `highlight` / `on-highlight`                     | `#FFE419` / `#4A1D6B` | `#FFE419` / `#3A1556` |
| `highlight-soft` / `on-highlight-soft`           | `#FFF8C7` / `#4A1D6B` | `#2E2A0B` / `#FFE97A` |
| `success-soft` / `success`                       | `#E0F3E8` / `#1C7A4A` | `#0F2E20` / `#5FD49A` |
| `warning-soft` / `warning`                       | `#FCEFD6` / `#8A5300` | `#33260C` / `#F5BE5C` |
| `danger-soft` / `danger`, `danger` / `on-danger` | `#FBE5E2` / `#B3261E` | `#3A1913` / `#FF9580` |

In dark mode, brand blue gets lighter and the text on it turns dark. Always pair `bg-brand` with `text-on-brand`, and never hard-code white.

Light/dark: `index.html` sets `<html data-theme>` before first paint (saved choice, otherwise the device setting), so there's no flash. [`lib/theme.ts`](../apps/web/src/lib/theme.ts) keeps it in sync and follows device changes while set to "system". Dark values override the tokens under `:root[data-theme='dark']`, and the `dark:` variant is available for the rare one-off.

### Gradients

Use **linear** gradients with two close stops, so text can be checked against both ends.

| Gradient | Classes                                       | Text classes                         | Where                                   |
| -------- | --------------------------------------------- | ------------------------------------ | --------------------------------------- |
| Hero     | `bg-linear-to-br from-hero-from to-hero-to`   | `text-on-hero`, `text-on-hero-muted` | Home hero, page headers, doctor avatars |
| Festive  | `bg-linear-to-br from-festive to-festive-end` | `text-on-festive`                    | `<OfferBanner>`, greeting cards         |

Light hero runs `#A9E7F2 → #6DD3E6` (the signage sky). Dark hero runs `#12394A → #0B2533` (deep ocean). Rules: **at most one gradient band per screen**, no gradients on buttons, inputs or list rows, and the rest of the screen sits on plain `canvas`.

### Appointment status

Use `appointmentStatusBadge` from [`apps/web/src/lib/status.ts`](../apps/web/src/lib/status.ts).

| Status    | Badge tone |
| --------- | ---------- |
| Scheduled | `brand`    |
| Confirmed | `success`  |
| Completed | `neutral`  |
| Cancelled | `danger`   |
| No-show   | `warning`  |

There are two more badge tones: `highlight` ("New") and `festive` (for example "Deepavali offer").

## Festival themes

The clinic runs offers for Indian festivals. A festival **only repaints the six `festive*` tokens**. Brand, ink, backgrounds and status colours never change, so patient records, forms and the calendar look and read the same all year. Only offer banners, greeting cards, festive badges and the `festive` button change.

| Key           | Festival                       | Light look                            | Greeting                  |
| ------------- | ------------------------------ | ------------------------------------- | ------------------------- |
| `clinic`      | Everyday (default)             | Sunshine yellow, plum text            | Quantum Digital Dentistry |
| `new-year`    | New Year                       | Midnight navy, yellow text            | Happy New Year            |
| `sankranti`   | Sankranti                      | Kite saffron, sky-blue dots           | Happy Sankranti           |
| `holi`        | Holi                           | Gulal magenta to purple, green dots   | Happy Holi                |
| `ugadi`       | Ugadi                          | Mango-leaf green, turmeric dots       | Ugadi Subhakankshalu      |
| `oral-health` | World Oral Health Day (20 Mar) | Clinic aqua, navy text                | Smile check-up week       |
| `eid`         | Ramzan                         | Emerald, gold dots                    | Eid Mubarak               |
| `national`    | Independence / Republic Day    | Chakra navy, saffron tint, green dots | Jai Hind                  |
| `ganesh`      | Vinayaka Chavithi              | Vermilion, marigold dots              | Happy Vinayaka Chavithi   |
| `dasara`      | Bathukamma and Dasara          | Gunugu magenta, tangedu-yellow dots   | Happy Dasara              |
| `diwali`      | Deepavali                      | Deep indigo with diya-gold text       | Happy Deepavali           |
| `christmas`   | Christmas                      | Evergreen, holly-red dots             | Merry Christmas           |

Each festival defines these tokens, separately for light and dark:

| Token                              | Role                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `festive`, `festive-end`           | The two gradient stops                                                     |
| `on-festive`                       | Text on the gradient (passes on **both** stops)                            |
| `festive-soft` / `on-festive-soft` | Badge and tinted-panel pair                                                |
| `festive-accent`                   | **Decorative only** (rangoli dots, borders). Never put text in this colour |

### How it works

- Clinic staff create a **campaign** (`campaignSchema` in `@quantam/shared`) with a festival key, title, offer ("20% off", "₹999"), and start and end dates. Festival dates move every year, mostly with the lunar calendar, so the clinic sets the window. The app never guesses it.
- `activeCampaign(campaigns, today)` picks the running campaign, and the root layout calls `useFestiveTheme(key)`, which writes one small `<style>` tag that overrides the festive tokens for light and dark. When no campaign is running, it falls back to `clinic` (the defaults in `styles.css`).
- For now `useFestival` in [`src/lib/festival.ts`](../apps/web/src/lib/festival.ts) holds the key, and `/design` sets it for previews. Once campaigns are stored in Supabase, set it from the active campaign.

### Adding a festival

1. Add the key to `FESTIVAL_KEYS` in `packages/shared/src/constants.ts`.
2. Add its palette to `festiveThemes`, with a light and a dark version and a one-line `inspiration` describing the festival's real colours.
3. Run `pnpm check:contrast`. Every pair must pass.
4. Check it on `/design` in both themes.

Keep festive treatments respectful: use colours and simple dot motifs, with no religious symbols drawn as decoration. Greetings come from the campaign, so the clinic can write them in Telugu or Hindi. Add a Noto Sans Telugu or Devanagari font before shipping non-Latin greetings.

## Typography

| Family              | Use                                                                          |
| ------------------- | ---------------------------------------------------------------------------- |
| **Sora**            | Display, titles, headings. A geometric face that echoes the QUANTUM wordmark |
| **Instrument Sans** | All body and interface text: compact and legible in dense lists              |
| **IBM Plex Mono**   | **Data only**: times, phone numbers, patient IDs, amounts                    |

Fonts are self-hosted from Fontsource (variable Sora and Instrument Sans, Plex Mono 400/500), so no request goes to Google. Each file has a `unicode-range`, so browsers download only the Latin files a page uses.

Type sizes are Tailwind tokens. Pair them with the family and weight:

| Token                    | Size / line height | Classes                                                  | Use for                      |
| ------------------------ | ------------------ | -------------------------------------------------------- | ---------------------------- |
| `display` → `display-lg` | 32/40 → 56/60      | `font-display text-display font-bold md:text-display-lg` | Hero headline, offer numbers |
| `title`                  | 24 / 32            | `font-display text-title font-semibold`                  | Page and section titles      |
| `heading`                | 18 / 24            | `font-display text-heading font-semibold`                | Card titles                  |
| `body`                   | 16 / 24            | `text-body` (default)                                    | Default text, button labels  |
| `small`                  | 14 / 20            | `text-small`                                             | Secondary lines              |
| `label`                  | 13 / 16            | `text-label font-medium`                                 | Form labels, badges          |
| `caption`                | 12 / 16            | `text-caption`                                           | Timestamps, footnotes        |
| data                     | 14 / 20            | `font-mono text-small`                                   | Times, phones, IDs, money    |

Mobile first: write the phone style unprefixed, then step up with `md:` (768px) and `lg:` (1024px). Only `display` changes size between breakpoints; everything else stays readable at one size.

## Shape and spacing

Soft and friendly, with one rule:

| Element                                     | Radius | Class               |
| ------------------------------------------- | ------ | ------------------- |
| Buttons, badges, chips, avatars             | pill   | `rounded-full`      |
| Fields: inputs, selects, segmented controls | 12px   | `rounded-control`   |
| Containers: cards, sheets, banners, dialogs | 20px   | `rounded-container` |

- Spacing uses Tailwind's 4px scale: `gap-2` to `gap-4` within groups, and `py-14 md:py-20` between page sections. Page content sits in `mx-auto max-w-6xl px-4 md:px-6`.
- The minimum touch target is **44px** (`min-h-11`, or `size-11` for icon buttons on phones).
- Hierarchy comes from borders, spacing and one gradient band, not drop shadows. Cards are `bg-surface` with `border-line`. Don't nest cards.

## Components (`apps/web/src/components/ui`)

| Component       | Notes                                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Button`        | `primary`, `secondary`, `ghost`, `danger`, `festive` (offer CTAs only). Pill, flat fill, `loading`                          |
| `buttonClass()` | Button styles for links: `<Link className={buttonClass('secondary')}>`                                                      |
| `Badge`         | `neutral`, `brand`, `success`, `warning`, `danger`, `highlight`, `festive`                                                  |
| `Card`          | Surface plus border                                                                                                         |
| `OfferBanner`   | Festival offer: greeting, big offer number, title, validity, action slot                                                    |
| `FestiveDots`   | Decorative rangoli dot row, hidden from screen readers                                                                      |
| `ThemeSwitcher` | Device / light / dark, remembered per browser                                                                               |
| `PageLoader`    | Brand kit Fill loader for whole pages                                                                                       |
| `DotsLoader`    | Brand kit Dots loader for buttons and inline waits                                                                          |
| `Reveal`        | Scroll-in fade (`components/reveal.tsx`)                                                                                    |
| `HeroVisual`    | The brand kit's interactive 3D logo on a dark stage (`components/three`); logo poster until loaded                          |
| `ScrollStory`   | Pinned, scroll-scrubbed 3D explainer with captions (`components/landing/scroll-story.tsx`)                                  |
| `PhotoGallery`  | Masonry grid plus full-screen lightbox (arrows, swipe, Esc) (`components/gallery`)                                          |
| `BeforeAfter`   | Draggable comparison on a native range input: mouse, touch and keyboard (`components/gallery`)                              |
| `Photo`         | Responsive AVIF/WebP image; `fit="contain"` for illustrations                                                               |
| `AccordionItem` | `<details>`-based disclosure; same `group` = only one open; height animates. `card` (FAQ) or `plain`                        |
| `ChoiceChips`   | Single-choice radio pills (or equal `tiles`) under a visible legend; used for treatment and time of day in the booking form |

Icons come from Phosphor (`@phosphor-icons/react`). Use the `*Icon` names (`SunIcon`, not the deprecated `Sun`), `weight="duotone"` for feature icons and `regular` in controls, and always `aria-hidden` next to a text label.

## Layout shell (every page)

| Piece                   | File                                     | Behaviour                                                                                                                                                                                      |
| ----------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top contact bar         | `components/layout/top-bar.tsx`          | Phone number and the yellow **Instant call back** pill on every size; social icons from `md` up                                                                                                |
| Navigation              | `components/layout/site-header.tsx`      | Sticky. Inline links from `lg` up; **Treatments** and **Learn** open a dropdown (`nav-menu.tsx`) on hover, click or keyboard; Esc closes. Below `lg` a drawer where those menus are accordions |
| Floating actions        | `components/layout/floating-actions.tsx` | Right side, bottom up: **Book** (brand blue, opens the appointment form), **Call** (yellow). Labels on hover from `md`                                                                         |
| Chat bubble             | `components/chat/chat-bubble.tsx`        | Draggable anywhere (mouse, touch, arrow keys); tap opens the assistant; position remembered. Rule-based answers from site content until a real assistant exists                                |
| Book / Call back / Chat | `components/actions/*`                   | One set of dialogs for the whole site, opened with `useQuickActions().show('book' \| 'callback' \| 'chat')`. Loaded lazily                                                                     |
| Footer                  | `components/layout/site-footer.tsx`      | Logo, links, phone, socials. Extra bottom padding on phones so the floating actions never cover it                                                                                             |

Contact details, social links and the menu live in **one file**, [`apps/web/src/config/site.ts`](../apps/web/src/config/site.ts). The phone number is a placeholder until `clinic.phone` is filled in: until then it shows as text, and the Call button offers a call back instead of dialling. Each social icon becomes a link as soon as its `href` is set.

Every detail page has a `BackButton`: it returns to the previous page at the exact scroll position (one saved position per history entry) with the page transition played in reverse, or to a parent page when opened directly.

Page transitions use the View Transitions API (`styles.css`): the old page sinks back and softens, the new one rises in; the header, floating actions and chat bubble hold still. Matching `view-transition-name`s (`lib/transition-names.ts`) morph a hero chip into the treatment title, a treatment card photo into the treatment hero, and a doctor card photo into the doctor hero.

Reusable building blocks: `Dialog` (bottom sheet on phones, centred from `md`, or a side `drawer`), `IconButton`, `Container`, `Field`, `Logo` / `LogoMark`, `PageHero`, `MediaHero` (split hero with a photo and an overlapping inset), `Section`, `FeatureGrid` (photo or icon cards), `StepList` (numbered steps), `TreatmentGrid` (photo cards; all treatments, or pass `items`), `FaqSection` (sticky heading plus exclusive accordion), `LaserSpotlight` (dark showcase of the clinic's NovoLase Gold laser on the studio page and Dr B Mohana Bindu's page; product images from the manufacturer, credited in place), `ClosingCta` (takes `title` / `body`), `DoctorList` and `PlannedContent` (the "coming soon" outline for pages not built yet). Page copy for treatments and doctors lives in `src/content/clinic.ts`; the longer treatment-page content (benefits, options, FAQs) in `src/content/treatment-details.ts`. Card grids (`TreatmentGrid`, `FeatureGrid`) give every card in a row the same height and centre a short last row.

## Loaders

The original brand kit (logo, icons, all six GIFs, `Brand Kit.dc.html`) is kept in [`docs/brand/kit`](brand/kit). The web app ships optimised copies from `apps/web/src/assets`.

| Where              | Loader                                           | How                                                                                                      |
| ------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Whole page waiting | **Fill** (`fill.gif` re-encoded as a 16 kB WebP) | `<PageLoader label="Loading patients" />`. Also the router's first-load fallback                         |
| Buttons            | **Dots** (brand kit "F · Dots", pure CSS)        | `<Button loading={isSaving}>Save</Button>`. Dots use the label colour, width stays fixed, clicks ignored |
| Small inline areas | **Dots**                                         | `<DotsLoader />` (brand blue to aqua)                                                                    |

- The Fill art has a solid white background, so it always sits on a `bg-logo-tile` tile.
- `PageLoader` stays invisible for its first 200ms, so fast loads never flash a loader.
- With reduced motion on, the page loader shows the still logo and the dots hold still.
- For lists, prefer skeleton rows on `bg-sunken` over a loader.

## Motion and 3D

Three layers, cheapest first. Reach for the next one only when the previous can't do it.

1. **CSS (no JavaScript):** page transitions (View Transitions API, `<Link viewTransition>`), the hero word reveal (`.word-reveal`), floating chips (`.float-y`), the treatment ticker (`.marquee-track`), and scroll-linked effects on scroll timelines: reveals (`.reveal`), the hero sinking away (`.hero-exit`), photo parallax (`.parallax-img`) and the journey line (`.line-fill`). Without scroll-timeline support (currently Firefox) these simply show static, fully visible content.
2. **GSAP + ScrollTrigger** (`lib/gsap.ts`, loaded lazily): only for scroll scenes CSS can't express: the scroll stories (progress drives the 3D model and captions) and the stacked treatment cards (a covered card eases back and dims). Use `useScrollScene`, which scopes and reverts everything on unmount and skips reduced motion.
3. **three.js** (plain, named imports, one shared lazy chunk):
   - **Hero logo** (`logo-scene.tsx`): ported from the brand kit's `qdd-logo-3d` web component (original in `docs/brand/kit/dashboard3d`). The logo is stacked 44 layers deep, with rings, halo and dust. It tilts toward the pointer, drag spins it with inertia, and a tap pulses it. Its stage colours follow the festival theme. The loop pauses off-screen.
   - **Implant story** and **orthodontics story** (`implant-scene.tsx`, `ortho-scene.tsx`): built from lathe and tube geometry, with no model files. They have no animation loop: they draw only when scroll progress changes, at most once per frame.

- **Smooth scrolling:** Lenis for mouse and trackpad, driven by GSAP's ticker so Lenis, ScrollTrigger and the scenes update in the same frame (separate loops are what cause judder). Touch devices keep native scrolling, reduced motion disables it, and it never scrolls the page behind an open dialog. Measured on an integrated Intel GPU: 60 fps through both scroll stories.
- **Keep scrolling cheap:** no `blur()` on large decorative layers (use a `radial-gradient` glow instead), animate only `transform` and `opacity`, and cap WebGL pixel ratio at 1.5 for scroll scenes.
- **Micro-interactions:** buttons press to 97%, cards lift 4px, icons tilt, photos zoom 5% on hover. Use `duration-150` for presses, `duration-300` for hovers, `duration-500`–`700` for photo zooms, and `--ease-out` for entrances.
- **Static fallbacks:** reduced motion, no WebGL2, data saver or under 4 GB memory give the implant story as a photo plus three numbered steps, and the hero as the logo. Same content, no 3D.
- **Reduced motion** (`prefers-reduced-motion`) turns every animation into an instant change and stills the loaders.

### Photos

Photos come from [`src/content/photos.ts`](../apps/web/src/content/photos.ts) through `<Photo>`: AVIF with a WebP fallback, two widths each, lazy unless `priority`, with fixed aspect ratios so nothing shifts. They're Unsplash photos (free for commercial use, no credit required; photographers listed in `photoCredits`) until the clinic's own photos replace them: keep the names, convert them the same way, done. Text over a photo always sits on a `bg-scrim` overlay and uses `text-on-scrim`.

Illustrations come from **one family** (Round Icons on Unsplash: tooth with crown, braces, toothbrush, calendar, tooth with plus). Mixing illustration styles is the fastest way to look templated, so add new ones only from the same set.

Honesty rules for images:

- **Never put a stock portrait next to a doctor's name.** Doctor pages show their speciality illustration until the clinic provides real portraits (`portrait` in `content/clinic.ts`).
- **Before/after only with real cases and patient consent.** Until then the slider is labelled "Demo only".

## Performance budget

| Rule                         | How it's met                                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First load stays small       | Main JS is about 114 kB gzipped (React, React Router, TanStack Query). Each page is its own lazy chunk                                                                          |
| 3D never delays first paint  | The logo paints first. three.js (about 137 kB gzipped) loads only after the browser is idle, with the hero on screen, WebGL2 available, data saver off and at least 4 GB memory |
| 3D costs nothing when unseen | The render loop stops when the hero scrolls away and pauses in background tabs. Pixel ratio is capped at 1.75                                                                   |
| Images are light             | Logo 17 kB AVIF / 21 kB WebP (was a 279 kB PNG). Fill loader 16 kB WebP (was a 310 kB GIF)                                                                                      |
| No layout shift              | Images have width and height; the 3D canvas replaces the poster inside a fixed square                                                                                           |
| Long-cached assets           | Hashed file names; `vercel.json` serves `/assets/*` as immutable for a year                                                                                                     |
| Big chunks fail loudly       | `chunkSizeWarningLimit` in `vite.config.ts` sits just above the 3D chunk, so anything bigger warns                                                                              |
| Dependencies are stable      | pnpm installs only versions published at least 14 days ago (`minimumReleaseAge` in `pnpm-workspace.yaml`)                                                                       |

## Copy and content

- Write plain, specific labels such as "Book appointment" or "Send reminder". Use the same label for an action everywhere.
- Don't use em dashes in UI text.
- Offers state the number and the validity plainly, for example "20% off" and "Till 15 Nov". Don't hide terms.
- Use realistic local sample data (names, `+91` numbers), labelled as sample data.

## Checklist for new screens

- [ ] Only semantic tokens, with no hex values or palette classes
- [ ] Every text colour matches its background (`text-on-x` on `bg-x`)
- [ ] At most one gradient band, and it's linear
- [ ] Festive tokens only on offer and greeting UI
- [ ] Type uses the size tokens; times, phones and IDs use `font-mono`
- [ ] Built at 390px first, then checked at 768px and 1280px with no horizontal scroll
- [ ] Radii follow the pill / 12 / 20 rule
- [ ] Checked in **light and dark**, and with at least one dark and one light festival (use `/design`)
- [ ] Touch targets ≥ 44px; nothing relies on colour alone
- [ ] Loading, empty and error states designed
- [ ] New heavy code (charts, editors, 3D) is lazy-loaded, and `pnpm build` shows no warnings
