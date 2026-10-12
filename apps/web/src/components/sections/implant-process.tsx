import {
  CalendarCheckIcon,
  CaretRightIcon,
  ChatsCircleIcon,
  ClipboardTextIcon,
  CrownIcon,
  ScanIcon,
  ScrewdriverIcon,
  type Icon,
} from '@phosphor-icons/react';

import { BookLink } from '@/components/contact/book-link';
import { Reveal } from '@/components/reveal';
import { RevealWords } from '@/components/reveal-words';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { cx } from '@/lib/cx';

// General patient information. TODO(clinic): have the doctors review the wording.
const steps: { title: string; body: string; Icon: Icon }[] = [
  {
    title: 'Consultation',
    body: 'Your concerns, missing teeth, dental history and what you hope for from treatment are discussed.',
    Icon: ChatsCircleIcon,
  },
  {
    title: 'Examination and imaging',
    body: 'Your teeth, gums, bite and the supporting bone are checked. A 3D scan is taken where it is needed.',
    Icon: ScanIcon,
  },
  {
    title: 'Your implant plan',
    body: 'Your dentist explains the recommended implant option, the new teeth, the stages of treatment and the costs.',
    Icon: ClipboardTextIcon,
  },
  {
    title: 'Implant placement',
    body: 'The implant is placed under local anaesthesia, exactly where the plan sets it.',
    Icon: ScrewdriverIcon,
  },
  {
    title: 'Healing and restoration',
    body: 'Once the bone has healed around the implant, the final crown, bridge or full-arch teeth are fitted.',
    Icon: CrownIcon,
  },
  {
    title: 'Follow-up care',
    body: 'Regular reviews and good daily cleaning keep your implant healthy for years to come.',
    Icon: CalendarCheckIcon,
  },
];

/**
 * "How dental implant treatment is planned": the six stages as numbered cards, four to a
 * row on wide screens with arrows leading from one to the next, then a call to book.
 */
export function ImplantProcess() {
  return (
    <section aria-labelledby="implant-process-title" className="bg-canvas">
      <Container className="flex flex-col items-center gap-10 py-16 md:py-24">
        <Reveal className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <p className="text-label font-semibold tracking-[0.14em] text-brand uppercase">
            The process
          </p>
          <h2
            id="implant-process-title"
            className="heading-3d font-display text-title font-bold text-balance md:text-display"
          >
            <RevealWords text={'How dental implant treatment is planned.'} />
          </h2>
        </Reveal>

        <ol className="flex w-full flex-wrap justify-center gap-x-10 gap-y-6">
          {steps.map(({ title, body, Icon }, index) => (
            <li
              key={title}
              className="relative w-full sm:w-[calc((100%-2.5rem)/2)] lg:w-[calc((100%-7.5rem)/4)]"
            >
              <article className="flex h-full flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-sm transition-[translate,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-elevation/10">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-brand px-3.5 py-1.5 text-label font-bold tracking-wide text-on-brand uppercase">
                    Step {index + 1}
                  </span>
                  <span className="grid size-11 place-items-center rounded-xl border border-brand/30 bg-brand-soft text-on-brand-soft">
                    <Icon size={22} aria-hidden />
                  </span>
                </div>
                <h3 className="font-display text-heading font-semibold text-balance">{title}</h3>
                <p className="text-small text-ink-muted">{body}</p>
              </article>
              {/* Arrow to the next step, in the gap between cards; none at a row's end
                  (two to a row from sm, four from lg). */}
              {index < steps.length - 1 ? (
                <CaretRightIcon
                  size={26}
                  weight="bold"
                  aria-hidden
                  className={cx(
                    'absolute top-1/2 -right-[1.25rem] hidden translate-x-1/2 -translate-y-1/2 text-brand',
                    index % 2 === 0 ? 'sm:block' : 'sm:hidden',
                    index % 4 === 3 ? 'lg:hidden' : 'lg:block',
                  )}
                />
              ) : null}
            </li>
          ))}
        </ol>

        <BookLink treatment="implants" className={buttonClass('primary')}>
          Start with an implant consultation
        </BookLink>
      </Container>
    </section>
  );
}
