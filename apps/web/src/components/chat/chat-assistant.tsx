import { PaperPlaneRightIcon, SparkleIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import { DotsLoader } from '@/components/ui/dots-loader';
import { clinic, clinicTelHref } from '@/config/site';
import { doctors, treatments } from '@/content/clinic';
import { cx } from '@/lib/cx';
import { useQuickActions, type QuickAction } from '@/lib/quick-actions';

type Action = { label: string; to?: string; quick?: QuickAction; href?: string };
type Message = { id: number; from: 'bot' | 'user'; text: string; actions?: Action[] };
type Reply = Omit<Message, 'id' | 'from'>;

const has = (text: string, words: string[]) => words.some((word) => text.includes(word));

const treatmentKeywords: Record<string, string[]> = {
  invisalign: ['invisalign', 'aligner', 'clear brace', 'straighten'],
  implants: ['implant', 'missing tooth', 'missing teeth', 'replace a tooth', 'replace tooth'],
  braces: ['braces', 'brace', 'crooked', 'gap'],
  'crowns-bridges': ['crown', 'bridge', 'cap', 'broken tooth', 'cracked'],
  dentures: ['denture', 'false teeth'],
  'laser-dentistry': ['laser', 'novolase', 'gum', 'ulcer'],
  'smile-design': ['smile design', 'whitening', 'whiten', 'veneer', 'makeover', 'yellow'],
};

const callAction: Action = clinicTelHref
  ? { label: `Call ${clinic.phone.display}`, href: clinicTelHref }
  : { label: 'Request a call back', quick: 'callback' };

/**
 * Rule-based answers from this website's own content (treatments, doctors, booking).
 * It never gives medical advice: symptoms get pointed to the clinic, emergencies to 108.
 * TODO(assistant): swap `answer` for a real assistant backend when it exists.
 */
function answer(raw: string): Reply {
  const text = raw.toLowerCase();

  if (has(text, ['emergency', 'severe pain', 'swelling', 'bleeding', 'accident', 'knocked out'])) {
    return {
      text: "I'm sorry you're dealing with that. For dental pain or swelling, please call the clinic now so a dentist can advise you. If it's a medical emergency (trouble breathing or swallowing, or a serious injury), call 108.",
      actions: [callAction],
    };
  }
  for (const treatment of treatments) {
    if (has(text, treatmentKeywords[treatment.slug] ?? [])) {
      return {
        text: `${treatment.name}: ${treatment.summary} ${treatment.intro.split('. ')[0]}.`,
        actions: [
          { label: `About ${treatment.name.toLowerCase()}`, to: `/treatments/${treatment.slug}` },
          { label: 'Book a consultation', quick: 'book' },
        ],
      };
    }
  }
  if (has(text, ['brace', 'crooked', 'orthodont', 'pradeep', 'bite'])) {
    const doctor = doctors.find((item) => item.specialty === 'Orthodontics')!;
    return {
      text: `${doctor.name} (${doctor.degree}) leads braces and clear aligner treatment.`,
      actions: [{ label: `Meet ${doctor.name}`, to: `/doctors/${doctor.slug}` }],
    };
  }
  if (has(text, ['crown', 'bridge', 'denture', 'prostho', 'bindu', 'cap'])) {
    const doctor = doctors.find((item) => item.specialty === 'Prosthodontics')!;
    return {
      text: `${doctor.name} (${doctor.degree}) leads crowns, bridges, implants and dentures.`,
      actions: [{ label: `Meet ${doctor.name}`, to: `/doctors/${doctor.slug}` }],
    };
  }
  if (has(text, ['doctor', 'dentist', 'specialist', 'dr '])) {
    return {
      text: doctors.map((doctor) => `${doctor.name}, ${doctor.degree}.`).join(' '),
      actions: doctors.map((doctor) => ({ label: doctor.name, to: `/doctors/${doctor.slug}` })),
    };
  }
  if (has(text, ['book', 'appointment', 'visit', 'consult', 'slot'])) {
    return {
      text: 'Happy to help you book. Share your details and the front desk will confirm a time.',
      actions: [{ label: 'Book an appointment', quick: 'book' }],
    };
  }
  if (has(text, ['price', 'cost', 'fee', 'charge', 'emi', 'how much', 'rate'])) {
    return {
      text: 'Costs depend on your teeth and the treatment plan, so the clinic confirms them after an examination. A call back is the quickest way to get an idea.',
      actions: [{ label: 'Request a call back', quick: 'callback' }],
    };
  }
  if (has(text, ['time', 'timing', 'hour', 'open', 'address', 'location', 'where', 'direction'])) {
    return {
      text: "The clinic's hours and address are being added to this site. Until then, the quickest way is to call or ask for a call back.",
      actions: [callAction, { label: 'Contact page', to: '/contact-us' }],
    };
  }
  if (has(text, ['call', 'phone', 'number', 'contact', 'talk', 'person', 'human'])) {
    return {
      text: 'You can call the clinic, or leave your number for a call back.',
      actions: [callAction],
    };
  }
  if (has(text, ['hi', 'hello', 'hey', 'namaste'])) {
    return { text: 'Hello! Ask me about treatments, our doctors, or booking a visit.' };
  }
  return {
    text: 'I can help with treatments, our doctors and booking. For anything else, the front desk can help.',
    actions: [callAction],
  };
}

const quickReplies = [
  'Treatments',
  'Invisalign',
  'Implants',
  'Our doctors',
  'Book a visit',
  'Costs',
];

/** Chat panel: messages, quick replies and a text box. Closes itself when a link is followed. */
export function ChatAssistant() {
  const { show, close } = useQuickActions();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: 'bot',
      text: "Hi! I'm the Quantum assistant. Ask me about treatments, our doctors or booking a visit.",
    },
  ]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const question = trimmed === 'Treatments' ? 'What treatments do you offer?' : trimmed;
    setMessages((current) => [...current, { id: nextId.current++, from: 'user', text: trimmed }]);
    setDraft('');
    setTyping(true);
    window.setTimeout(() => {
      const reply =
        question === 'What treatments do you offer?'
          ? {
              text: `We offer ${treatments.map((item) => item.name.toLowerCase()).join(', ')}.`,
              actions: treatments.map((item) => ({
                label: item.name,
                to: `/treatments/${item.slug}`,
              })),
            }
          : answer(question);
      setMessages((current) => [...current, { id: nextId.current++, from: 'bot', ...reply }]);
      setTyping(false);
    }, 650);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    send(draft);
  };

  const actionClass =
    'inline-flex min-h-9 items-center rounded-full border border-brand/40 bg-surface px-3 text-small font-medium text-brand transition-colors hover:bg-brand-soft';

  return (
    <div className="flex h-[min(68dvh,34rem)] flex-col gap-3">
      <p className="flex items-center gap-1.5 text-caption text-ink-muted">
        <SparkleIcon size={14} weight="fill" className="text-brand" aria-hidden />
        Assistant (beta), answering from this website. Not medical advice.
      </p>
      <div
        ref={list}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="-mx-1 flex flex-1 flex-col gap-3 overflow-y-auto px-1"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cx(
              'flex max-w-[85%] animate-[lightbox-in_260ms_var(--ease-out)_both] flex-col gap-2',
              message.from === 'user' ? 'self-end items-end' : 'self-start',
            )}
          >
            <p
              className={cx(
                'rounded-3xl px-4 py-2.5 text-small',
                message.from === 'user'
                  ? 'rounded-br-md bg-brand text-on-brand'
                  : 'rounded-bl-md bg-sunken text-ink',
              )}
            >
              {message.text}
            </p>
            {message.actions?.length ? (
              <div className="flex flex-wrap gap-2">
                {message.actions.map((action) =>
                  action.to ? (
                    <Link
                      key={action.label}
                      to={action.to}
                      viewTransition
                      onClick={close}
                      className={actionClass}
                    >
                      {action.label}
                    </Link>
                  ) : action.href ? (
                    <a key={action.label} href={action.href} className={actionClass}>
                      {action.label}
                    </a>
                  ) : (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => action.quick && show(action.quick)}
                      className={actionClass}
                    >
                      {action.label}
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </div>
        ))}
        {typing ? (
          <div className="self-start rounded-3xl rounded-bl-md bg-sunken px-4 py-3">
            <DotsLoader size="sm" label="Assistant is typing" />
          </div>
        ) : null}
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => send(reply)}
            className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-small whitespace-nowrap text-ink-muted transition-colors hover:border-brand hover:text-brand"
          >
            {reply}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Your message
        </label>
        <input
          id="chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type your question"
          autoComplete="off"
          maxLength={300}
          className="h-12 min-w-0 flex-1 rounded-full border border-line-strong bg-surface px-4 text-body outline-none focus:border-brand"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!draft.trim() || typing}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-on-brand transition-[opacity,transform] active:scale-95 disabled:opacity-45"
        >
          <PaperPlaneRightIcon size={20} weight="fill" aria-hidden />
        </button>
      </form>
    </div>
  );
}
