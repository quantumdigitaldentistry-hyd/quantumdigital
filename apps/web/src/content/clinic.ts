import {
  LightningIcon,
  SmileyIcon,
  SparkleIcon,
  ToothIcon,
  type Icon,
} from '@phosphor-icons/react';

import { illustrations, photos, type Photo } from './photos';

/** Treatments and doctors (names and specialities from the clinic signage). Pages read from here. */

export type Treatment = {
  slug: string;
  Icon: Icon;
  name: string;
  /** Shorter label for chips and tight spaces (defaults to name). */
  shortName?: string;
  summary: string;
  /** One line under the name in the treatments menu. */
  menuLine: string;
  /** The four specialities on the clinic signage: shown on the home page and hero. */
  featured: boolean;
  /** Which speciality leads it (links the treatment to that doctor). */
  ledBy?: 'Orthodontics' | 'Prosthodontics';
  /** Short benefit chips. General information, to be reviewed by the clinic. */
  highlights: string[];
  illustration: Photo;
  photo: Photo;
  /** Plain-language explanation for the treatment page. */
  intro: string;
  steps: { title: string; body: string }[];
};

// TODO(clinic): review the treatment copy with the doctors.
export const treatments: Treatment[] = [
  {
    slug: 'invisalign',
    Icon: SmileyIcon,
    name: 'Invisalign provider',
    shortName: 'Invisalign',
    menuLine: 'Clear, removable aligners',
    featured: true,
    ledBy: 'Orthodontics',
    summary: 'Clear, removable aligners that straighten teeth without brackets or wires.',
    highlights: ['Nearly invisible', 'Removable to eat', 'Digitally planned'],
    illustration: illustrations.smileBlue,
    photo: photos.aligners,
    intro:
      'Invisalign uses a series of clear, custom-made aligners. Each set moves your teeth a little, and you switch to the next set every week or two until your teeth reach the planned position.',
    steps: [
      { title: 'Digital scan', body: 'A 3D scan of your teeth replaces messy impressions.' },
      { title: 'Your plan', body: 'You see the planned movement of every tooth before you start.' },
      { title: 'Aligners', body: 'Wear each set about 22 hours a day, removing it to eat.' },
      { title: 'Retainer', body: 'A retainer keeps the new position once treatment ends.' },
    ],
  },
  {
    slug: 'implants',
    Icon: ToothIcon,
    name: 'Implant center',
    shortName: 'Implants',
    menuLine: 'Single, multiple and full-arch implants',
    featured: true,
    ledBy: 'Prosthodontics',
    summary: 'Fixed replacements for missing teeth, anchored in the jaw like a natural root.',
    highlights: [
      'Fixed, not removable',
      'Looks like a natural tooth',
      'Helps preserve the jawbone',
    ],
    illustration: illustrations.toothPlus,
    photo: photos.implantModel,
    intro:
      'A dental implant replaces the root of a missing tooth with a small titanium post. Once the bone has bonded to it, a crown is fixed on top, so the new tooth looks, feels and works like your own.',
    steps: [
      {
        title: 'Assessment',
        body: 'X-rays and scans check the bone and plan the implant position.',
      },
      { title: 'Placement', body: 'The post is placed in the jawbone under local anaesthesia.' },
      { title: 'Healing', body: 'Over a few months, the bone grows around the post.' },
      { title: 'Crown', body: 'A crown matched to your teeth is fixed on top.' },
    ],
  },
  {
    slug: 'braces',
    Icon: SmileyIcon,
    name: 'Braces',
    menuLine: 'Metal and ceramic braces',
    featured: false,
    ledBy: 'Orthodontics',
    summary: 'Fixed braces that move teeth steadily into line, for children and adults.',
    highlights: ['Metal or tooth-coloured', 'Suits complex cases', 'Regular adjustments'],
    illustration: illustrations.braces,
    photo: photos.bracesModels,
    intro:
      'Braces use small brackets bonded to the teeth and a wire that is adjusted over time. They can correct crowding, gaps and bite problems, including cases that aligners cannot treat as well.',
    steps: [
      { title: 'Records', body: 'Photos, scans and X-rays show how your teeth and bite line up.' },
      { title: 'Fitting', body: 'Brackets are bonded to the teeth and the first wire is placed.' },
      { title: 'Adjustments', body: 'Short visits every few weeks move the teeth step by step.' },
      { title: 'Retainer', body: 'A retainer keeps the new position once braces come off.' },
    ],
  },
  {
    slug: 'crowns-bridges',
    Icon: ToothIcon,
    name: 'Crowns and bridges',
    menuLine: 'Rebuild or replace damaged teeth',
    featured: false,
    ledBy: 'Prosthodontics',
    summary: 'Crowns protect weak or broken teeth; bridges replace a missing tooth.',
    highlights: ['Matched to your shade', 'Fixed in place', 'Restores chewing'],
    illustration: illustrations.crown,
    photo: photos.crownModel,
    intro:
      'A crown covers and protects a tooth that is cracked, heavily filled or root-canal treated. A bridge replaces a missing tooth by attaching a new tooth to the neighbouring ones.',
    steps: [
      {
        title: 'Preparation',
        body: 'The tooth is shaped and a precise scan or impression is taken.',
      },
      { title: 'Temporary', body: 'A temporary crown protects the tooth while yours is made.' },
      {
        title: 'Fitting',
        body: 'The final crown or bridge is checked for fit and bite, then fixed.',
      },
    ],
  },
  {
    slug: 'dentures',
    Icon: SparkleIcon,
    name: 'Dentures',
    menuLine: 'Complete and partial dentures',
    featured: false,
    ledBy: 'Prosthodontics',
    summary: 'Removable replacements for several or all teeth, made to fit comfortably.',
    highlights: ['Complete or partial', 'Natural-looking', 'Implant-supported options'],
    illustration: illustrations.smileOrange,
    photo: photos.dentures,
    intro:
      'Dentures replace missing teeth with a removable plate. Complete dentures replace a full arch; partial dentures fill gaps between natural teeth. Implants can be added to hold a denture more firmly.',
    steps: [
      { title: 'Impressions', body: 'Detailed impressions record your gums and bite.' },
      {
        title: 'Try-in',
        body: 'You check the look and fit of the teeth before they are finished.',
      },
      { title: 'Fitting', body: 'The finished denture is fitted and adjusted for comfort.' },
    ],
  },
  {
    slug: 'laser-dentistry',
    Icon: LightningIcon,
    name: 'Laser dentistry',
    menuLine: 'Gentle laser care for gums',
    featured: true,
    summary: 'Laser treatment for gums and soft tissue, usually with less bleeding.',
    highlights: ['Gentle on gums', 'Less bleeding', 'Often quicker healing'],
    illustration: illustrations.beam,
    photo: photos.procedure,
    intro:
      'Dental lasers use a focused beam of light to treat gums and other soft tissue precisely. For many procedures this means less bleeding, fewer stitches and a more comfortable recovery.',
    steps: [
      { title: 'Examination', body: 'The dentist checks whether laser treatment suits your case.' },
      { title: 'Treatment', body: 'The laser reshapes or treats the tissue with high precision.' },
      { title: 'Recovery', body: 'Many people return to normal routines the same or next day.' },
    ],
  },
  {
    slug: 'smile-design',
    Icon: SparkleIcon,
    name: 'Smile design',
    menuLine: 'Whitening, veneers, smile makeovers',
    featured: true,
    ledBy: 'Prosthodontics',
    summary: 'A planned set of treatments for the shape, shade and line of your smile.',
    highlights: ['Shape and shade', 'Planned before treatment', 'Combines treatments'],
    illustration: illustrations.smileOrange,
    photo: photos.smile,
    intro:
      'Smile design looks at your whole smile, not one tooth at a time. Photos and digital planning show the proposed shape and shade first, then whitening, veneers, crowns or aligners are combined to get there.',
    steps: [
      { title: 'Photos and scans', body: 'Your face, lips and teeth are recorded together.' },
      { title: 'Digital preview', body: 'You see the proposed smile before anything changes.' },
      { title: 'Treatment', body: 'Whitening, veneers, crowns or aligners, in the planned order.' },
    ],
  },
];

export type Doctor = {
  slug: string;
  name: string;
  initials: string;
  degree: string;
  specialty: 'Prosthodontics' | 'Orthodontics';
  focus: string;
  /** Plain-language explanation of the speciality (general information, not a bio). */
  specialtyIntro: string;
  /** Treatments this speciality covers. */
  treats: string[];
  /** TODO(clinic): replace with the doctor's real portrait and set portraitIsPlaceholder: false. */
  portrait: Photo;
  portraitIsPlaceholder: boolean;
};

// Order on the page: Dr Pradeep on the left, Dr Mohana Bindu on the right.
export const doctors: Doctor[] = [
  {
    slug: 'dr-d-reddy-pradeep',
    name: 'Dr D Reddy Pradeep',
    initials: 'RP',
    degree: 'MDS, Orthodontics (OSM)',
    specialty: 'Orthodontics',
    focus: 'Braces and clear aligners',
    specialtyIntro:
      'Orthodontics is the speciality of straightening teeth and correcting the bite. An orthodontist uses braces or clear aligners to move teeth gradually into a healthier, more even position.',
    treats: [
      'Metal and ceramic braces',
      'Invisalign and clear aligners',
      'Crowded, gapped or crooked teeth',
      'Overbite, underbite and crossbite',
      'Retainers after treatment',
    ],
    portrait: photos.doctorPlaceholderA,
    portraitIsPlaceholder: true,
  },
  {
    slug: 'dr-mohana-bindu',
    name: 'Dr Mohana Bindu',
    initials: 'MB',
    degree: 'MDS, Prosthodontics (OSM)',
    specialty: 'Prosthodontics',
    focus: 'Crowns, bridges, implants and dentures',
    specialtyIntro:
      'Prosthodontics is the speciality of restoring and replacing teeth. A prosthodontist plans crowns, bridges, dentures and implant-supported teeth so they look natural, bite comfortably and last.',
    treats: [
      'Dental implants and implant crowns',
      'Crowns and bridges',
      'Complete and partial dentures',
      'Veneers and smile makeovers',
      'Rebuilding worn or broken teeth',
    ],
    portrait: photos.doctorPlaceholderB,
    portraitIsPlaceholder: true,
  },
];

/** Treatments shown on the home page (the signage specialities). */
export const featuredTreatments = treatments.filter((treatment) => treatment.featured);

/** The doctor whose speciality leads a treatment, if any. */
export const leadDoctor = (treatment: Treatment) =>
  treatment.ledBy ? doctors.find((doctor) => doctor.specialty === treatment.ledBy) : undefined;

/** The speciality illustration for a doctor. */
export const specialtyIllustration = (doctor: Doctor) =>
  doctor.specialty === 'Orthodontics' ? illustrations.braces : illustrations.crown;

export type ResultCase = {
  id: string;
  treatment: Treatment['slug'];
  title: string;
  photo: Photo;
  /** Tailwind arbitrary filter that stands in for "before" in the demo. */
  beforeFilter: string;
};

/**
 * Before/after cases. These are DEMOS (one photo, a filter standing in for "before")
 * until the clinic adds real, consented patient cases with separate before/after photos.
 */
export const resultCases: ResultCase[] = [
  {
    id: 'whitening',
    treatment: 'smile-design',
    title: 'Whitening and shade match',
    photo: photos.smileClose,
    beforeFilter: '[filter:sepia(0.6)_saturate(0.75)_brightness(0.92)]',
  },
  {
    id: 'aligners',
    treatment: 'invisalign',
    title: 'Aligner treatment',
    photo: photos.smile,
    beforeFilter: '[filter:sepia(0.5)_saturate(0.7)_brightness(0.88)]',
  },
  {
    id: 'smile-makeover',
    treatment: 'smile-design',
    title: 'Smile makeover',
    photo: photos.smileJoy,
    beforeFilter: '[filter:sepia(0.45)_saturate(0.6)_brightness(0.9)_contrast(0.95)]',
  },
  {
    id: 'implant-crown',
    treatment: 'implants',
    title: 'Implant crown',
    photo: photos.implantModel,
    beforeFilter: '[filter:grayscale(0.7)_brightness(0.85)]',
  },
  {
    id: 'gum-contour',
    treatment: 'laser-dentistry',
    title: 'Gum contouring',
    photo: photos.smileClose,
    beforeFilter: '[filter:saturate(1.6)_hue-rotate(-12deg)_brightness(0.9)]',
  },
];
