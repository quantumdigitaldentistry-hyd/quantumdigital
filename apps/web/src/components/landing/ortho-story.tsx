import { lazy } from 'react';

import { photos } from '@/content/photos';

import { ScrollStory, type StoryStep } from './scroll-story';

const OrthoScene = lazy(() => import('@/components/three/ortho-scene'));
const AlignerScene = lazy(() =>
  import('@/components/three/ortho-scene').then((module) => ({ default: module.AlignerScene })),
);

const alignerSteps: StoryStep[] = [
  {
    title: 'Your digital plan',
    body: 'A 3D scan maps every tooth, and you see the planned movement before treatment starts.',
  },
  {
    title: 'Clear, custom aligners',
    body: 'Each set of near-invisible aligners moves your teeth a little; you switch to the next set every week or two.',
  },
  {
    title: 'Aligned and stable',
    body: 'Once the teeth are in place, a retainer holds them there while the bone settles around them.',
  },
];

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

/**
 * "Straightening, step by step": scroll fits the appliance (brackets and wire, or a clear
 * aligner), then aligns the arch.
 */
export function OrthoStory({
  eyebrow = 'Orthodontics in 3D',
  appliance = 'braces',
}: {
  eyebrow?: string;
  appliance?: 'braces' | 'aligner';
}) {
  const aligner = appliance === 'aligner';
  return (
    <ScrollStory
      id="ortho-story"
      eyebrow={eyebrow}
      title="Straightening, step by step."
      steps={aligner ? alignerSteps : steps}
      Scene={aligner ? AlignerScene : OrthoScene}
      fallback={aligner ? photos.aligners : photos.bracesModels}
    />
  );
}
