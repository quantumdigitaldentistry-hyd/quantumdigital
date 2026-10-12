import type { VideoRef } from '@/lib/video-links';

/**
 * Patient reviews and video testimonials for the home page.
 *
 * Reviews are real Google reviews of the clinic (Google Maps listing, read October 2026),
 * quoted as excerpts. Reviewers are shown by first name and surname initial, and personal
 * details (such as a child's name) are left out. TODO(clinic): refresh from Google from
 * time to time, and update the rating and count to match the listing.
 */

/** The listing's overall score, as Google shows it. */
export const googleRating = { score: 5.0, count: 73 };

export type Review = {
  name: string;
  /** 1–5 stars, as given on Google. */
  stars: number;
  /** The treatment the review is about, if it says. */
  about?: string;
  text: string;
};

export const reviews: Review[] = [
  {
    name: 'Ravi K.',
    stars: 5,
    about: 'Root canal and crowns',
    text: 'Dr. Bindu explained every step clearly and made me feel comfortable throughout. The root canal was completely painless and the crown fits perfectly and looks very natural. Hygiene, staff behaviour and follow-up care were all excellent.',
  },
  {
    name: 'Akash L.',
    stars: 5,
    about: 'Teeth gap treatment',
    text: 'I recently completed my teeth gap treatment after 1 year and 3 months, and I couldn’t be more satisfied with the results. The entire process was well explained from the beginning, and all appointments were managed smoothly. Dr. Pradeep was always supportive and professional.',
  },
  {
    name: 'Chennupati C.',
    stars: 5,
    text: 'Bindu Mam is such a kind, caring and understanding dentist. From the very first visit she made me feel comfortable and listened patiently to all my concerns. What I appreciated most was her gentle approach and the personal attention she gave throughout the treatment.',
  },
  {
    name: 'Saritha K.',
    stars: 5,
    about: 'Orthodontics',
    text: 'We recently completed my daughter’s orthodontic journey here, and the results are absolutely satisfying. From day one the care felt truly personalised. Seeing her smile with such confidence now is priceless. Our special thanks to Dr. Pradeep.',
  },
  {
    name: 'Hema B.',
    stars: 5,
    about: 'Orthodontics',
    text: 'My daughter underwent orthodontic treatment with Dr Pradeep for over 2 years for a very extreme case of irregularities and misalignment. Today my teenage daughter has a perfect smile which increased her confidence. The equipment to diagnose, treat and manage is world class.',
  },
];

export type VideoTestimonial = VideoRef & {
  /** Short title shown under the video, e.g. "Aligner journey". */
  title: string;
  /** How the patient is named, with their consent, e.g. "Priya, Hyderabad". */
  name: string;
};

/**
 * Patient video stories (YouTube or Google Drive links, shared with consent).
 * TODO(clinic): add videos here, e.g. { provider: 'youtube', id: 'VIDEO_ID', title, name }.
 * Until there are any, the section invites patients to share their story instead.
 */
export const videoTestimonials: VideoTestimonial[] = [];
