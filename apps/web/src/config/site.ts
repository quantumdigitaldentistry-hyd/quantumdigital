import {
  AirplaneTiltIcon,
  BookOpenTextIcon,
  BuildingsIcon,
  GraduationCapIcon,
  ImagesIcon,
  FacebookLogoIcon,
  GoogleLogoIcon,
  HouseIcon,
  InstagramLogoIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ToothIcon,
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
};

/** Weekly opening hours, Sunday = 0. null = not confirmed yet (shown as "call to confirm"). */
export type DayHours = { open: string; close: string } | 'closed' | null;

/**
 * TODO(clinic): fill in the regular weekly hours (24-hour "HH:MM"). Google Maps only showed
 * a holiday Sunday (3–8 pm) when this was set up. Staff can also edit them in the dashboard.
 */
export const defaultHours: DayHours[] = [null, null, null, null, null, null, null];

/** `tel:` link for the clinic, or null while the number isn't configured. */
export const clinicTelHref = clinic.phone.tel ? `tel:${clinic.phone.tel}` : null;

export type SocialLink = { id: string; label: string; Icon: Icon; href: string | null };

/** Shown as icons now; each becomes a link as soon as its `href` is filled in. */
export const socialLinks: SocialLink[] = [
  { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsappLogoIcon, href: 'https://wa.me/917207011988' },
  { id: 'instagram', label: 'Instagram', Icon: InstagramLogoIcon, href: null },
  { id: 'facebook', label: 'Facebook', Icon: FacebookLogoIcon, href: null },
  { id: 'youtube', label: 'YouTube', Icon: YoutubeLogoIcon, href: null },
  { id: 'google', label: 'Google reviews', Icon: GoogleLogoIcon, href: null },
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
  { to: '/gallery', label: 'Gallery', description: 'Inside modern dentistry', Icon: ImagesIcon },
];

/** Main navigation, in menu order. Home is the dashboard. */
export const navItems: NavItem[] = [
  { to: '/', label: 'Home', Icon: HouseIcon },
  { to: '/treatments', label: 'Treatments', Icon: ToothIcon, menu: 'treatments' },
  { to: '/studio', label: 'Studio', Icon: BuildingsIcon },
  { to: '/dental-tourism', label: 'Dental tourism', Icon: AirplaneTiltIcon },
  { to: '/dental-knowledge', label: 'Learn', Icon: GraduationCapIcon, menu: learnLinks },
  { to: '/contact-us', label: 'Contact us', Icon: MapPinIcon },
];
