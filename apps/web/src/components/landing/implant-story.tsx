import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import type { ImplantSceneHandle } from '@/components/three/implant-scene';
import { Container } from '@/components/ui/container';
import { Photo } from '@/components/ui/photo';
import { photos } from '@/content/photos';
import { cx } from '@/lib/cx';
import { canRender3D } from '@/lib/device';
import { prefersReducedMotion, useScrollScene } from '@/lib/gsap';

const ImplantScene = lazy(() => import('@/components/three/implant-scene'));

const steps = [
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

function Heading({ id }: { id: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
        01 · Implants
      </p>
      <h2 id={id} className="font-display text-title font-bold text-balance md:text-display">
        An implant, assembled.
      </h2>
    </div>
  );
}

/** Static version: reduced motion, no WebGL, or a low-end device. Same story, no scroll pin. */
function StaticStory() {
  return (
    <section aria-labelledby="implant-title" id="implant-story" className="scroll-mt-20">
      <Container className="grid gap-8 py-14 md:grid-cols-2 md:items-center md:py-20">
        <div className="flex flex-col gap-6">
          <Heading id="implant-title" />
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
          photo={photos.implantModel}
          sizes="(min-width: 768px) 45vw, 100vw"
          className="block aspect-[4/5] overflow-hidden rounded-container"
        />
      </Container>
    </section>
  );
}

/**
 * "An implant, assembled": the section is several screens tall and its content sticks to
 * the viewport, so scrolling scrubs the 3D implant through its three steps. The scene
 * module and three.js load when the section approaches the viewport.
 */
export function ImplantStory() {
  const [mode] = useState(() => (canRender3D() && !prefersReducedMotion() ? '3d' : 'static'));
  if (mode === 'static') return <StaticStory />;
  return <PinnedStory />;
}

function PinnedStory() {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<ImplantSceneHandle>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  // Start loading three.js a screen before the section arrives.
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        // Wait for an idle moment so three.js never competes with the first paint.
        if ('requestIdleCallback' in window)
          requestIdleCallback(() => setNear(true), { timeout: 3000 });
        else setTimeout(() => setNear(true), 1200);
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useScrollScene(
    section,
    ({ gsap }, element) => {
      const state = { progress: 0 };
      gsap.to(state, {
        progress: 1,
        ease: 'none',
        scrollTrigger: { trigger: element, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        onUpdate: () => {
          scene.current?.setProgress(state.progress);
          if (bar.current) bar.current.style.transform = `scaleX(${state.progress})`;
          setStep(Math.min(steps.length - 1, Math.floor(state.progress * steps.length)));
        },
      });
    },
    [ready],
  );

  return (
    <section
      ref={section}
      id="implant-story"
      aria-labelledby="implant-title"
      className="relative h-[280svh] bg-canvas md:h-[320vh]"
    >
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
        {/* Same column as the rest of the page: text left, model right from md up. */}
        <Container className="flex h-full flex-col md:grid md:grid-cols-2 md:items-center md:gap-10">
          <div className="relative z-10 flex flex-col gap-4 pt-6 md:gap-8 md:pt-0">
            <Heading id="implant-title" />
            {/* Step captions cross-fade in the same spot. */}
            <div className="relative min-h-[8.5rem] md:min-h-[12rem]">
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
                // Driven by scroll through transform (Tailwind scale-* uses the separate scale property).
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
            <div
              aria-hidden
              className="absolute inset-[12%] rounded-full bg-linear-to-br from-hero-from to-hero-to opacity-60 blur-2xl"
            />
            {near ? (
              <Suspense fallback={null}>
                <div
                  className={cx(
                    'absolute inset-0 transition-opacity duration-700',
                    ready ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  <ImplantScene ref={scene} onReady={() => setReady(true)} />
                </div>
              </Suspense>
            ) : null}
          </div>
        </Container>
      </div>
    </section>
  );
}
