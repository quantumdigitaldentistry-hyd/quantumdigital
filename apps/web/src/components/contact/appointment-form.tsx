import { appointmentRequestSchema, toIndianE164 } from '@quantam/shared';
import {
  ArrowRightIcon,
  CalendarPlusIcon,
  CheckCircleIcon,
  InfoIcon,
  LockSimpleIcon,
  MoonStarsIcon,
  QuestionIcon,
  SunHorizonIcon,
  SunIcon,
  UserIcon,
} from '@phosphor-icons/react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';

import { PhoneLink } from '@/components/contact/phone-link';
import { AccordionItem } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ChoiceChips, type Choice } from '@/components/ui/choice-chips';
import { Field, TextAreaField } from '@/components/ui/field';
import { Photo } from '@/components/ui/photo';
import { treatments } from '@/content/clinic';
import { BOOKING_TREATMENT_EVENT, takeBookingTreatment } from '@/lib/booking';
import { CallbackNotConnectedError, requestAppointment } from '@/lib/callback';
import { cx } from '@/lib/cx';

type Errors = Partial<Record<'name' | 'phone' | 'preferredDate' | 'message', string>>;
type TimeOfDay = 'morning' | 'afternoon' | 'evening';

const today = () => new Date().toISOString().slice(0, 10);

const treatmentChoices: Choice<string>[] = [
  ...treatments.map((treatment) => ({
    value: treatment.slug,
    label: treatment.shortName ?? treatment.name,
    visual: (
      <Photo
        photo={treatment.illustration}
        sizes="20px"
        fit="contain"
        className="block size-5 shrink-0"
      />
    ),
  })),
  { value: 'not-sure', label: 'Not sure yet', Icon: QuestionIcon },
];

const timeChoices: Choice<TimeOfDay>[] = [
  { value: 'morning', label: 'Morning', Icon: SunHorizonIcon },
  { value: 'afternoon', label: 'Afternoon', Icon: SunIcon },
  { value: 'evening', label: 'Evening', Icon: MoonStarsIcon },
];

/** A numbered group of fields: "1 · What can we help with?". */
function Group({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-t border-line pt-5 first:border-t-0 first:pt-0">
      <p className="flex items-center gap-2.5 font-display font-semibold">
        <span className="grid size-7 place-items-center rounded-full bg-brand-soft font-mono text-caption text-on-brand-soft">
          {step}
        </span>
        {title}
      </p>
      {children}
    </div>
  );
}

/**
 * "Book an appointment" form in three short groups: the treatment (tappable chips),
 * when suits you, and contact details. Validates on submit (errors appear under each
 * field). Until the backend exists the request is not sent, and the form says so
 * plainly with the clinic's number instead of faking a confirmation.
 */
export default function AppointmentForm({
  plain = false,
  initialTreatment = '',
}: {
  plain?: boolean;
  /** A treatment slug to start with already chosen. */
  initialTreatment?: string;
}) {
  const [values, setValues] = useState({
    name: '',
    phone: '',
    // A Book button on this page may have chosen a treatment before the form loaded.
    treatment: takeBookingTreatment() || initialTreatment,
    preferredDate: '',
    preferredTime: '' as TimeOfDay | '',
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'not-connected' | 'failed'>(
    'idle',
  );
  const [failure, setFailure] = useState('');
  const [trap, setTrap] = useState('');

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  // …or after it loaded: take the treatment from the button that scrolled here.
  useEffect(() => {
    const choose = (event: Event) => {
      const treatment = (event as CustomEvent<string>).detail;
      takeBookingTreatment();
      setValues((current) => ({ ...current, treatment }));
    };
    window.addEventListener(BOOKING_TREATMENT_EVENT, choose);
    return () => window.removeEventListener(BOOKING_TREATMENT_EVENT, choose);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const e164 = toIndianE164(values.phone);
    const parsed = appointmentRequestSchema.safeParse({
      ...values,
      phone: e164 ?? '',
      treatment: values.treatment === 'not-sure' ? '' : values.treatment,
      preferredTime: values.preferredTime || undefined,
    });
    if (!parsed.success || !e164) {
      const issues = parsed.success ? [] : parsed.error.issues;
      const first = (field: string) => issues.find((issue) => issue.path[0] === field)?.message;
      setErrors({
        name: first('name'),
        phone: e164 ? undefined : 'Enter a 10-digit mobile number',
        preferredDate: first('preferredDate'),
        message: first('message'),
      });
      return;
    }
    setErrors({});
    setStatus('sending');
    try {
      await requestAppointment(parsed.data, trap);
      setStatus('sent');
    } catch (error) {
      setFailure(error instanceof Error ? error.message : '');
      setStatus(error instanceof CallbackNotConnectedError ? 'not-connected' : 'failed');
    }
  };

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-labelledby={plain ? undefined : 'appointment-form-title'}
      aria-label={plain ? 'Request an appointment' : undefined}
      className={cx(
        'relative flex flex-col gap-5 text-ink',
        !plain &&
          'rounded-4xl border border-line bg-surface p-5 shadow-2xl shadow-elevation/30 md:p-7',
      )}
    >
      <div className={plain ? 'sr-only' : 'flex items-start gap-4'}>
        <span className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand sm:grid">
          <CalendarPlusIcon size={24} weight="duotone" aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h3 id="appointment-form-title" className="font-display text-title font-bold">
            Request an appointment
          </h3>
          <p className="text-small text-ink-muted">
            Three quick steps. The front desk calls you to confirm a time.
          </p>
        </div>
      </div>

      <Group step={1} title="What can we help with?">
        <ChoiceChips
          legend="Treatment"
          name="treatment"
          options={treatmentChoices}
          value={values.treatment}
          onChange={set('treatment')}
        />
      </Group>

      <Group step={2} title="When suits you?">
        <div className="flex flex-col gap-4">
          <Field
            label="Preferred date"
            name="preferredDate"
            type="date"
            min={today()}
            value={values.preferredDate}
            onChange={(e) => set('preferredDate')(e.target.value)}
            error={errors.preferredDate}
            className="sm:max-w-60"
          />
          <ChoiceChips
            legend="Time of day"
            name="preferredTime"
            options={timeChoices}
            tiles
            className="sm:max-w-sm"
            value={values.preferredTime}
            onChange={set('preferredTime')}
          />
        </div>
      </Group>

      <Group step={3} title="Your details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Your name"
            name="name"
            autoComplete="name"
            prefix={<UserIcon size={18} aria-hidden />}
            value={values.name}
            onChange={(e) => set('name')(e.target.value)}
            error={errors.name}
          />
          <Field
            label="Mobile number"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            prefix="+91"
            placeholder="98480 21573"
            value={values.phone}
            onChange={(e) => set('phone')(e.target.value)}
            error={errors.phone}
          />
        </div>
        <AccordionItem
          variant="plain"
          defaultOpen={!!errors.message}
          className="-mx-3"
          title={<span className="text-small text-brand">Add a note (optional)</span>}
        >
          <TextAreaField
            label="Anything we should know?"
            name="message"
            maxLength={500}
            placeholder="For example: a broken tooth, or you are visiting from another city"
            value={values.message}
            onChange={(e) => set('message')(e.target.value)}
            error={errors.message}
          />
        </AccordionItem>
      </Group>

      <div className="flex flex-col gap-3 rounded-3xl bg-sunken p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-caption text-ink-muted">
          <LockSimpleIcon size={16} aria-hidden className="shrink-0" />
          We only use your number to arrange this visit.
        </p>
        <Button type="submit" loading={status === 'sending'} className="w-full sm:w-fit">
          Request appointment
          <ArrowRightIcon size={18} aria-hidden />
        </Button>
      </div>

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
          <p className="flex items-start gap-2 rounded-control bg-success-soft p-3 text-small text-success">
            <CheckCircleIcon size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
            <span>
              Thank you. Your request has reached the clinic. The front desk will call you to
              confirm a time.
            </span>
          </p>
        ) : null}
        {status === 'not-connected' || status === 'failed' ? (
          <p className="flex items-start gap-2 rounded-control bg-highlight-soft p-3 text-small text-on-highlight-soft">
            <InfoIcon size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
            <span>
              {status === 'not-connected'
                ? 'Online booking is being set up, so this request was not sent. '
                : `${failure || 'Your request could not be sent.'} `}
              Please call <PhoneLink className="align-bottom" iconSize={14} /> to book.
            </span>
          </p>
        ) : null}
      </div>
    </form>
  );
}
