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

/** Particle style for the site-wide festival ambience (components/fx/festival-ambience.tsx). */
export type FestivalEffect =
  'embers' | 'snow' | 'gulal' | 'petals' | 'sparkle' | 'stars' | 'kites' | 'tricolour';

export type FestivalPack = {
  id: string;
  label: string;
  /** Colour palette (lib/festive-themes.ts). */
  palette: FestivalKey;
  /** Usual month(s), to sort the list for staff. */
  months: string;
  /** Short blessing shown on the banner and popup. */
  blessing: string;
  effect: FestivalEffect;
  /**
   * The festival's deity, or its symbol where a deity image isn't appropriate (Eid,
   * Christmas, national days, Onam, Sankranti, Raksha Bandhan). Unsplash photos.
   */
  icon3d: { small: string; large: string; portrait: string; alt: string; credit: string };
  logo: { small: string; large: string };
  banner: { webp: string; webpLarge: string; avif: string; avifLarge: string };
  loader: string;
  icon: { small: string; large: string };
  social: string;
};

type Extra = {
  blessing: string;
  effect: FestivalEffect;
  alt: string;
  credit: string;
};

const pack = (
  id: string,
  label: string,
  palette: FestivalKey,
  months: string,
  extra: Extra,
): FestivalPack => ({
  id,
  label,
  palette,
  months,
  blessing: extra.blessing,
  effect: extra.effect,
  icon3d: {
    small: asset(id, 'deity-160.webp'),
    large: asset(id, 'deity-512.webp'),
    portrait: asset(id, 'deity-portrait-720.webp'),
    alt: extra.alt,
    credit: extra.credit,
  },
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
  pack('sankranti', 'Sankranti', 'sankranti', 'January', {
    blessing: 'May the harvest season bring you warmth, health and bright smiles.',
    effect: 'kites',
    alt: 'Colourful kites against a blue sky',
    credit: 'Agnieszka Ziomek',
  }),
  pack('republic', 'Republic Day', 'national', 'January', {
    blessing: 'Celebrating the spirit of our Republic, with pride and gratitude.',
    effect: 'tricolour',
    alt: 'The Ashoka Chakra on the Indian flag',
    credit: 'Onkarphoto',
  }),
  pack('holi', 'Holi', 'holi', 'March', {
    blessing: 'May Radha and Krishna fill your life with colour, love and laughter.',
    effect: 'gulal',
    alt: 'Idols of Radha and Krishna',
    credit: 'krivi',
  }),
  pack('eid', 'Eid', 'eid', 'Varies', {
    blessing: 'Eid Mubarak. Wishing you peace, joy and togetherness.',
    effect: 'stars',
    alt: 'Glowing festive lanterns',
    credit: 'hidefumi ohmichi',
  }),
  pack('independence', 'Independence Day', 'national', 'August', {
    blessing: 'Happy Independence Day. Freedom to smile, every day.',
    effect: 'tricolour',
    alt: 'The Indian flag flying against the sky',
    credit: 'Naveed Ahmed',
  }),
  pack('raksha', 'Raksha Bandhan', 'raksha', 'August', {
    blessing: 'Celebrating the bond of love and protection between siblings.',
    effect: 'sparkle',
    alt: 'A rakhi with roli and rice',
    credit: 'Paras Kaushal',
  }),
  pack('janmashtami', 'Janmashtami', 'janmashtami', 'August–September', {
    blessing: 'May Lord Krishna bless you with joy, wisdom and a song in your heart.',
    effect: 'sparkle',
    alt: 'Idol of Lord Krishna playing the flute',
    credit: 'manju',
  }),
  pack('onam', 'Onam', 'onam', 'August–September', {
    blessing: 'Happy Onam. May this harvest bring abundance and happiness home.',
    effect: 'petals',
    alt: 'A colourful pookalam flower carpet',
    credit: 'Rachel N Raju',
  }),
  pack('ganesh', 'Ganesh Chaturthi', 'ganesh', 'September', {
    blessing: 'May Lord Ganesha remove every obstacle and bless you with good health.',
    effect: 'petals',
    alt: 'Idol of Lord Ganesha',
    credit: 'Mohnish Landge',
  }),
  pack('navratri', 'Navratri and Dasara', 'dasara', 'October', {
    blessing: 'May Maa Durga bless you with strength, courage and well-being.',
    effect: 'petals',
    alt: 'Idol of Goddess Durga',
    credit: 'Vishal',
  }),
  pack('diwali', 'Diwali', 'diwali', 'October–November', {
    blessing: 'May Goddess Lakshmi light up your home with prosperity and smiles.',
    effect: 'embers',
    alt: 'Idol of Goddess Lakshmi seated on a lotus',
    credit: 'Vivek Sharma',
  }),
  pack('christmas', 'Christmas', 'christmas', 'December', {
    blessing: 'Merry Christmas. Wishing you joy, peace and a season full of smiles.',
    effect: 'snow',
    alt: 'A golden Christmas star among festive lights',
    credit: 'Aaron Burden',
  }),
];

/** Greeting line for a festival. */
export const greetingFor = (pack: FestivalPack) =>
  pack.id === 'eid'
    ? 'Eid Mubarak'
    : pack.id === 'navratri'
      ? 'Happy Navratri & Dasara'
      : `Happy ${pack.label}`;

export const findFestivalPack = (id: string | null | undefined) =>
  festivalPacks.find((item) => item.id === id) ?? null;
