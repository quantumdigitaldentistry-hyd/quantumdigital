import {
  LightningIcon,
  SmileyIcon,
  SparkleIcon,
  ToothIcon,
  type Icon,
} from '@phosphor-icons/react';

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

export type Doctor = { name: string; initials: string; degree: string; focus: string };

export const doctors: Doctor[] = [
  {
    name: 'Dr Mohana Bindu',
    initials: 'MB',
    degree: 'MDS, Prosthodontics (OSM)',
    focus: 'Crowns, bridges, implants and dentures',
  },
  {
    name: 'Dr D Reddy Pradeep',
    initials: 'RP',
    degree: 'MDS, Orthodontics (OSM)',
    focus: 'Braces and clear aligners',
  },
];
