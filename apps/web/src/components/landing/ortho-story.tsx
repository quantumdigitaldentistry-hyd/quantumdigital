import { lazy } from 'react';

import { photos } from '@/content/photos';

import { ScrollStory, type StoryStep } from './scroll-story';

const OrthoScene = lazy(() => import('@/components/three/ortho-scene'));

const steps: StoryStep[] = [
  {
    title: 'Mapping your bite',
    body: 'Scans and X-rays show how each tooth sits and how your upper and lower teeth meet.',
  },
  {
    title: 'Gentle, steady pressure',
    body: 'Braces or clear aligners apply light, constant pressure that moves teeth a little at a time.',
  },
  {
    title: 'Aligned and stable',
    body: 'Once the teeth are in place, a retainer holds them there while the bone settles around them.',
  },
];

/** "Straightening, step by step": scroll fits brackets and wire, then aligns the arch. */
export function OrthoStory({ eyebrow = 'Orthodontics in 3D' }: { eyebrow?: string }) {
  return (
    <ScrollStory
      id="ortho-story"
      eyebrow={eyebrow}
      title="Straightening, step by step."
      steps={steps}
      Scene={OrthoScene}
      fallback={photos.bracesModels}
    />
  );
}
