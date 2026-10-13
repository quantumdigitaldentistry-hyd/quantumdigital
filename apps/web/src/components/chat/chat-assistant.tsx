import { appointmentRequestSchema, callbackRequestSchema } from '@quantam/shared';
import { ArrowCounterClockwiseIcon, PaperPlaneRightIcon, SparkleIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import { DotsLoader } from '@/components/ui/dots-loader';
import { clinic } from '@/config/site';
import {
  greeting,
  respond,
  type BotMessage,
  type ChatAction,
  type ChatContext,
  type Environment,
  type Submission,
} from '@/lib/assistant/engine';
import { CallbackNotConnectedError, requestAppointment, requestCallback } from '@/lib/callback';
import { useClinicHours } from '@/lib/clinic-hours';
import { cx } from '@/lib/cx';
import { useQuickActions } from '@/lib/quick-actions';

type Message = BotMessage & {
  id: number;
  from: 'bot' | 'user';
  /** Still writing itself out (see StreamingText). */
  streaming?: boolean;
};
type Saved = { messages: Message[]; suggestions: string[]; context: ChatContext };

const STORAGE_KEY = 'qdd-chat';

const load = (): Saved | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
};
const save = (saved: Saved) => {
  try {
    // A reply cut off mid-stream is saved whole.
    const messages = saved.messages.map((message) => ({ ...message, streaming: false }));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, messages }));
  } catch {
    // Storage blocked: the chat just won't survive a reload.
  }
};

/** A short "thinking" pause before a reply starts to stream. */
const thinkingTime = (text: string) => Math.min(900, 320 + text.length * 1.5);

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Writes a reply out a few words at a time, like a live answer: about 40 words a second,
 * faster for long replies so none takes more than about 1.6 seconds. Lists and paragraphs
 * form as the text arrives. Shows the whole text at once with reduced motion.
 */
function StreamingText({
  text,
  onProgress,
  onDone,
}: {
  text: string;
  onProgress: () => void;
  onDone: () => void;
}) {
  const tokens = text.split(/(\s+)/);
  const [shown, setShown] = useState(() => (reducedMotion() ? tokens.length : 0));
  const done = useRef({ onProgress, onDone });
  useEffect(() => {
    done.current = { onProgress, onDone };
  });

  useEffect(() => {
    if (shown >= tokens.length) {
      done.current.onDone();
      return;
    }
    // Two tokens (a word and its space) per tick, more for long replies.
    const step = Math.max(2, Math.ceil(tokens.length / 64) * 2);
    const timer = window.setTimeout(() => {
      setShown((count) => Math.min(tokens.length, count + step));
      done.current.onProgress();
    }, 24);
    return () => window.clearTimeout(timer);
  }, [shown, tokens.length]);

  return <MessageText text={tokens.slice(0, shown).join('')} />;
}

/** Sends a booking or call-back request through the same backend as the site's forms. */
async function submit(request: Submission): Promise<BotMessage> {
  try {
    if (request.kind === 'appointment') {
      const parsed = appointmentRequestSchema.safeParse(request);
      if (!parsed.success) throw new Error('Some details look incomplete.');
      await requestAppointment(parsed.data);
      return {
        text: `Done! Your request has reached the clinic, ${request.name.split(' ')[0]}. The front desk will call you on ${request.phone} to confirm the time.`,
      };
    }
    const parsed = callbackRequestSchema.safeParse(request);
    if (!parsed.success) throw new Error('Some details look incomplete.');
    await requestCallback(parsed.data);
    return {
      text: `Done! The clinic will call ${request.name.split(' ')[0]} on ${request.phone} during opening hours.`,
    };
  } catch (error) {
    const reason =
      error instanceof CallbackNotConnectedError
        ? 'Online requests are still being set up, so this one was not sent.'
        : `${error instanceof Error ? error.message : 'Your request could not be sent.'}`;
    return {
      text: `${reason} Please call or WhatsApp the clinic on ${clinic.phone.display} and the team will help you straight away.`,
      actions: [
        { label: `Call ${clinic.phone.display}`, href: `tel:${clinic.phone.tel ?? ''}` },
        { label: 'WhatsApp us', href: clinic.whatsapp },
      ],
    };
  }
}

const LIST_ITEM = /^(• |\d+\. )/;

/**
 * Message text: blank lines separate paragraphs; runs of "• " or "1. " lines become a
 * bulleted or numbered list.
 */
function MessageText({ text }: { text: string }) {
  const blocks: { list?: 'ul' | 'ol'; lines: string[] }[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) {
      blocks.push({ lines: [] });
      continue;
    }
    const kind = LIST_ITEM.test(line) ? (/^\d/.test(line) ? 'ol' : 'ul') : undefined;
    const last = blocks.at(-1);
    if (last && last.list === kind && (kind || last.lines.length)) last.lines.push(line);
    else blocks.push({ list: kind, lines: [line] });
  }
  return (
    <>
      {blocks
        .filter((block) => block.lines.length)
        .map((block, index) => {
          if (!block.list) {
            return (
              <p key={index} className="whitespace-pre-line">
                {block.lines.join('\n')}
              </p>
            );
          }
          const List = block.list;
          return (
            <List
              key={index}
              className={cx(
                'flex flex-col gap-1 pl-4',
                List === 'ol' ? 'list-decimal' : 'list-disc',
              )}
            >
              {block.lines.map((line) => (
                <li key={line}>{line.replace(LIST_ITEM, '')}</li>
              ))}
            </List>
          );
        })}
    </>
  );
}

/**
 * The chat panel: a conversation with the site assistant (lib/assistant/engine.ts), with
 * suggested replies that follow the conversation, guided booking and call-back flows that
 * send real requests, and a "Start over". The conversation is kept for this visit, so
 * closing and reopening the panel carries on where it left off.
 */
export function ChatAssistant() {
  const { show, close } = useQuickActions();
  const hours = useClinicHours();
  const env = (): Environment => ({ hours, now: new Date() });
  const [state, setState] = useState<Saved>(() => {
    const saved = load();
    if (saved?.messages.length) return saved;
    const first = greeting({ hours, now: new Date() });
    return {
      messages: first.replies.map((reply, index) => ({ ...reply, id: index, from: 'bot' })),
      suggestions: first.suggestions,
      context: first.context,
    };
  });
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(Math.max(0, ...state.messages.map((message) => message.id)) + 1);
  const timers = useRef<number[]>([]);
  // Resolves each streaming reply's promise when it has finished writing out.
  const streams = useRef(new Map<number, () => void>());

  useEffect(() => save(state), [state]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [state.messages.length, typing]);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => timers.current.push(window.setTimeout(resolve, ms)));

  /** Adds a bot reply that streams in; resolves when it has finished writing out. */
  const addBot = (reply: BotMessage) =>
    new Promise<void>((resolve) => {
      const id = nextId.current++;
      streams.current.set(id, resolve);
      setState((current) => ({
        ...current,
        messages: [...current.messages, { ...reply, id, from: 'bot', streaming: true }],
      }));
    });

  const finishStream = (id: number) => {
    setState((current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.id === id ? { ...message, streaming: false } : message,
      ),
    }));
    streams.current.get(id)?.();
    streams.current.delete(id);
  };

  /** Keeps the newest text in view while it streams, unless the visitor scrolled up. */
  const followStream = () => {
    const element = list.current;
    if (!element) return;
    if (element.scrollHeight - element.scrollTop - element.clientHeight < 120)
      element.scrollTop = element.scrollHeight;
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setDraft('');
    const turn = respond(trimmed, state.context, env());
    setState((current) => ({
      messages: [...current.messages, { id: nextId.current++, from: 'user', text: trimmed }],
      suggestions: [],
      context: turn.context,
    }));
    // Each reply: a short "typing" pause, then it streams in.
    for (const reply of turn.replies) {
      setTyping(true);
      await wait(thinkingTime(reply.text));
      setTyping(false);
      await addBot(reply);
    }
    if (turn.submit) {
      setTyping(true);
      const result = await submit(turn.submit);
      setTyping(false);
      await addBot(result);
    }
    setState((current) => ({
      ...current,
      suggestions: turn.submit ? ['Timings and address', 'Treatments'] : turn.suggestions,
    }));
    input.current?.focus({ preventScroll: true });
  };

  const startOver = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    streams.current.forEach((resolve) => resolve());
    streams.current.clear();
    setTyping(false);
    const first = greeting(env(), state.context.name);
    setState({
      messages: first.replies.map((reply) => ({ ...reply, id: nextId.current++, from: 'bot' })),
      suggestions: first.suggestions,
      context: first.context,
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(draft);
  };

  const actionClass =
    'inline-flex min-h-9 items-center rounded-full border border-brand/40 bg-surface px-3 text-small font-medium text-brand transition-colors hover:bg-brand-soft';

  const renderAction = (action: ChatAction) =>
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
      <a
        key={action.label}
        href={action.href}
        target={action.href.startsWith('http') ? '_blank' : undefined}
        rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={actionClass}
      >
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
    );

  return (
    // Short enough that the dialog around it never needs its own scrollbar.
    <div className="flex h-[min(62dvh,32rem)] flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-caption text-ink-muted">
          <SparkleIcon size={14} weight="fill" className="text-brand" aria-hidden />
          Answers from this website. Not medical advice.
        </p>
        <button
          type="button"
          onClick={startOver}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-caption font-medium text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
        >
          <ArrowCounterClockwiseIcon size={14} aria-hidden />
          Start over
        </button>
      </div>
      <div
        ref={list}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="-mx-1 flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-1"
      >
        {state.messages.map((message) => (
          <div
            key={message.id}
            className={cx(
              'flex max-w-[88%] animate-[lightbox-in_260ms_var(--ease-out)_both] flex-col gap-2',
              message.from === 'user' ? 'items-end self-end' : 'self-start',
            )}
          >
            <div
              className={cx(
                'flex flex-col gap-2 rounded-3xl px-4 py-2.5 text-small wrap-break-word',
                message.from === 'user'
                  ? 'rounded-br-md bg-brand text-on-brand'
                  : 'rounded-bl-md bg-sunken text-ink',
              )}
            >
              {message.streaming ? (
                <StreamingText
                  text={message.text}
                  onProgress={followStream}
                  onDone={() => finishStream(message.id)}
                />
              ) : (
                <MessageText text={message.text} />
              )}
            </div>
            {/* Links and buttons arrive once the text has finished. */}
            {message.actions?.length && !message.streaming ? (
              <div className="flex flex-wrap gap-2">{message.actions.map(renderAction)}</div>
            ) : null}
          </div>
        ))}
        {typing ? (
          <div className="self-start rounded-3xl rounded-bl-md bg-sunken px-4 py-3">
            <DotsLoader size="sm" label="Assistant is typing" />
          </div>
        ) : null}
      </div>
      {state.suggestions.length && !typing ? (
        <div
          aria-label="Suggested replies"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
        >
          {state.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void send(suggestion)}
              className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-small whitespace-nowrap text-ink-muted transition-colors hover:border-brand hover:text-brand"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Your message
        </label>
        <input
          ref={input}
          id="chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type your message"
          autoComplete="off"
          enterKeyHint="send"
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
