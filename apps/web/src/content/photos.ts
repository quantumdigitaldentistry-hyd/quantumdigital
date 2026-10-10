/**
 * Photos used on the site, as responsive AVIF + WebP sets (src/assets/photos).
 * All from Unsplash under the Unsplash License (free for commercial use, no permission
 * needed); credits are shown in the footer anyway. Replace with the clinic's own photos
 * when they are ready: keep the names, re-run the conversion, done.
 */

const files = import.meta.glob('../assets/photos/*.{avif,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const url = (name: string, width: number, format: 'avif' | 'webp') => {
  const found = files[`../assets/photos/${name}-${width}.${format}`];
  if (!found) throw new Error(`Missing photo ${name}-${width}.${format}`);
  return found;
};

export type Photo = {
  avif: string;
  webp: string;
  fallback: string;
  width: number;
  height: number;
  alt: string;
};

function photo(name: string, widths: [number, number], aspect: number, alt: string): Photo {
  const set = (format: 'avif' | 'webp') =>
    widths.map((w) => `${url(name, w, format)} ${w}w`).join(', ');
  const [, large] = widths;
  return {
    avif: set('avif'),
    webp: set('webp'),
    fallback: url(name, large, 'webp'),
    width: large,
    height: Math.round(large / aspect),
    alt,
  };
}

export const photos = {
  aligners: photo('aligners', [480, 800], 4 / 5, 'Hands holding clear aligners and their case'),
  implantModel: photo(
    'implant-model',
    [480, 800],
    4 / 5,
    'Dental model showing an implant between natural teeth',
  ),
  procedure: photo('procedure', [480, 800], 4 / 5, 'Dentist wearing loupes treating a patient'),
  smile: photo('smile', [480, 800], 4 / 5, 'Close-up of a woman smiling'),
  consult: photo('consult', [640, 1200], 4 / 3, 'Dentist talking with a patient in the chair'),
  xray: photo('xray', [640, 1200], 4 / 3, 'Dentist reading dental scans on a light box'),
  clinic: photo('clinic', [960, 1600], 16 / 9, 'Bright dental treatment room'),
} satisfies Record<string, Photo>;

export const photoCredits = [
  { name: 'Candid', handle: 'candid' },
  { name: 'Jonathan Borba', handle: 'jonathanborba' },
  { name: 'Lesly Juarez', handle: 'jblesly' },
  { name: 'Benyamin Bohlouli', handle: 'benyamin_bohlouli' },
  { name: 'Harold Hisona', handle: 'harold_angus' },
];
