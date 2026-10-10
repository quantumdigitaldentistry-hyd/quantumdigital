import { lazy } from 'react';

import { photos } from '@/content/photos';

import { ScrollStory, type StoryStep } from './scroll-story';

const ImplantScene = lazy(() => import('@/components/three/implant-scene'));

const steps: StoryStep[] = [
  {
    title: 'A titanium post',
    body: 'A small titanium post is placed in the jawbone. Over the next few months the bone grows around it, so it holds like a natural root.',
  },
  {
    title: 'The abutment',
    body: 'A connector is fitted to the post. It holds the new tooth firmly and evenly in place.',
  },
  {
    title: 'The crown',
    body: 'A crown made to match the shape and shade of your own teeth completes the implant.',
  },
];

/** "An implant, assembled": scroll screws the post in, seats the abutment, lands the crown. */
export function ImplantStory({ eyebrow = '01 · Implants' }: { eyebrow?: string }) {
  return (
    <ScrollStory
      id="implant-story"
      eyebrow={eyebrow}
      title="An implant, assembled."
      steps={steps}
      Scene={ImplantScene}
      fallback={photos.implantModel}
    />
  );
}
