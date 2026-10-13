/**
 * Photos and illustrations used on the site, as responsive AVIF + WebP sets
 * (src/assets/photos, src/assets/illustrations). Photos of the clinic itself (rooms,
 * reception, X-ray unit) are the clinic's own, from src/assets/clinicImages, cropped to the
 * size given here. The rest are from Unsplash under the Unsplash License (free for
 * commercial use, no permission or credit required); photographers are listed in
 * photoCredits for the record. Replace with the clinic's own photos when ready: keep the
 * names, re-run the conversion, done.
 */

const files = import.meta.glob('../assets/{photos,illustrations}/*.{avif,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const url = (folder: string, name: string, width: number, format: 'avif' | 'webp') => {
  const found = files[`../assets/${folder}/${name}-${width}.${format}`];
  if (!found) throw new Error(`Missing image ${folder}/${name}-${width}.${format}`);
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

/** `size` is the largest variant's pixel size: [width, height]. */
function image(
  folder: 'photos' | 'illustrations',
  name: string,
  widths: [number, number],
  size: [number, number],
  alt: string,
): Photo {
  const set = (format: 'avif' | 'webp') =>
    widths.map((w) => `${url(folder, name, w, format)} ${w}w`).join(', ');
  return {
    avif: set('avif'),
    webp: set('webp'),
    fallback: url(folder, name, widths[1], 'webp'),
    width: size[0],
    height: size[1],
    alt,
  };
}

const photo = (name: string, widths: [number, number], size: [number, number], alt: string) =>
  image('photos', name, widths, size, alt);

export const photos = {
  aligners: photo(
    'aligners',
    [480, 800],
    [800, 1000],
    'Hands holding clear aligners and their case',
  ),
  implantModel: photo(
    'implant-model',
    [480, 800],
    [800, 1000],
    'Dental model showing an implant between natural teeth',
  ),
  procedure: photo(
    'procedure',
    [480, 800],
    [800, 1000],
    'Dentist wearing loupes treating a patient',
  ),
  smile: photo('smile', [480, 800], [800, 1000], 'Close-up of a woman smiling'),
  consult: photo(
    'consult',
    [640, 1200],
    [1200, 900],
    'Dentist talking with a patient in the chair',
  ),
  xray: photo('xray', [640, 1200], [1200, 900], 'Dentist reading dental scans on a light box'),
  clinic: photo(
    'clinic',
    [960, 1600],
    [1600, 900],
    'Treatment room at the clinic with a blue dental chair by the window',
  ),
  alignerFit: photo(
    'aligner-fit',
    [640, 1200],
    [1200, 900],
    'Person fitting a clear aligner over their teeth',
  ),
  bracesModels: photo(
    'braces-models',
    [640, 1200],
    [1200, 900],
    'Dental models with and without braces',
  ),
  smileJoy: photo('smile-joy', [480, 960], [960, 1200], 'Young woman laughing with a bright smile'),
  smileClose: photo(
    'smile-close',
    [640, 1200],
    [1200, 900],
    'Close-up of a smile with white, even teeth',
  ),
  // Placeholders until the clinic provides real portraits (always shown with a visible label).
  // Stand-ins until the doctors' own portraits arrive: unDraw's "Doctors" (free for
  // commercial use, no attribution required), split into two portraits, brand blue accent.
  doctorPradeep: photo(
    'doctor-pradeep-illustration',
    [480, 960],
    [960, 1467],
    'Illustration of a male doctor in a white coat with a stethoscope and clipboard',
  ),
  doctorBindu: photo(
    'doctor-bindu-illustration',
    [480, 960],
    [960, 1672],
    'Illustration of a female doctor in a white coat with a stethoscope',
  ),
  scan: photo(
    'scan',
    [480, 960],
    [960, 640],
    'Gloved hand pointing at a digital dental scan on a tablet',
  ),
  // The clinic's own rooms (src/assets/clinicImages).
  waitingArea: photo(
    'waiting-area',
    [640, 1200],
    [1200, 900],
    'Waiting area with leather sofas and wood-panelled consultation rooms',
  ),
  receptionLounge: photo(
    'reception-lounge',
    [640, 1200],
    [1200, 900],
    'Reception desk and lounge with leather sofas by a window',
  ),
  treatmentRoom: photo(
    'treatment-room',
    [640, 1200],
    [1200, 900],
    'Treatment room with a blue dental chair by the window',
  ),
  treatmentRoom2: photo(
    'treatment-room-2',
    [640, 1200],
    [1200, 900],
    'Treatment room with a purple dental chair and a magenta wall',
  ),
  xrayUnit: photo('xray-unit', [480, 960], [960, 1280], 'The clinic’s Rayscan digital X-ray unit'),
  // Treatments.
  dentures: photo('dentures', [480, 800], [800, 1000], 'Model of a full upper denture'),
  crownModel: photo(
    'crown-model',
    [480, 800],
    [800, 1000],
    'Dentist holding a dental model with crowns',
  ),
  // Dental tourism.
  videoConsult: photo(
    'video-consult',
    [640, 1200],
    [1200, 900],
    'Doctor on a video consultation with a patient',
  ),
  planeWindow: photo(
    'plane-window',
    [640, 1200],
    [1200, 900],
    'View from a plane window at sunset',
  ),
  airport: photo(
    'airport',
    [640, 1200],
    [1200, 900],
    'Travellers walking through a sunlit airport',
  ),
  charminarCity: photo(
    'charminar-city',
    [960, 1600],
    [1600, 900],
    'The Charminar in Hyderabad above a busy street',
  ),
  charminar: photo(
    'charminar',
    [480, 800],
    [800, 1000],
    'The Charminar in Hyderabad under a blue sky',
  ),
  veneers: photo('veneers', [480, 800], [800, 1000], 'Veneers on a dental model being checked'),
  fillings: photo(
    'fillings',
    [480, 800],
    [800, 1000],
    'Dentist checking teeth with a mirror and probe',
  ),
  xrayTall: photo(
    'xray-tall',
    [480, 800],
    [800, 1000],
    'Dentist reading dental X-rays on a light box',
  ),
  fullMouth: photo('full-mouth', [480, 800], [800, 1000], 'Smiling older woman at home'),
  teethWhitening: photo(
    'teeth-whitening',
    [480, 800],
    [800, 1000],
    'Close-up of a bright, white smile',
  ),
  golconda: photo(
    'golconda',
    [960, 1920],
    [1920, 960],
    'Golconda Fort in Hyderabad under a golden evening sky',
  ),
  bracesClose: photo(
    'braces-close',
    [480, 960],
    [960, 720],
    'Close-up of a dental model with braces',
  ),
  smileDesign: photo(
    'smile-design',
    [480, 800],
    [800, 1000],
    'Close-up of an even, natural-looking smile',
  ),
  /**
   * Invisalign's own campaign photo (the clinic is an official Invisalign partner in
   * India). Cropped from a screenshot, so it is small: TODO(clinic) replace with the
   * original from the Invisalign partner portal, keeping the name.
   */
  invisalignOffer: photo(
    'invisalign-offer',
    [400, 524],
    [524, 332],
    'Smiling woman holding her Invisalign aligners in their case',
  ),
  kidsSmile: photo(
    'kids-smile',
    [480, 800],
    [800, 1000],
    'A little girl laughing with a happy smile',
  ),
  /** Cut out on a transparent background, for the call-back panel's banner. */
  callbackDoctor: photo(
    'callback-doctor',
    [360, 720],
    [720, 1091],
    'Smiling doctor in a white coat with a stethoscope',
  ),
} satisfies Record<string, Photo>;

/**
 * The clinic's laser, NovoLase Gold. Product images from the manufacturer (novolase.in),
 * credited where they appear. TODO(clinic): confirm use with your NovoLase representative,
 * or replace with photos of the clinic's own unit.
 */
export const laserPhotos = {
  unit: photo(
    'novolase-gold',
    [560, 1040],
    [1040, 1300],
    'NovoLase Gold dental laser on its stand, with touchscreen and foot pedal',
  ),
  screen: photo('novolase-screen', [400, 720], [720, 630], "The laser's 7-inch touchscreen"),
  pedal: photo('novolase-pedal', [400, 720], [720, 630], "The laser's foot pedal"),
} satisfies Record<string, Photo>;

/** Photos for the studio page's "Take a look around" gallery. */
export const studioPhotos: Photo[] = [
  photos.receptionLounge,
  photos.waitingArea,
  photos.treatmentRoom,
  photos.treatmentRoom2,
  photos.xrayUnit,
  photos.scan,
];

/** Gallery photos; the tile grid crops them to fit. The clinic's own rooms come first. */
export const galleryPhotos: Photo[] = [
  photos.treatmentRoom,
  photos.receptionLounge,
  photos.xrayUnit,
  photos.treatmentRoom2,
  photos.waitingArea,
  photos.smileJoy,
  photos.scan,
  photos.bracesClose,
];

const illustration = (name: string, alt: string) =>
  image('illustrations', name, [320, 640], [640, 640], alt);

/** One illustration family (Round Icons), so the style stays consistent. */
export const illustrations = {
  crown: illustration('crown', 'Illustration of a tooth with a crown'),
  braces: illustration('braces', 'Illustration of a smile with braces'),
  toothbrush: illustration('toothbrush', 'Illustration of a toothbrush with toothpaste'),
  calendar: illustration('calendar', 'Illustration of a tooth with a calendar'),
  toothPlus: illustration('tooth-plus', 'Illustration of a tooth with a plus sign'),
  smileBlue: illustration('smile-blue', 'Illustration of a smile'),
  beam: illustration('beam', 'Illustration of a focused beam of light'),
  smileOrange: illustration('smile-orange', 'Illustration of a bright smile'),
  smileTeal: illustration('smile-teal', 'Illustration of a smile'),
  smileGreen: illustration('smile-green', 'Illustration of a full smile'),
  smilePurple: illustration('smile-purple', 'Illustration of a smile'),
  tooth: illustration('tooth', 'Illustration of a healthy tooth'),
} satisfies Record<string, Photo>;

/** Unsplash photographers whose photos are used (not shown on the site). */
export const photoCredits = [
  'Candid',
  'Jonathan Borba',
  'Lesly Juarez',
  'Benyamin Bohlouli',
  'Harold Hisona',
  'Katarzyna Zygnerska',
  'Ozkan Guner',
  'Kari Bjorn Photography',
  'Atikah Akhtar',
  'Quang Tri Nguyen',
  'Connor Wilkins',
  'Diana Polekhina',
  'Kamal Hoseinianzade',
  'Adhitya Sibikumar',
  'Vitaly Gariev',
  'Eva Darron',
  'Briana Tozour',
  'Kanishq Kancharla',
  'Caroline LM',
  'Swipe',
  'Tony Litvyak',
  'Prasanth Dasari (Golconda Fort)',
  'Vigneshwar Rajkumar',
  'Fotos (call-back doctor)',
  'Round Icons (illustrations)',
  'unDraw (doctor illustrations)',
  // Festival deities and symbols (lib/festival-packs.ts)
  'Agnieszka Ziomek',
  'Onkarphoto',
  'krivi',
  'hidefumi ohmichi',
  'Naveed Ahmed',
  'Paras Kaushal',
  'manju',
  'Rachel N Raju',
  'Mohnish Landge',
  'Vishal',
  'Vivek Sharma',
  'Aaron Burden',
];
