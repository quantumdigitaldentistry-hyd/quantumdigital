import { appointmentRequestSchema, toIndianE164 } from '@quantam/shared';
import { CheckCircleIcon } from '@phosphor-icons/react';
import { useState, type FormEvent } from 'react';

import { PhoneLink } from '@/components/contact/phone-link';
import { Button } from '@/components/ui/button';
import { Field, SelectField, TextAreaField } from '@/components/ui/field';
import { treatments } from '@/content/clinic';
import { CallbackNotConnectedError, requestAppointment } from '@/lib/callback';

type Errors = Partial<Record<'name' | 'phone' | 'preferredDate' | 'message', string>>;

const today = () => new Date().toISOString().slice(0, 10);

/**
 * "Book an appointment" form. Validates on submit (errors appear under each field),
 * then sends the request. Until the backend exists the request is not sent, and the
 * form says so plainly with the clinic's number instead of faking a confirmation.
 */
export default function AppointmentForm({ plain = false }: { plain?: boolean }) {
  const [values, setValues] = useState({
    name: '',
    phone: '',
    treatment: '',
    preferredDate: '',
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'not-connected' | 'failed'>('idle');

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const e164 = toIndianE164(values.phone);
    const parsed = appointmentRequestSchema.safeParse({ ...values, phone: e164 ?? '' });
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
      await requestAppointment(parsed.data);
    } catch (error) {
      setStatus(error instanceof CallbackNotConnectedError ? 'not-connected' : 'failed');
    }
  };

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-labelledby={plain ? undefined : 'appointment-form-title'}
      aria-label={plain ? 'Request an appointment' : undefined}
      className={
        plain
          ? 'flex flex-col gap-4 text-ink'
          : 'flex flex-col gap-4 rounded-4xl border border-line bg-surface p-5 text-ink shadow-2xl shadow-elevation/30 md:p-7'
      }
    >
      <div className={plain ? 'sr-only' : 'flex flex-col gap-1'}>
        <h3 id="appointment-form-title" className="font-display text-title font-bold">
          Request an appointment
        </h3>
        <p className="text-small text-ink-muted">The front desk confirms the time with you.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Your name"
          name="name"
          autoComplete="name"
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
        <SelectField
          label="Treatment"
          name="treatment"
          placeholder="Not sure yet"
          options={treatments.map((item) => ({ value: item.slug, label: item.name }))}
          value={values.treatment}
          onChange={(e) => set('treatment')(e.target.value)}
        />
        <Field
          label="Preferred date"
          name="preferredDate"
          type="date"
          min={today()}
          value={values.preferredDate}
          onChange={(e) => set('preferredDate')(e.target.value)}
          error={errors.preferredDate}
        />
      </div>
      <TextAreaField
        label="Anything we should know? (optional)"
        name="message"
        maxLength={500}
        value={values.message}
        onChange={(e) => set('message')(e.target.value)}
        error={errors.message}
      />
      <Button type="submit" loading={status === 'sending'} className="w-full sm:w-fit">
        Request appointment
      </Button>
      <div aria-live="polite">
        {status === 'not-connected' || status === 'failed' ? (
          <p className="flex items-start gap-2 rounded-control bg-highlight-soft p-3 text-small text-on-highlight-soft">
            <CheckCircleIcon size={18} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
            <span>
              {status === 'not-connected'
                ? 'Online booking is being set up, so this request was not sent. '
                : 'Your request could not be sent. '}
              Please call <PhoneLink className="align-bottom" iconSize={14} /> to book.
            </span>
          </p>
        ) : null}
      </div>
    </form>
  );
}
