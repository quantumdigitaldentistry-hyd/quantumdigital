import type { FestivalKey } from '@quantam/shared';

/**
 * Festival packages: the clinic's artwork for each festival (logo, banner, loader
 * animation, browser icon, social post) plus the colour palette it uses. Staff pick one
 * in the dashboard; the choice is saved in site_settings and the whole site follows it.
 *
 * Artwork lives in src/assets/festive/<id>/ (optimised from the originals in
 * src/assets/festivals/, which stay out of git). Only URLs are bundled here; the files
 * themselves load only for the active festival.
 */

const files = import.meta.glob('../assets/festive/*/*.{webp,avif,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const asset = (id: string, name: string) => {
  const found = files[`../assets/festive/${id}/${name}`];
  if (!found) throw new Error(`Missing festival asset ${id}/${name}`);
  return found;
};

export type FestivalPack = {
  id: string;
  label: string;
  /** Colour palette (lib/festive-themes.ts). */
  palette: FestivalKey;
  /** Usual month(s), to sort the list for staff. */
  months: string;
  logo: { small: string; large: string };
  banner: { webp: string; webpLarge: string; avif: string; avifLarge: string };
  loader: string;
  icon: { small: string; large: string };
  social: string;
};

const pack = (id: string, label: string, palette: FestivalKey, months: string): FestivalPack => ({
  id,
  label,
  palette,
  months,
  logo: { small: asset(id, 'logo-256.webp'), large: asset(id, 'logo-512.webp') },
  banner: {
    webp: asset(id, 'banner-960.webp'),
    webpLarge: asset(id, 'banner-1920.webp'),
    avif: asset(id, 'banner-960.avif'),
    avifLarge: asset(id, 'banner-1920.avif'),
  },
  loader: asset(id, 'anim-240.webp'),
  icon: { small: asset(id, 'icon-64.png'), large: asset(id, 'icon-192.png') },
  social: asset(id, 'social-1080.webp'),
});

/** In calendar order. */
export const festivalPacks: FestivalPack[] = [
  pack('sankranti', 'Sankranti', 'sankranti', 'January'),
  pack('republic', 'Republic Day', 'national', 'January'),
  pack('holi', 'Holi', 'holi', 'March'),
  pack('eid', 'Eid', 'eid', 'Varies'),
  pack('independence', 'Independence Day', 'national', 'August'),
  pack('raksha', 'Raksha Bandhan', 'raksha', 'August'),
  pack('janmashtami', 'Janmashtami', 'janmashtami', 'August–September'),
  pack('onam', 'Onam', 'onam', 'August–September'),
  pack('ganesh', 'Ganesh Chaturthi', 'ganesh', 'September'),
  pack('navratri', 'Navratri and Dasara', 'dasara', 'October'),
  pack('diwali', 'Diwali', 'diwali', 'October–November'),
  pack('christmas', 'Christmas', 'christmas', 'December'),
];

export const findFestivalPack = (id: string | null | undefined) =>
  festivalPacks.find((item) => item.id === id) ?? null;
