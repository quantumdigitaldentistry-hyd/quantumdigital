import { callbackRequestSchema, toIndianE164 } from '@quantam/shared';
import { lazy, Suspense, useState, type FormEvent } from 'react';

import { ChatAssistant } from '@/components/chat/chat-assistant';
import { PhoneLink } from '@/components/contact/phone-link';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { CallbackNotConnectedError, requestCallback } from '@/lib/callback';
import { useQuickActions } from '@/lib/quick-actions';

const AppointmentForm = lazy(() => import('@/components/contact/appointment-form'));

type FormErrors = { name?: string; phone?: string };

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
        placeholder="98480 21573"
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
      >
        {/* Re-mounted on every open, so the form starts empty. */}
        {open === 'callback' ? <CallbackForm /> : null}
      </Dialog>

      <Dialog
        open={open === 'book'}
        onClose={close}
        title="Book an appointment"
        description="Tell us what you need and when suits you. The front desk confirms the time."
      >
        {open === 'book' ? (
          <Suspense fallback={<div aria-hidden className="h-96" />}>
            <AppointmentForm plain />
          </Suspense>
        ) : null}
      </Dialog>

      <Dialog open={open === 'chat'} onClose={close} origin={origin} title="Chat assistant">
        {open === 'chat' ? <ChatAssistant /> : null}
      </Dialog>
    </>
  );
}
