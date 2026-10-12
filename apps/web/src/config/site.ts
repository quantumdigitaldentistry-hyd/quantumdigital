import {
  AirplaneTiltIcon,
  BookOpenTextIcon,
  BuildingsIcon,
  GraduationCapIcon,
  FacebookLogoIcon,
  GoogleLogoIcon,
  HouseIcon,
  InstagramLogoIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ToothIcon,
  UsersThreeIcon,
  WhatsappLogoIcon,
  YoutubeLogoIcon,
  type Icon,
} from '@phosphor-icons/react';

/**
 * Clinic contact details and site navigation: the one place to edit them.
 * Components read from here, so nothing about the clinic is hard-coded in the UI.
 */

export const clinic = {
  name: 'Quantum Digital Dentistry',
  shortName: 'Quantum',
  phone: {
    // From the clinic's Google Maps listing.
    display: '+91 72070 11988',
    /** E.164 for tel: links. Call links stay off while null. */
    tel: '+917207011988' as string | null,
  },
  /** From the Google Maps listing. */
  address: {
    lines: [
      '3rd Floor, Flat No. 33/A, Sri Sai Govardhan Kunj',
      "7-1-397/101, 301/A, opposite Domino's Pizza, near Community Hall",
      'Hyderabad, Telangana 500038',
    ],
    /** Clinic pin. */
    lat: 17.4419959,
    lng: 78.4461524,
    mapsUrl: 'https://maps.app.goo.gl/xNYtHzrFkFvKGgay6',
  },
  whatsapp: 'https://wa.me/917207011988',
  email: 'quantumdigitaldentistry@gmail.com',
  /** The clinic's Google listing: reviews, rating and "Write a review". */
  googleReviewsUrl: 'https://share.google/zlvAc9coPvWEHS1Rn',
};

/** Weekly opening hours, Sunday = 0. null = not confirmed yet (shown as "call to confirm"). */
export type DayHours = { open: string; close: string } | 'closed' | null;

/**
 * Regular weekly hours from the clinic's Google Maps listing (24-hour "HH:MM"), Sunday first.
 * Sunday isn't listed apart from a festival day (Bathukamma, 3–8 pm), so it shows "call to
 * confirm". Staff can change these in the dashboard (Festival & hours).
 */
const weekday = { open: '09:30', close: '21:00' };
export const defaultHours: DayHours[] = [
  null,
  weekday,
  weekday,
  weekday,
  weekday,
  weekday,
  weekday,
];

/** `tel:` link for the clinic, or null while the number isn't configured. */
export const clinicTelHref = clinic.phone.tel ? `tel:${clinic.phone.tel}` : null;

export type SocialLink = { id: string; label: string; Icon: Icon; href: string | null };

/** Shown as icons now; each becomes a link as soon as its `href` is filled in. */
export const socialLinks: SocialLink[] = [
  { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsappLogoIcon, href: 'https://wa.me/917207011988' },
  {
    id: 'instagram',
    label: 'Instagram',
    Icon: InstagramLogoIcon,
    href: 'https://www.instagram.com/quantumdigitaldentistry/',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    Icon: FacebookLogoIcon,
    href: 'https://www.facebook.com/people/Quantum-Digital-Dentistry/61591626561368/',
  },
  { id: 'youtube', label: 'YouTube', Icon: YoutubeLogoIcon, href: null },
  {
    id: 'google',
    label: 'Google reviews',
    Icon: GoogleLogoIcon,
    href: 'https://share.google/zlvAc9coPvWEHS1Rn',
  },
];

export type NavLinkItem = { to: string; label: string; description: string; Icon: Icon };

export type NavItem = {
  to: string;
  label: string;
  Icon: Icon;
  /**
   * Dropdown on hover/focus (desktop) and an expandable group in the phone menu.
   * 'treatments' lists every treatment from content/clinic.ts.
   */
  menu?: 'treatments' | NavLinkItem[];
};

/** Guides and extras, grouped under Learn. */
export const learnLinks: NavLinkItem[] = [
  {
    to: '/patient-safety',
    label: 'Patient safety',
    description: 'How every visit is kept safe',
    Icon: ShieldCheckIcon,
  },
  {
    to: '/dental-knowledge',
    label: 'Dental knowledge',
    description: 'Clear answers about your teeth',
    Icon: BookOpenTextIcon,
  },
];

/** Main navigation, in menu order. Home is the dashboard. */
export const navItems: NavItem[] = [
  { to: '/', label: 'Home', Icon: HouseIcon },
  { to: '/treatments', label: 'Treatments', Icon: ToothIcon, menu: 'treatments' },
  { to: '/about-us', label: 'About us', Icon: UsersThreeIcon },
  { to: '/studio', label: 'Studio', Icon: BuildingsIcon },
  { to: '/dental-tourism', label: 'Dental tourism', Icon: AirplaneTiltIcon },
  { to: '/dental-knowledge', label: 'Learn', Icon: GraduationCapIcon, menu: learnLinks },
  { to: '/contact-us', label: 'Contact us', Icon: MapPinIcon },
];
