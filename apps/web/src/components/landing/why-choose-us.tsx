import {
  BooksIcon,
  CpuIcon,
  HandHeartIcon,
  ScalesIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';

import { RevealWords } from '@/components/reveal-words';
import { FeatureGrid, type Feature } from '@/components/sections/feature-grid';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { photos } from '@/content/photos';

// From the clinic's "Why Choose Us" banner.
const reasons: Feature[] = [
  {
    title: 'Advanced technology',
    body: 'We use the latest technologies like intraoral scanners, digital X-rays and lasers. Digital impressions with intraoral scanners reduce the number of visits needed and make procedures more comfortable, providing faster and more efficient care.',
    Icon: CpuIcon,
  },
  {
    title: 'Experienced team',
    body: 'We have a highly qualified and experienced team of doctors who are updated with the latest techniques and are committed to providing quality dental care.',
    Icon: UsersThreeIcon,
  },
  {
    title: 'Evidence based',
    body: 'An evidence-based approach means that we base all our decisions on the most current, high-quality scientific research to provide you with the best possible care.',
    Icon: BooksIcon,
  },
  {
    title: 'Personalised care',
    body: 'We focus on your individual needs, preferences and values, providing personalised dental care.',
    Icon: HandHeartIcon,
  },
  {
    title: 'Strict sterilisation',
    body: 'We follow strict sterilisation protocols to prevent cross-infections, ensuring the safety and well-being of our patients.',
    Icon: ShieldCheckIcon,
  },
  {
    title: 'Quality at a fair cost',
    body: 'We provide all these services at affordable prices and at your convenient appointments, making us your friendly neighbourhood dentist.',
    Icon: ScalesIcon,
  },
];

/** Why patients choose the clinic: six reasons, beside photos of the clinic's own rooms. */
export function WhyChooseUs() {
  return (
    <section aria-labelledby="why-title" className="border-y border-line bg-surface">
      <Container className="grid gap-10 py-14 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-2">
            <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
              02 · Why choose us
            </p>
            <h2
              id="why-title"
              className="heading-3d font-display text-title font-bold text-balance md:text-display"
            >
              <RevealWords text={'Why choose us.'} />
            </h2>
          </div>
          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            <div className="photo-reveal aspect-4/3 overflow-hidden rounded-container">
              <Photo
                photo={photos.treatmentRoom}
                sizes="(min-width: 1024px) 22vw, 58vw"
                className="block size-full"
                imgClassName="parallax-img"
              />
            </div>
            <div className="photo-reveal mt-10 aspect-3/4 overflow-hidden rounded-container">
              <Photo
                photo={photos.xrayUnit}
                sizes="(min-width: 1024px) 15vw, 40vw"
                className="block size-full"
                imgClassName="parallax-img"
              />
            </div>
          </div>
        </div>
        <FeatureGrid features={reasons} columns={2} />
      </Container>
    </section>
  );
}
