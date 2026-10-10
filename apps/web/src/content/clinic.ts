import {
  LightningIcon,
  SmileyIcon,
  SparkleIcon,
  ToothIcon,
  type Icon,
} from '@phosphor-icons/react';

import { illustrations, type Photo } from './photos';

/** Treatments and doctors as listed on the clinic signage. Edit here; pages read from it. */

export type Treatment = { slug: string; Icon: Icon; name: string; summary: string };

export const treatments: Treatment[] = [
  {
    slug: 'invisalign',
    Icon: SmileyIcon,
    name: 'Invisalign provider',
    summary: 'Clear, removable aligners that straighten teeth without brackets or wires.',
  },
  {
    slug: 'implants',
    Icon: ToothIcon,
    name: 'Implant center',
    summary: 'Fixed replacements for missing teeth, anchored in the jaw like a natural root.',
  },
  {
    slug: 'laser-dentistry',
    Icon: LightningIcon,
    name: 'Laser dentistry',
    summary: 'Laser treatment for gums and soft tissue, usually with less bleeding.',
  },
  {
    slug: 'smile-design',
    Icon: SparkleIcon,
    name: 'Smile design',
    summary: 'A planned set of treatments for the shape, shade and line of your smile.',
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
  /** TODO(clinic): add the doctor's real portrait. Until then pages show the speciality illustration. */
  portrait?: Photo;
};

// Names, degrees and specialities are from the clinic signage.
export const doctors: Doctor[] = [
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
  },
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
  },
];

/** The speciality illustration shown for a doctor until their portrait is added. */
export const specialtyIllustration = (doctor: Doctor) =>
  doctor.specialty === 'Orthodontics' ? illustrations.braces : illustrations.crown;
