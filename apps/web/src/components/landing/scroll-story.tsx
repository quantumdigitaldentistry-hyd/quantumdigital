import {
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';

import type { ScrollSceneHandle, ScrollSceneProps } from '@/components/three/types';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import type { Photo as PhotoData } from '@/content/photos';
import { cx } from '@/lib/cx';
import { canRender3D } from '@/lib/device';
import { prefersReducedMotion, useScrollScene } from '@/lib/gsap';

export type StoryStep = { title: string; body: string };

type ScrollStoryProps = {
  id: string;
  eyebrow: string;
  title: string;
  steps: StoryStep[];
  /** Lazy 3D scene that follows scroll progress. */
  Scene: LazyExoticComponent<ComponentType<ScrollSceneProps>>;
  /** Shown instead of the 3D scene for reduced motion, no WebGL or low-end devices. */
  fallback: PhotoData;
};

/** Soft colour pool behind a scene. A radial gradient, not blur(): cheap to scroll. */
const glow = {
  backgroundImage: 'radial-gradient(closest-side, var(--color-hero-to), transparent)',
};

function Heading({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">{eyebrow}</p>
      <h2 id={id} className="font-display text-title font-bold text-balance md:text-display">
        {title}
      </h2>
    </div>
  );
}

/**
 * A scroll-driven 3D explainer: the section is several screens tall and its content
 * sticks to the viewport, so scrolling scrubs the scene through its steps. Devices that
 * shouldn't run 3D get the same steps beside a photo.
 */
export function ScrollStory(props: ScrollStoryProps) {
  const [mode] = useState(() => (canRender3D() && !prefersReducedMotion() ? '3d' : 'static'));
  return mode === '3d' ? <PinnedStory {...props} /> : <StaticStory {...props} />;
}

function StaticStory({ id, eyebrow, title, steps, fallback }: ScrollStoryProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} id={id} className="scroll-mt-20">
      <Container className="grid gap-8 py-14 md:grid-cols-2 md:items-center md:py-20">
        <div className="flex flex-col gap-6">
          <Heading id={headingId} eyebrow={eyebrow} title={title} />
          <ol className="flex flex-col gap-5">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft font-mono text-small font-medium text-on-brand-soft">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-heading font-semibold">{step.title}</h3>
                  <p className="text-ink-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <Photo
          photo={fallback}
          sizes="(min-width: 768px) 45vw, 100vw"
          className="block aspect-4/5 overflow-hidden rounded-container md:aspect-4/3"
        />
      </Container>
    </section>
  );
}

function PinnedStory({ id, eyebrow, title, steps, Scene }: ScrollStoryProps) {
  const headingId = useId();
  const section = useRef<HTMLElement>(null);
  const scene = useRef<ScrollSceneHandle>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  // Set the scene up at the first idle moment after the page loads, not as the section
  // approaches: creating the WebGL context, lighting and shaders takes one long frame,
  // and mid-scroll that frame shows as a jolt. While the visitor reads the top of the
  // page it goes unnoticed. If they reach the section sooner, it starts then.
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    let idle = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      observer.disconnect();
      setNear(true);
    };
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && start(), {
      rootMargin: '50% 0px',
    });
    observer.observe(element);
    const whenIdle = () => {
      if ('requestIdleCallback' in window) idle = requestIdleCallback(start, { timeout: 4000 });
      else timer = setTimeout(start, 1500);
    };
    if (document.readyState === 'complete') whenIdle();
    else window.addEventListener('load', whenIdle, { once: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('load', whenIdle);
      if (idle) cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, []);

  useScrollScene(
    section,
    ({ gsap }, element) => {
      const state = { progress: 0 };
      gsap.to(state, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top top',
          end: 'bottom bottom',
          // Lenis already smooths wheel scrolling; extra scrub smoothing there only adds lag.
          scrub: window.matchMedia('(pointer: fine)').matches ? true : 0.3,
        },
        onUpdate: () => {
          scene.current?.setProgress(state.progress);
          if (bar.current) bar.current.style.transform = `scaleX(${state.progress})`;
          // Only touch React when the step changes, never on every frame.
          const next = Math.min(steps.length - 1, Math.floor(state.progress * steps.length));
          if (next !== stepRef.current) {
            stepRef.current = next;
            setStep(next);
          }
        },
      });
    },
    [ready, steps.length],
  );

  return (
    <section
      ref={section}
      id={id}
      aria-labelledby={headingId}
      className="relative h-[280svh] bg-canvas md:h-[320vh]"
    >
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
        {/* Same column as the rest of the page: text left, model right from md up. */}
        <Container className="flex h-full flex-col md:grid md:grid-cols-2 md:items-center md:gap-10">
          <div className="relative z-10 flex flex-col gap-4 pt-6 md:gap-8 md:pt-0">
            <Heading id={headingId} eyebrow={eyebrow} title={title} />
            {/* Step captions cross-fade in the same spot. */}
            <div className="relative min-h-34 md:min-h-48">
              {steps.map((item, index) => (
                <div
                  key={item.title}
                  aria-hidden={index !== step}
                  className={cx(
                    'absolute inset-0 flex flex-col gap-2 transition-[opacity,translate] duration-500 ease-out',
                    index === step ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
                  )}
                >
                  <p className="font-mono text-small text-ink-subtle">
                    Step {index + 1} of {steps.length}
                  </p>
                  <h3 className="font-display text-heading font-semibold md:text-title">
                    {item.title}
                  </h3>
                  <p className="max-w-[44ch] text-ink-muted">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-sunken">
              <div
                ref={bar}
                className="h-full origin-left rounded-full bg-brand"
                // Driven by scroll via transform (Tailwind scale-* uses the separate scale property).
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
            {/* The full text, always available to screen readers. */}
            <ol className="sr-only">
              {steps.map((item) => (
                <li key={item.title}>
                  {item.title}: {item.body}
                </li>
              ))}
            </ol>
          </div>
          <div className="relative -mx-4 min-h-0 flex-1 md:mx-0 md:h-full">
            <div aria-hidden className="absolute inset-[8%] opacity-70" style={glow} />
            {near ? (
              <Suspense fallback={null}>
                <div
                  className={cx(
                    'absolute inset-0 transition-opacity duration-700',
                    ready ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  <Scene ref={scene} onReady={() => setReady(true)} />
                </div>
              </Suspense>
            ) : null}
          </div>
        </Container>
      </div>
    </section>
  );
}
