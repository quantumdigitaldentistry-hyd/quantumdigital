# Quantam Dental design system: "Clinic Sky"

One design system for **web, Android and iOS**. Tokens are defined once in [`apps/dental/src/global.css`](../apps/dental/src/global.css), festival palettes in [`packages/ui/src/festive-themes.ts`](../packages/ui/src/festive-themes.ts), and shared components in [`packages/ui`](../packages/ui/src). To see everything live, including every festival in light and dark, run the app and open **`/design`**.

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

1. **Every text colour has a home.** Text on `bg-x` uses tone `on-x`. Plain backgrounds (`canvas`, `surface`, `sunken`) use `default`, `muted` or `subtle`. Never put white text on aqua or yellow.
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

In dark mode, brand blue gets lighter and the text on it turns dark. Always pair `bg-brand` with tone `on-brand`, and never hard-code white.

### Gradients

Only **linear** gradients are used, because they render natively on iOS and Android through Uniwind. Radial and conic gradients are web-only, so don't use them.

| Gradient | Classes                                       | Text tones                 | Where                                           |
| -------- | --------------------------------------------- | -------------------------- | ----------------------------------------------- |
| Hero     | `bg-linear-to-br from-hero-from to-hero-to`   | `on-hero`, `on-hero-muted` | `<HeroBand>`: screen header, dashboard greeting |
| Festive  | `bg-linear-to-br from-festive to-festive-end` | `on-festive`               | `<OfferBanner>`, greeting cards                 |

Light hero runs `#A9E7F2 → #6DD3E6` (the signage sky). Dark hero runs `#12394A → #0B2533` (deep ocean). Rules: **at most one gradient band per screen**, no gradients on buttons, inputs or list rows, and the rest of the screen sits on plain `canvas`.

### Appointment status

Use `appointmentStatusBadge` from [`apps/dental/src/theme/status.ts`](../apps/dental/src/theme/status.ts).

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
- `activeCampaign(campaigns, today)` picks the running campaign, and the root layout calls `useFestiveTheme(key)`, which repaints the tokens at runtime on web, iOS and Android (`Uniwind.updateCSSVariables`). When no campaign is running, it falls back to `clinic`.
- For now `useFestival` in [`src/theme/festival.ts`](../apps/dental/src/theme/festival.ts) holds the key, and `/design` sets it for previews. Once campaigns are stored in Supabase, set it from the active campaign.

### Adding a festival

1. Add the key to `FESTIVAL_KEYS` in `packages/shared/src/constants.ts`.
2. Add its palette to `festiveThemes`, with a light and a dark version and a one-line `inspiration` describing the festival's real colours.
3. Run `pnpm check:contrast`. Every pair must pass.
4. Check it on `/design` in both themes.

Keep festive treatments respectful: use colours and simple dot motifs, with no religious symbols drawn as decoration. Greetings come from the campaign, so the clinic can write them in Telugu or Hindi. Add a Noto Sans Telugu or Devanagari font before shipping non-Latin greetings.

## Typography

| Family              | Use                                                                              |
| ------------------- | -------------------------------------------------------------------------------- |
| **Sora**            | `display`, `title`, `heading`. A geometric face that echoes the QUANTUM wordmark |
| **Instrument Sans** | All body and interface text: compact and legible in dense lists                  |
| **IBM Plex Mono**   | **Data only**: times, phone numbers, patient IDs, amounts                        |

Use `<Text variant tone>` from `@quantam/ui`, not raw `text-*` or `font-*` classes.

| Variant                | Size / line height | Font                        | Use for                           |
| ---------------------- | ------------------ | --------------------------- | --------------------------------- |
| `display`              | 32 / 40            | Sora Bold                   | Offer numbers, dashboard greeting |
| `title`                | 24 / 32            | Sora SemiBold               | Screen titles                     |
| `heading`              | 18 / 24            | Sora SemiBold               | Section and card titles           |
| `body` / `body-strong` | 16 / 24            | Instrument Regular / Medium | Default text, button labels       |
| `small`                | 14 / 20            | Instrument Regular          | Secondary lines in lists          |
| `label`                | 13 / 16            | Instrument Medium           | Form labels, badges               |
| `caption`              | 12 / 16            | Instrument Regular          | Timestamps, footnotes             |
| `data` / `data-strong` | 14 / 20            | Plex Mono Regular / Medium  | Times, phones, IDs, money         |

Set colour with `tone`, **not** with a `text-*` class in `className`. Two colour classes on one element conflict, and the result differs between web and native.

### Why fonts are named per weight

Android can't pick a weight file out of a single family name, so each weight is registered as its own family (`Sora-Bold`, `InstrumentSans-Medium`, and so on) in [`src/theme/fonts.ts`](../apps/dental/src/theme/fonts.ts). To add a weight:

1. Import it from its own subpath (`@expo-google-fonts/sora/800ExtraBold`), never from the package root, which bundles every weight into the app.
2. Register it in `fonts.ts`.
3. Add the token in `global.css`, in both `@layer theme` and `@theme`.

## Shape and spacing

Soft and friendly, with one rule:

| Element                                     | Radius | Class               |
| ------------------------------------------- | ------ | ------------------- |
| Buttons, badges, chips, avatars             | pill   | `rounded-full`      |
| Fields: inputs, selects, segmented controls | 12px   | `rounded-control`   |
| Containers: cards, sheets, banners, dialogs | 20px   | `rounded-container` |

- Spacing uses Tailwind's 4px scale: `gap-2`, `gap-3`, `gap-4` and `p-4` within groups, and `gap-6` to `gap-8` between sections.
- The minimum touch target is **44px** (`min-h-11`).
- Hierarchy comes from borders, spacing and the single hero band, not drop shadows. Cards are `bg-surface` with `border-line`. Don't nest cards.

## Components (`@quantam/ui`)

| Component     | Notes                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------- |
| `Text`        | `variant` + `tone`                                                                       |
| `Button`      | `primary`, `secondary`, `ghost`, `danger`, `festive` (offer CTAs only). Flat fills, pill |
| `Badge`       | `neutral`, `brand`, `success`, `warning`, `danger`, `highlight`, `festive`               |
| `Card`        | Surface plus border                                                                      |
| `HeroBand`    | Aqua gradient band; text uses `on-hero` tones                                            |
| `OfferBanner` | Festival offer: greeting, big offer number, title, validity, CTA                         |
| `FestiveDots` | Decorative rangoli dot row, hidden from screen readers                                   |
| `Screen`      | Safe areas, scroll, centred max-width column on web                                      |

## Loaders

Brand assets live in [`apps/dental/assets/`](../apps/dental/assets). `Brand Kit.dc.html` there previews them all.

| Where                      | Loader                                         | How                                                                                                                          |
| -------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Whole page waiting on data | **Fill** (`assets/gifs/fill.gif`)              | `<PageLoader label="Loading patients" />` from `@/components/page-loader`                                                    |
| Buttons                    | **Dots** (brand kit "F · Dots", built in code) | `<Button title="Save" loading={isSaving} />`. The dots take the label colour, the width stays fixed, and presses are blocked |
| Small inline areas         | **Dots**                                       | `<DotsLoader />` (brand blue to aqua) from `@quantam/ui`                                                                     |

- The GIFs have a solid white background, so they always sit on a `bg-logo-tile` white tile, never directly on a coloured or dark surface.
- There's no dots GIF. Dots is animated with Reanimated using the brand kit's exact timing: an 1100ms loop with 150ms stagger and an 8px lift.
- With the phone's reduced-motion setting on, the GIF holds its first frame and the dots hold still.
- Use a loader only when a wait is likely to take longer than about 300ms. For lists, prefer skeleton rows on `bg-sunken`.

## Native (Android and iOS) specifics

| Concern                                  | Where it's handled                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| Light/dark follows the phone setting     | `userInterfaceStyle: automatic` in `app.json` plus Uniwind adaptive themes           |
| Status bar, window background, nav theme | `ThemeSync` in [`src/theme/theme-sync.tsx`](../apps/dental/src/theme/theme-sync.tsx) |
| Festival tokens                          | `useFestiveTheme` in `_layout.tsx` (updates both themes at runtime)                  |
| Splash screen                            | `app.json`: `#F4F8FA` light, `#0A121A` dark                                          |
| Android adaptive icon background         | `app.json`: `#6DD3E6` (signage aqua)                                                 |
| Fonts ready before first paint           | `_layout.tsx` keeps the splash up until fonts load                                   |

The app icon and splash image are still Expo placeholders. Replace them in `apps/dental/assets/images/` with the clinic's tooth logo.

## Copy and content

- Write plain, specific labels such as "Book appointment" or "Send reminder". Use the same label for an action everywhere.
- Don't use em dashes in UI text.
- Offers state the number and the validity plainly, for example "20% off" and "Till 15 Nov". Don't hide terms.
- Use realistic local sample data (names, `+91` numbers), labelled as sample data.

## Checklist for new screens

- [ ] Only semantic tokens, with no hex values or palette classes
- [ ] Every text tone matches its background (`on-x` on `bg-x`)
- [ ] At most one gradient band, and it's linear
- [ ] Festive tokens only on offer and greeting UI
- [ ] Text uses `<Text variant tone>`; times, phones and IDs use `data`
- [ ] Radii follow the pill / 12 / 20 rule
- [ ] Checked in **light and dark**, and with at least one dark and one light festival (use `/design`)
- [ ] Touch targets ≥ 44px; nothing relies on colour alone
- [ ] Loading, empty and error states designed
