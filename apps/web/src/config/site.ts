import {
  BookOpenTextIcon,
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
    // TODO(clinic): replace with the real number. The signage shows it starts 72070.
    display: '+91 72070 XXXXX',
    /** E.164 for tel: links, e.g. '+917207012345'. Call links stay off while null. */
    tel: null as string | null,
  },
};

/** `tel:` link for the clinic, or null while the number isn't configured. */
export const clinicTelHref = clinic.phone.tel ? `tel:${clinic.phone.tel}` : null;

export type SocialLink = { id: string; label: string; Icon: Icon; href: string | null };

/** Shown as icons now; each becomes a link as soon as its `href` is filled in. */
export const socialLinks: SocialLink[] = [
  { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsappLogoIcon, href: null },
  { id: 'instagram', label: 'Instagram', Icon: InstagramLogoIcon, href: null },
  { id: 'facebook', label: 'Facebook', Icon: FacebookLogoIcon, href: null },
  { id: 'youtube', label: 'YouTube', Icon: YoutubeLogoIcon, href: null },
  { id: 'google', label: 'Google reviews', Icon: GoogleLogoIcon, href: null },
];

export type NavItem = { to: string; label: string; Icon: Icon };

/** Main navigation, in menu order. Home is the dashboard. */
export const navItems: NavItem[] = [
  { to: '/', label: 'Home', Icon: HouseIcon },
  { to: '/treatments', label: 'Treatments', Icon: ToothIcon },
  { to: '/patient-safety', label: 'Patient safety', Icon: ShieldCheckIcon },
  { to: '/dental-knowledge', label: 'Dental knowledge', Icon: BookOpenTextIcon },
  { to: '/contact-us', label: 'Contact us', Icon: MapPinIcon },
];
