import { callbackRequestSchema, toIndianE164 } from '@quantam/shared';
import { ArrowRightIcon, SparkleIcon } from '@phosphor-icons/react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import { ChatAssistant } from '@/components/chat/chat-assistant';
import AppointmentForm from '@/components/contact/appointment-form';
import { PhoneLink } from '@/components/contact/phone-link';
import { Button } from '@/components/ui/button';
import { buttonClass } from '@/components/ui/button-class';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Photo } from '@/components/ui/photo';
import { photos } from '@/content/photos';
import { bookingPath } from '@/lib/booking';
import { CallbackNotConnectedError, requestCallback } from '@/lib/callback';
import { useQuickActions } from '@/lib/quick-actions';

type FormErrors = { name?: string; phone?: string };

/**
 * Call-back header: a brand-blue panel with the offer on the left and a smiling doctor
 * on the right, cut out so her head rises above the panel's top edge.
 */
function CallbackBanner({ titleId, descriptionId }: { titleId: string; descriptionId: string }) {
  return (
    <div className="relative pt-8 sm:pt-10">
      <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-brand to-brand-strong text-on-brand">
        {/* Soft aqua light behind the doctor: decorative. */}
        <div
          aria-hidden
          className="absolute -right-10 -bottom-16 size-64 rounded-full bg-aqua/40 blur-3xl"
        />
        <div className="relative flex min-h-48 flex-col justify-center gap-2 py-6 pr-[44%] pl-6 sm:min-h-56 sm:pl-8">
          <h2
            id={titleId}
            className="font-display text-heading leading-tight font-bold text-balance sm:text-title"
          >
            Need advice on your treatment?
          </h2>
          <p id={descriptionId} className="text-small opacity-90 sm:text-body">
            Leave your number and our dental team will call you back.
          </p>
        </div>
      </div>
      {/* Outside the clipped panel, so the head can rise above it. */}
      <Photo
        photo={photos.callbackDoctor}
        sizes="(min-width: 640px) 15rem, 40vw"
        fit="contain"
        className="pointer-events-none absolute right-2 bottom-0 block h-[calc(100%-0.25rem)] w-[42%]"
        imgClassName="object-bottom drop-shadow-[0_12px_18px_rgb(7_13_40/0.28)]"
      />
    </div>
  );
}

/** Aligner offer header: the photo, then the question as the dialog's title. */
function AlignerOfferBanner({
  titleId,
  descriptionId,
}: {
  titleId: string;
  descriptionId: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Photo
        photo={photos.invisalignOffer}
        sizes="(min-width: 768px) 28rem, 100vw"
        priority
        className="block aspect-8/5 overflow-hidden rounded-3xl md:aspect-16/9"
      />
      <div className="flex flex-col gap-2">
        <h2 id={titleId} className="font-display text-title leading-tight font-bold text-balance">
          Have questions about Invisalign?
        </h2>
        <p id={descriptionId} className="text-ink-muted">
          <strong className="font-semibold text-ink">Book a FREE consultation</strong> with an
          Invisalign provider to:
        </p>
      </div>
    </div>
  );
}

// TODO(clinic): confirm the consultation is free and what in-clinic offers are running.
const alignerPoints = [
  'Understand how Invisalign works',
  'Get clarity on treatment costs and duration',
  'Discover in-clinic perks tailored for you',
];

/** The aligner offer's points and its button, which opens booking with aligners chosen. */
function AlignerOffer({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {alignerPoints.map((point) => (
          <li key={point} className="flex items-start gap-3">
            <SparkleIcon
              size={20}
              weight="fill"
              className="mt-0.5 shrink-0 text-[#f5b400]"
              aria-hidden
            />
            {point}
          </li>
        ))}
      </ul>
      <Link
        to={bookingPath('aligners')}
        viewTransition
        onClick={onDone}
        className={buttonClass('primary', 'w-full min-h-12 text-body sm:mx-auto sm:w-fit sm:px-8')}
      >
        Book my free consultation now
        <ArrowRightIcon size={18} aria-hidden />
      </Link>
    </div>
  );
}

function CallbackForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'not-connected' | 'failed'>(
    'idle',
  );
  const [failure, setFailure] = useState('');
  const [trap, setTrap] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const e164 = toIndianE164(phone);
    const parsed = callbackRequestSchema.safeParse({ name, phone: e164 ?? '' });
    if (!parsed.success || !e164) {
      const issues = parsed.success ? [] : parsed.error.issues;
      setErrors({
        name: issues.find((issue) => issue.path[0] === 'name')?.message,
        phone: e164 ? undefined : 'Enter a 10-digit mobile number',
      });
      return;
    }
    setErrors({});
    setStatus('sending');
    try {
      await requestCallback(parsed.data, trap);
      setStatus('sent');
    } catch (error) {
      setFailure(error instanceof Error ? error.message : '');
      setStatus(error instanceof CallbackNotConnectedError ? 'not-connected' : 'failed');
    }
  };

  return (
    <form noValidate onSubmit={submit} className="relative flex flex-col gap-4">
      <Field
        label="Your name"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <Field
        label="Mobile number"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        prefix="+91"
        placeholder="10-digit mobile number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        hint="10-digit Indian mobile number."
      />
      <Button type="submit" loading={status === 'sending'} className="w-full">
        Call me back
      </Button>
      {/* Honeypot: hidden from people (and screen readers); bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this empty
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
        </label>
      </div>
      <div aria-live="polite">
        {status === 'sent' ? (
          <p className="rounded-control bg-success-soft p-3 text-small text-success">
            Thank you. The clinic will call you back shortly during opening hours.
          </p>
        ) : null}
        {status === 'not-connected' || status === 'failed' ? (
          <p className="rounded-control bg-highlight-soft p-3 text-small text-on-highlight-soft">
            {status === 'not-connected'
              ? 'Online call-back requests are being set up and your request was not sent. '
              : `${failure || 'Your request could not be sent.'} `}
            Please call us on <PhoneLink className="align-bottom" iconSize={14} />.
          </p>
        ) : null}
      </div>
    </form>
  );
}

/** Book / call back / chat panels, mounted once in the root layout. */
export function QuickActionPanels() {
  const { open, origin, close } = useQuickActions();

  return (
    <>
      <Dialog
        open={open === 'callback'}
        onClose={close}
        title="Instant call back"
        description="Leave your number and the clinic will call you."
        banner={CallbackBanner}
        className="md:w-[36rem]!"
      >
        {/* Re-mounted on every open, so the form starts empty. */}
        {open === 'callback' ? <CallbackForm /> : null}
      </Dialog>

      <Dialog
        open={open === 'book'}
        onClose={close}
        title="Book an appointment"
        description="Three quick steps. The front desk calls you to confirm a time."
        // Wide on laptops so the two-column form fits without scrolling; fully rounded.
        className="md:w-[40rem]! md:rounded-4xl! lg:w-[min(62rem,calc(100vw-3rem))]!"
      >
        {open === 'book' ? <AppointmentForm plain wide /> : null}
      </Dialog>

      <Dialog
        open={open === 'aligner-offer'}
        onClose={close}
        title="Have questions about Invisalign?"
        banner={AlignerOfferBanner}
        // Rounded on every corner; on phones it floats just above the bottom edge.
        className="rounded-4xl! max-md:mx-3! max-md:mb-3! max-md:w-[calc(100%-1.5rem)]! md:w-[32rem]!"
      >
        {open === 'aligner-offer' ? <AlignerOffer onDone={close} /> : null}
      </Dialog>

      <Dialog open={open === 'chat'} onClose={close} origin={origin} title="Chat assistant">
        {open === 'chat' ? <ChatAssistant /> : null}
      </Dialog>
    </>
  );
}
