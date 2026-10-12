import {
  CalendarPlusIcon,
  CubeFocusIcon,
  LightningIcon,
  SmileyIcon,
  ToothIcon,
} from '@phosphor-icons/react';

import { PhotoGallery } from '@/components/gallery/photo-gallery';
import { ClosingCta } from '@/components/landing/closing-cta';
import { FeatureGrid, type Feature } from '@/components/sections/feature-grid';
import { LaserSpotlight } from '@/components/sections/laser-spotlight';
import { MediaHero } from '@/components/sections/media-hero';
import { Section } from '@/components/sections/section';
import { buttonClass } from '@/components/ui/button-class';
import { BookLink } from '@/components/contact/book-link';
import { photos, studioPhotos } from '@/content/photos';

// Photos are Unsplash placeholders until the clinic shares photos of its own rooms.
const spaces: Feature[] = [
  {
    title: 'Reception and lounge',
    body: 'A calm place to check in, fill in your details and talk through your visit before you sit in the chair.',
    photo: photos.receptionLounge,
  },
  {
    title: 'Waiting area',
    body: 'Comfortable seating and a quiet room, so a family member can wait with you.',
    photo: photos.waitingArea,
  },
  {
    title: 'Treatment rooms',
    body: 'Clean, well-lit rooms where your specialist explains each step before starting.',
    photo: photos.treatmentRoom,
  },
];

// From the clinic's signage, plus the NovoLase Gold laser. TODO(clinic): add other
// equipment (scanner, imaging) once confirmed.
const capabilities: Feature[] = [
  {
    title: 'Invisalign provider',
    body: 'Clear aligner treatment planned by our orthodontist, with your tooth movement mapped out before you start.',
    Icon: SmileyIcon,
  },
  {
    title: 'Implant center',
    body: 'Implants planned and restored by our prosthodontist, from the first assessment to the final crown.',
    Icon: ToothIcon,
  },
  {
    title: 'Laser dentistry',
    body: 'Gum and soft-tissue care with our NovoLase Gold dual-wavelength laser, often with less bleeding and quicker healing.',
    Icon: LightningIcon,
  },
  {
    title: 'Digital smile planning',
    body: 'Your smile design is planned and previewed with you before any tooth is changed.',
    Icon: CubeFocusIcon,
  },
];

export default function StudioPage() {
  return (
    <>
      <MediaHero
        eyebrow="The studio"
        title="A clinic built around your comfort."
        description="Step inside Quantum Digital Dentistry: where you check in, wait and are treated, and the specialist care available under one roof."
        photo={photos.receptionLounge}
        inset={photos.treatmentRoom}
      >
        <BookLink className={buttonClass('primary')}>
          <CalendarPlusIcon size={20} aria-hidden />
          Book a visit
        </BookLink>
      </MediaHero>

      <Section
        eyebrow="Our spaces"
        title="Where your visit happens."
        intro="From the moment you arrive to the end of your appointment."
      >
        <FeatureGrid features={spaces} />
      </Section>

      <Section
        eyebrow="Care under one roof"
        title="What we offer at the studio."
        intro="Specialist treatments available at the clinic, led by our orthodontist and prosthodontist."
        tinted
      >
        <FeatureGrid features={capabilities} columns={4} />
      </Section>

      <LaserSpotlight link />

      <Section
        eyebrow="Take a look around"
        title="Inside the studio."
        intro="Tap a photo to see it larger. Placeholder photos until the clinic's own are added."
      >
        <PhotoGallery items={studioPhotos} />
      </Section>

      <ClosingCta
        title="Come and see the studio."
        body="Book a visit or a consultation. Prefer to talk first? Call the clinic or ask for a call back."
      />
    </>
  );
}
