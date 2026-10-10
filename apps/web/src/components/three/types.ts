import type { Ref } from 'react';

/** A 3D scene driven by scroll progress (0 → 1). */
export type ScrollSceneHandle = { setProgress: (progress: number) => void };

export type ScrollSceneProps = {
  ref?: Ref<ScrollSceneHandle>;
  onReady?: () => void;
};
