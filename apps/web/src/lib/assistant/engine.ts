import { toIndianE164 } from '@quantam/shared';

import { clinic, clinicTelHref, type DayHours } from '@/config/site';
import { doctors, leadDoctor, oneLine, treatments, type Treatment } from '@/content/clinic';
import { googleRating } from '@/content/reviews';
import { treatmentDetails } from '@/content/treatment-details';
import { bookingPath } from '@/lib/booking';
import { describeHours, formatClock } from '@/lib/clinic-hours';
import type { QuickAction } from '@/lib/quick-actions';

/*
 * The chat assistant's brain: rule-based, answering only from this website's own content
 * (treatments and their FAQs, doctors, hours, address, reviews). It keeps a little
 * context (the treatment being discussed, the visitor's name, a flow in progress) so
 * follow-ups like "how long does it take?" or "book it" make sense, and it runs short
 * guided flows: booking, a call back, toothache triage and "help me choose".
 *
 * It never diagnoses or gives medical advice: symptoms lead to the clinic, emergencies
 * to 108. Pure functions, no React, so it is easy to test and to swap for a real
 * assistant later.
 */

export type ChatAction = {
  label: string;
  /** A page on this site. */
  to?: string;
  /** An outside link or tel:/mailto:. */
  href?: string;
  /** Opens a site panel (call back, booking). */
  quick?: QuickAction;
};

export type BotMessage = {
  text: string;
  actions?: ChatAction[];
};

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

type BookingDraft = {
  treatment?: string;
  /** YYYY-MM-DD, or '' for "no preference". */
  date?: string;
  time?: TimeOfDay | '';
  name?: string;
  phone?: string;
};

export type Flow =
  | {
      kind: 'book';
      step: 'treatment' | 'day' | 'time' | 'name' | 'phone' | 'confirm';
      draft: BookingDraft;
    }
  | {
      kind: 'callback';
      step: 'name' | 'phone' | 'confirm';
      draft: { name?: string; phone?: string };
    }
  | { kind: 'pain'; step: 'warning' | 'next' }
  | { kind: 'straighten'; step: 'look' }
  | { kind: 'missing'; step: 'how-many' };

export type ChatContext = {
  /** The treatment slug being discussed, for follow-up questions. */
  topic?: string;
  name?: string;
  flow?: Flow;
};

/** A request the chat panel sends to the clinic (same backend as the forms). */
export type Submission =
  | {
      kind: 'appointment';
      name: string;
      phone: string;
      treatment?: string;
      preferredDate?: string;
      preferredTime?: TimeOfDay;
    }
  | { kind: 'callback'; name: string; phone: string };

export type Turn = {
  replies: BotMessage[];
  /** Tappable suggestions for the visitor's next message. */
  suggestions: string[];
  context: ChatContext;
  submit?: Submission;
};

export type Environment = {
  hours: DayHours[];
  now: Date;
};

// ---------------------------------------------------------------------------
// Understanding text

const normalise = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Levenshtein distance, capped: only "close enough?" matters. */
function distance(a: string, b: string, cap = 2) {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + cost);
      rowMin = Math.min(rowMin, current[j]!);
    }
    if (rowMin > cap) return cap + 1;
    previous = current;
  }
  return previous[b.length]!;
}

/**
 * Does the text mention any of these? Phrases match as substrings; single words match
 * whole words, with a typo or two allowed in longer words ("alingers", "implnt").
 */
function mentions(text: string, terms: string[]) {
  const words = text.split(' ');
  return terms.some((term) => {
    if (term.includes(' ')) return ` ${text} `.includes(` ${term} `) || text.includes(term);
    if (term.length <= 4) return words.includes(term);
    const allowed = term.length >= 8 ? 2 : 1;
    return words.some(
      (word) => word === term || (word.length >= 4 && distance(word, term, allowed) <= allowed),
    );
  });
}

const YES = [
  'yes',
  'yeah',
  'yep',
  'yup',
  'sure',
  'ok',
  'okay',
  'please',
  'correct',
  'right',
  'haan',
  'ha',
  'ji',
  'confirm',
  'go ahead',
  'sounds good',
  'thats right',
];
const NO = ['no', 'nope', 'nah', 'not now', 'later', 'nahi', 'dont', 'not really'];
const CANCEL = [
  'cancel',
  'stop',
  'never mind',
  'nevermind',
  'forget it',
  'start over',
  'restart',
  'reset',
  'exit',
  'quit',
];

const isYes = (text: string) => mentions(text, YES) && !mentions(text, ['no', 'not', 'nahi']);
const isNo = (text: string) => mentions(text, NO);

// ---------------------------------------------------------------------------
// Knowledge

const treatmentKeywords: Record<string, string[]> = {
  braces: [
    'braces',
    'brace',
    'metal braces',
    'ceramic braces',
    'crooked',
    'crowded',
    'overbite',
    'underbite',
    'bite correction',
  ],
  aligners: [
    'invisalign',
    'aligner',
    'aligners',
    'clear braces',
    'invisible braces',
    'clear aligner',
    'clear aligners',
  ],
  implants: [
    'implant',
    'implants',
    'missing tooth',
    'missing teeth',
    'replace a tooth',
    'tooth replacement',
    'titanium',
  ],
  veneers: ['veneer', 'veneers', 'laminate', 'laminates'],
  'tooth-coloured-fillings': [
    'filling',
    'fillings',
    'cavity',
    'cavities',
    'decay',
    'hole in my tooth',
    'black spot',
  ],
  'smile-design': [
    'smile design',
    'smile designing',
    'makeover',
    'smile makeover',
    'hollywood smile',
  ],
  'root-canal': ['root canal', 'rct', 'nerve', 'infected tooth', 'abscess'],
  'full-mouth-rehabilitation': [
    'full mouth',
    'rehabilitation',
    'worn teeth',
    'all my teeth',
    'many teeth',
  ],
  dentures: ['denture', 'dentures', 'false teeth', 'partial denture'],
  'teeth-cleaning': [
    'cleaning',
    'clean my teeth',
    'scaling',
    'tartar',
    'plaque',
    'bad breath',
    'polishing',
    'gums',
    'gum',
    'gums bleeding',
    'gum bleeding',
  ],
  'teeth-whitening': ['whitening', 'whiten', 'yellow teeth', 'stains', 'stained', 'brighter teeth'],
  'crowns-bridges': [
    'crown',
    'crowns',
    'bridge',
    'bridges',
    'cap',
    'broken tooth',
    'cracked tooth',
  ],
  'onlays-inlays': ['onlay', 'onlays', 'inlay', 'inlays'],
  'kids-dentistry': [
    'kid',
    'kids',
    'child',
    'children',
    'son',
    'daughter',
    'baby teeth',
    'milk teeth',
    'pediatric',
    'paediatric',
    'toddler',
  ],
  'laser-dentistry': ['laser', 'novolase'],
  'gum-surgery': [
    'gum surgery',
    'gum disease',
    'receding gums',
    'gum recession',
    'loose tooth',
    'loose teeth',
    'periodontal',
    'pyorrhea',
    'bleeding gums',
    'swollen gums',
  ],
  'wisdom-teeth-removal': ['wisdom', 'wisdom tooth', 'wisdom teeth', 'third molar', 'impacted'],
};

/** The treatment the text is about, if any. Longer, more specific phrases win. */
function findTreatment(text: string): Treatment | undefined {
  let best: { treatment: Treatment; score: number } | undefined;
  for (const treatment of treatments) {
    const terms = [
      ...(treatmentKeywords[treatment.slug] ?? []),
      treatment.name.toLowerCase(),
      (treatment.shortName ?? '').toLowerCase(),
    ].filter(Boolean);
    for (const term of terms) {
      if (mentions(text, [term])) {
        const score = term.length;
        if (!best || score > best.score) best = { treatment, score };
      }
    }
  }
  return best?.treatment;
}

const byslug = (slug?: string) => treatments.find((treatment) => treatment.slug === slug);

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const minutes = (value: string) => {
  const [h = 0, m = 0] = value.split(':').map(Number);
  return h * 60 + m;
};

/** "Open now until 9 pm", "Closed now, opens 9:30 am", or null if not known. */
function openNow(env: Environment) {
  const today = env.hours[env.now.getDay()];
  if (!today || today === 'closed') return null;
  const now = env.now.getHours() * 60 + env.now.getMinutes();
  if (now < minutes(today.open)) return `Opens today at ${formatClock(today.open)}.`;
  if (now < minutes(today.close)) return `Open now, until ${formatClock(today.close)}.`;
  return 'Closed for today.';
}

const isoDate = (date: Date) => date.toLocaleDateString('en-CA');
const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};
const friendlyDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

/** A preferred day from "today", "tomorrow", "monday", "this week"; '' = no preference. */
function parseDay(text: string, env: Environment): string | '' | undefined {
  if (
    mentions(text, [
      'any day',
      'anytime',
      'any time',
      'no preference',
      'flexible',
      'whenever',
      'this week',
      'not sure',
    ])
  )
    return '';
  if (mentions(text, ['today', 'aaj'])) return isoDate(env.now);
  if (mentions(text, ['day after tomorrow'])) return isoDate(addDays(env.now, 2));
  if (mentions(text, ['tomorrow', 'tmrw', 'tmr', 'kal'])) return isoDate(addDays(env.now, 1));
  for (const [index, day] of DAYS.entries()) {
    if (mentions(text, [day.toLowerCase(), day.slice(0, 3).toLowerCase()])) {
      const ahead = (index - env.now.getDay() + 7) % 7 || 7;
      return isoDate(addDays(env.now, ahead));
    }
  }
  return undefined;
}

function parseTime(text: string): TimeOfDay | '' | undefined {
  if (mentions(text, ['morning', 'am', 'before noon', 'early'])) return 'morning';
  if (mentions(text, ['afternoon', 'noon', 'lunch'])) return 'afternoon';
  if (mentions(text, ['evening', 'night', 'after work', 'pm', 'late'])) return 'evening';
  if (mentions(text, ['any', 'anytime', 'any time', 'flexible', 'no preference'])) return '';
  return undefined;
}

/** A plausible name from "I'm Priya", "my name is Ravi Kumar", or just "Priya". */
function parseName(raw: string): string | undefined {
  const cleaned = raw
    .trim()
    .replace(/^(hi|hello|hey)[,!\s]+/i, '')
    .replace(/^(my name is|my name's|i am|i'm|im|this is|it's|its|name is|call me)\s+/i, '')
    .replace(/[.!]+$/, '')
    .trim();
  if (!/^[\p{L}][\p{L}\s.'-]{1,48}$/u.test(cleaned)) return undefined;
  if (cleaned.split(/\s+/).length > 4) return undefined;
  return cleaned.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

const firstName = (name?: string) => name?.split(/\s+/)[0];

const call: ChatAction = clinicTelHref
  ? { label: `Call ${clinic.phone.display}`, href: clinicTelHref }
  : { label: 'Request a call back', quick: 'callback' };
const whatsapp: ChatAction = { label: 'WhatsApp us', href: clinic.whatsapp };
const directions: ChatAction = {
  label: 'Directions',
  href: clinic.directionsUrl,
};

const STOPWORDS = new Set(
  'a an the is are am was be do does did i my me you your it its of to in on for with and or can will would should how what when where which who why this that there have has after before about any much many get got need'.split(
    ' ',
  ),
);
const keyWords = (text: string) =>
  normalise(text)
    .split(' ')
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));

/** The FAQ answer that best fits the question, from one treatment or all of them. */
function findFaq(text: string, slug?: string) {
  const asked = keyWords(text);
  if (!asked.length) return undefined;
  const pool = Object.entries(treatmentDetails)
    .filter(([key]) => !slug || key === slug)
    .flatMap(([key, details]) => details.faqs.map((faq) => ({ ...faq, slug: key })));
  let best: { faq: (typeof pool)[number]; score: number } | undefined;
  for (const faq of pool) {
    const words = keyWords(faq.question);
    const score = asked.filter((word) =>
      words.some((w) => w === word || (word.length >= 5 && distance(w, word, 1) <= 1)),
    ).length;
    if (score && (!best || score > best.score)) best = { faq, score };
  }
  // One shared word is enough within a known topic; across everything, ask for two.
  return best && best.score >= (slug ? 1 : 2) ? best.faq : undefined;
}

/** A FAQ for this treatment whose question contains any of these words. */
const faqAbout = (slug: string, words: string[]) =>
  treatmentDetails[slug]?.faqs.find((faq) => mentions(normalise(faq.question), words));

// ---------------------------------------------------------------------------
// Replies

const treatmentFollowUps = [
  'How long does it take?',
  'Does it hurt?',
  'What does it cost?',
  'Book a consultation',
];
const startSuggestions = [
  'Treatments',
  'I have tooth pain',
  'Book an appointment',
  'Timings and address',
];

function aboutTreatment(treatment: Treatment): BotMessage[] {
  const doctor = leadDoctor(treatment);
  const lines = [
    `${treatment.name}: ${treatment.summary}`,
    treatment.intro,
    treatment.highlights.length ? treatment.highlights.map((item) => `• ${item}`).join('\n') : '',
    doctor
      ? `It is led by ${oneLine(doctor.name)}, our ${doctor.specialty.toLowerCase()} specialist.`
      : '',
  ].filter(Boolean);
  return [
    {
      text: lines.join('\n\n'),
      actions: [
        {
          label: `More on ${treatment.shortName ?? treatment.name}`,
          to: `/treatments/${treatment.slug}`,
        },
        { label: 'Book a consultation', to: bookingPath(treatment.slug) },
      ],
    },
  ];
}

function steps(treatment: Treatment): BotMessage {
  return {
    text: `Here is how ${treatment.name.toLowerCase()} usually goes:\n${treatment.steps
      .map((step, index) => `${index + 1}. ${step.title}: ${step.body}`)
      .join('\n')}`,
    actions: [{ label: 'See the full page', to: `/treatments/${treatment.slug}` }],
  };
}

function hoursReply(env: Environment): BotMessage {
  const week = DAYS.map(
    (day, index) => `• ${day}: ${describeHours(env.hours[index]).toLowerCase()}`,
  ).join('\n');
  const now = openNow(env);
  return {
    text: `${now ? `${now}\n\n` : ''}Our timings:\n${week}\n\nTimings can change on festivals and holidays, so do call if you are travelling far.`,
    actions: [call, directions],
  };
}

function addressReply(): BotMessage {
  return {
    text: `${clinic.name} is in S R Nagar (Sanjeeva Reddy Nagar), Hyderabad:\n${clinic.address.lines.join('\n')}\n\nS R Nagar metro station (Red Line) is a short walk away, and Ameerpet interchange is one stop on.`,
    actions: [directions, { label: 'Open in Google Maps', href: clinic.address.mapsUrl }],
  };
}

function contactReply(): BotMessage {
  return {
    text: `You can reach the clinic on ${clinic.phone.display} (call or WhatsApp), or email ${clinic.email}. Or leave your number here and the team will call you back.`,
    actions: [call, whatsapp, { label: 'Email us', href: `mailto:${clinic.email}` }],
  };
}

function costReply(treatment?: Treatment): BotMessage {
  const options = treatment ? treatmentDetails[treatment.slug]?.options : undefined;
  const subject = treatment ? treatment.name.toLowerCase() : 'treatment';
  return {
    text: [
      `The cost of ${subject} depends on your teeth and the plan, so the clinic gives you a clear written estimate after an examination, before anything begins.`,
      options?.length
        ? `It varies mainly with the option you choose:\n${options.map((option) => `• ${option.title}`).join('\n')}`
        : '',
      'For a rough idea now, the team can call you back. Ask about payment options at the clinic too.',
    ]
      .filter(Boolean)
      .join('\n\n'),
    actions: [{ label: 'Request a call back', quick: 'callback' }],
  };
}

function doctorsReply(): BotMessage {
  return {
    text: doctors
      .map(
        (doctor) =>
          `• ${oneLine(doctor.name)}, ${doctor.degree}${doctor.fellowship ? ` (${doctor.fellowship})` : ''}: ${doctor.focus}.`,
      )
      .join('\n'),
    actions: doctors.map((doctor) => ({ label: doctor.name, to: `/doctors/${doctor.slug}` })),
  };
}

const treatmentChoices = () => [
  ...treatments.filter((treatment) => treatment.featured).map((t) => t.shortName ?? t.name),
  'Check-up',
  'Not sure yet',
];

const bookingSummary = (draft: BookingDraft) => {
  const treatment = byslug(draft.treatment);
  return [
    `• Treatment: ${treatment ? treatment.name : 'Not sure yet (a check-up)'}`,
    `• Day: ${draft.date ? friendlyDate(draft.date) : 'Any day that suits the clinic'}`,
    `• Time: ${draft.time ? draft.time[0]!.toUpperCase() + draft.time.slice(1) : 'Any time'}`,
    `• Name: ${draft.name}`,
    `• Mobile: ${draft.phone}`,
  ].join('\n');
};

// ---------------------------------------------------------------------------
// Flows

function startBooking(context: ChatContext, treatmentSlug?: string): Turn {
  const draft: BookingDraft = { treatment: treatmentSlug, name: context.name };
  if (treatmentSlug) {
    const treatment = byslug(treatmentSlug)!;
    return {
      replies: [
        {
          text: `Let's book your ${treatment.name.toLowerCase()} consultation. I'll ask a few quick questions; type "cancel" any time to stop.\n\nWhich day suits you?`,
        },
      ],
      suggestions: daySuggestions(),
      context: { ...context, flow: { kind: 'book', step: 'day', draft } },
    };
  }
  return {
    replies: [
      {
        text: 'Happy to book that for you. I\'ll ask a few quick questions; type "cancel" any time to stop.\n\nWhat would you like to come in for?',
      },
    ],
    suggestions: treatmentChoices(),
    context: { ...context, flow: { kind: 'book', step: 'treatment', draft } },
  };
}

const daySuggestions = () => ['Today', 'Tomorrow', 'This week', 'Any day'];
const timeSuggestions = ['Morning', 'Afternoon', 'Evening', 'Any time'];

function continueBooking(
  text: string,
  raw: string,
  flow: Extract<Flow, { kind: 'book' }>,
  context: ChatContext,
  env: Environment,
): Turn {
  const draft = { ...flow.draft };
  const next = (
    step: typeof flow.step,
    replies: BotMessage[],
    suggestions: string[] = [],
  ): Turn => ({
    replies,
    suggestions,
    context: { ...context, name: draft.name ?? context.name, flow: { kind: 'book', step, draft } },
  });

  switch (flow.step) {
    case 'treatment': {
      const treatment = findTreatment(text);
      if (treatment) draft.treatment = treatment.slug;
      else if (
        mentions(text, [
          'not sure',
          'dont know',
          'check up',
          'checkup',
          'check-up',
          'consult',
          'general',
          'pain',
        ])
      )
        draft.treatment = '';
      else
        return next(
          'treatment',
          [
            {
              text: 'Sorry, I didn\'t catch the treatment. Pick one below, or choose "Not sure yet" for a check-up.',
            },
          ],
          treatmentChoices(),
        );
      return next('day', [{ text: 'Great. Which day suits you?' }], daySuggestions());
    }
    case 'day': {
      const day = parseDay(text, env);
      if (day === undefined)
        return next(
          'day',
          [{ text: 'Which day works best? For example "tomorrow", "Saturday" or "any day".' }],
          daySuggestions(),
        );
      draft.date = day;
      const weekday = day ? new Date(`${day}T12:00:00`).getDay() : -1;
      const hours = weekday >= 0 ? env.hours[weekday] : undefined;
      const note =
        hours === 'closed'
          ? ` The clinic is usually closed on ${DAYS[weekday]}s, so the team may suggest another day.`
          : weekday >= 0 && !hours
            ? ` ${DAYS[weekday]} timings vary, so the team will confirm.`
            : '';
      return next(
        'time',
        [
          {
            text: `${day ? friendlyDate(day) : 'Any day'} it is.${note} Morning, afternoon or evening?`,
          },
        ],
        timeSuggestions,
      );
    }
    case 'time': {
      const time = parseTime(text);
      if (time === undefined)
        return next(
          'time',
          [{ text: 'What time of day suits you: morning, afternoon or evening?' }],
          timeSuggestions,
        );
      draft.time = time;
      if (draft.name)
        return next('phone', [
          {
            text: `Thanks ${firstName(draft.name)}. What's the best mobile number to confirm your visit?`,
          },
        ]);
      return next('name', [{ text: 'And your name, please?' }]);
    }
    case 'name': {
      const name = parseName(raw);
      if (!name)
        return next('name', [
          { text: 'Could you type just your name? For example "Priya Sharma".' },
        ]);
      draft.name = name;
      return next('phone', [
        {
          text: `Thanks ${firstName(name)}. What's the best mobile number to confirm your visit? (10 digits)`,
        },
      ]);
    }
    case 'phone': {
      const e164 = toIndianE164(raw);
      if (!e164)
        return next('phone', [
          {
            text: "That number doesn't look right. Please type a 10-digit Indian mobile number, for example 98480 21573.",
          },
        ]);
      draft.phone = e164;
      return next(
        'confirm',
        [
          {
            text: `Here's your request:\n${bookingSummary(draft)}\n\nShall I send it to the clinic?`,
          },
        ],
        ['Yes, send it', 'Change something', 'Cancel'],
      );
    }
    case 'confirm': {
      if (mentions(text, ['change', 'edit', 'wrong', 'modify']))
        return next(
          'treatment',
          [{ text: "No problem, let's go again. What would you like to come in for?" }],
          treatmentChoices(),
        );
      if (isYes(text) || mentions(text, ['send'])) {
        return {
          replies: [{ text: 'Sending your request to the clinic…' }],
          suggestions: [],
          context: { ...context, name: draft.name, flow: undefined },
          submit: {
            kind: 'appointment',
            name: draft.name!,
            phone: draft.phone!,
            treatment: draft.treatment || undefined,
            preferredDate: draft.date || undefined,
            preferredTime: draft.time || undefined,
          },
        };
      }
      return next(
        'confirm',
        [{ text: 'Shall I send this request? Tap "Yes, send it", or "Change something".' }],
        ['Yes, send it', 'Change something', 'Cancel'],
      );
    }
  }
}

function startCallback(context: ChatContext): Turn {
  if (context.name)
    return {
      replies: [
        {
          text: `Sure ${firstName(context.name)}. What's the best mobile number for the team to call you on?`,
        },
      ],
      suggestions: [],
      context: {
        ...context,
        flow: { kind: 'callback', step: 'phone', draft: { name: context.name } },
      },
    };
  return {
    replies: [{ text: 'Sure, the team will call you back. What is your name?' }],
    suggestions: [],
    context: { ...context, flow: { kind: 'callback', step: 'name', draft: {} } },
  };
}

function continueCallback(
  text: string,
  raw: string,
  flow: Extract<Flow, { kind: 'callback' }>,
  context: ChatContext,
): Turn {
  const draft = { ...flow.draft };
  const next = (
    step: typeof flow.step,
    replies: BotMessage[],
    suggestions: string[] = [],
  ): Turn => ({
    replies,
    suggestions,
    context: {
      ...context,
      name: draft.name ?? context.name,
      flow: { kind: 'callback', step, draft },
    },
  });
  if (flow.step === 'name') {
    const name = parseName(raw);
    if (!name) return next('name', [{ text: 'Could you type just your name, please?' }]);
    draft.name = name;
    return next('phone', [{ text: `Thanks ${firstName(name)}. Your 10-digit mobile number?` }]);
  }
  if (flow.step === 'phone') {
    const e164 = toIndianE164(raw);
    if (!e164)
      return next('phone', [
        { text: 'Please type a 10-digit Indian mobile number, for example 98480 21573.' },
      ]);
    draft.phone = e164;
    return next(
      'confirm',
      [
        {
          text: `The clinic will call ${draft.name} on ${e164} during opening hours. Send the request?`,
        },
      ],
      ['Yes, call me', 'Cancel'],
    );
  }
  if (isYes(text) || mentions(text, ['call me', 'send'])) {
    return {
      replies: [{ text: 'Sending your call-back request…' }],
      suggestions: [],
      context: { ...context, name: draft.name, flow: undefined },
      submit: { kind: 'callback', name: draft.name!, phone: draft.phone! },
    };
  }
  return next(
    'confirm',
    [{ text: 'Shall I send the call-back request?' }],
    ['Yes, call me', 'Cancel'],
  );
}

function startPain(context: ChatContext): Turn {
  return {
    replies: [
      {
        text: "I'm sorry you're in pain. A quick check first: do you have swelling in the face or jaw, a fever, or trouble swallowing or opening your mouth?",
      },
    ],
    suggestions: ['Yes, some of those', 'No, just the tooth'],
    context: { ...context, flow: { kind: 'pain', step: 'warning' } },
  };
}

function continuePain(
  text: string,
  flow: Extract<Flow, { kind: 'pain' }>,
  context: ChatContext,
): Turn {
  if (flow.step === 'warning') {
    if (isNo(text) || mentions(text, ['just the tooth', 'only tooth', 'only the tooth'])) {
      return {
        replies: [
          {
            text: "Thanks. Tooth pain usually needs an examination to find the cause, often decay, a cracked tooth or an infected nerve. The dentist can usually see you soon and explain your options.\n\nUntil then: rinse with warm salt water, avoid very hot, cold or sweet food on that side, and don't put tablets on the gum. (I can't give medical advice; your dentist will.)\n\nShall I book the earliest visit, or would you rather talk to the clinic?",
          },
        ],
        suggestions: ['Book the earliest visit', 'Call me back', 'Not now'],
        context: { ...context, topic: 'root-canal', flow: { kind: 'pain', step: 'next' } },
      };
    }
    return {
      replies: [
        {
          text: 'Swelling, fever or trouble swallowing can mean an infection that needs care today. Please call the clinic now. If breathing or swallowing is difficult, or the swelling is spreading quickly, go to the nearest hospital emergency or call 108.',
          actions: [call],
        },
      ],
      suggestions: ['Call me back', 'Timings and address'],
      context: { ...context, flow: undefined },
    };
  }
  if (mentions(text, ['book', 'earliest', 'visit', 'appointment'])) {
    // Straight to the day: the visit is a check-up for the pain.
    return {
      replies: [
        { text: 'Let\'s get you seen soon. Which day suits you? Type "cancel" any time to stop.' },
      ],
      suggestions: ['Today', 'Tomorrow', 'Any day'],
      context: {
        ...context,
        flow: { kind: 'book', step: 'day', draft: { treatment: '', name: context.name } },
      },
    };
  }
  if (mentions(text, ['call', 'talk', 'phone']))
    return startCallback({ ...context, flow: undefined });
  return {
    replies: [
      {
        text: 'Okay. I hope it settles soon. If the pain gets worse, please call the clinic.',
        actions: [call],
      },
    ],
    suggestions: startSuggestions,
    context: { ...context, flow: undefined },
  };
}

function startStraighten(context: ChatContext): Turn {
  return {
    replies: [
      {
        text: 'Both braces and clear aligners straighten teeth well. One question to point you the right way: would you prefer something nearly invisible that you can take out to eat, or are fixed braces fine?',
      },
    ],
    suggestions: ['Nearly invisible', 'Braces are fine', 'Not sure'],
    context: { ...context, flow: { kind: 'straighten', step: 'look' } },
  };
}

function continueStraighten(text: string, context: ChatContext): Turn {
  const slug = mentions(text, ['braces are fine', 'braces', 'fixed', 'metal', 'cheaper', 'ceramic'])
    ? 'braces'
    : mentions(text, [
          'invisible',
          'clear',
          'aligner',
          'aligners',
          'invisalign',
          'removable',
          'take out',
        ])
      ? 'aligners'
      : undefined;
  if (!slug) {
    const orthodontist = doctors.find((doctor) => doctor.specialty === 'Orthodontics')!;
    return {
      replies: [
        {
          text: `That's fine. ${oneLine(orthodontist.name)}, our orthodontist, will look at your teeth and bite and tell you which suits you. Aligners are nearly invisible and removable; braces suit complex cases and need no daily discipline. We're an Invisalign provider.`,
          actions: [
            { label: `Meet ${oneLine(orthodontist.name)}`, to: `/doctors/${orthodontist.slug}` },
          ],
        },
      ],
      suggestions: ['Compare aligners and braces', 'Book a consultation'],
      context: { ...context, topic: 'aligners', flow: undefined },
    };
  }
  const treatment = byslug(slug)!;
  return {
    replies: [
      {
        text:
          slug === 'aligners'
            ? 'Clear aligners sound like a good fit to explore. They are thin, custom trays you switch every week or two, nearly invisible and removable for eating and brushing. We are an official Invisalign provider.'
            : 'Braces are a reliable choice and suit even complex cases. You can choose metal or tooth-coloured ceramic brackets, adjusted every few weeks.',
        actions: [
          { label: `About ${treatment.name.toLowerCase()}`, to: `/treatments/${slug}` },
          { label: 'Book a consultation', to: bookingPath(slug) },
        ],
      },
    ],
    suggestions: treatmentFollowUps,
    context: { ...context, topic: slug, flow: undefined },
  };
}

function startMissing(context: ChatContext): Turn {
  return {
    replies: [{ text: 'I can help you see the options. How many teeth are missing?' }],
    suggestions: ['One tooth', 'A few teeth', 'Most or all teeth'],
    context: { ...context, flow: { kind: 'missing', step: 'how-many' } },
  };
}

function continueMissing(text: string, context: ChatContext): Turn {
  const prosthodontist = doctors.find((doctor) => doctor.specialty === 'Prosthodontics')!;
  const all = mentions(text, ['most', 'all', 'full', 'every', 'whole']);
  const few = mentions(text, ['few', 'two', 'three', 'several', 'some', 'many']);
  const text_ = all
    ? 'With most or all teeth missing, the main options are complete dentures (removable) or implant-supported teeth, which stay fixed. Full mouth rehabilitation plans everything together.'
    : few
      ? 'For a few missing teeth, the options are implants (fixed, each like a natural root), a bridge supported by the neighbouring teeth, or a partial denture you can take out.'
      : 'For one missing tooth, a dental implant is usually the closest to a natural tooth and keeps the neighbours untouched. A bridge is a fixed alternative, and a small partial denture is the simplest.';
  const slugs = all
    ? ['dentures', 'implants', 'full-mouth-rehabilitation']
    : ['implants', 'crowns-bridges', 'dentures'];
  return {
    replies: [
      {
        text: `${text_}\n\n${oneLine(prosthodontist.name)}, our prosthodontist, will check your bone and gums and recommend what suits you.`,
        actions: slugs.map((slug) => ({
          label: byslug(slug)!.shortName ?? byslug(slug)!.name,
          to: `/treatments/${slug}`,
        })),
      },
    ],
    suggestions: ['How long do implants take?', 'What does it cost?', 'Book a consultation'],
    context: { ...context, topic: 'implants', flow: undefined },
  };
}

// ---------------------------------------------------------------------------
// One turn

/** The assistant's reply to one message, given the conversation so far. */
export function respond(raw: string, context: ChatContext, env: Environment): Turn {
  const text = normalise(raw);
  const reply = (
    replies: BotMessage[],
    suggestions: string[] = startSuggestions,
    next: ChatContext = context,
  ): Turn => ({
    replies,
    suggestions,
    context: next,
  });

  if (!text) return reply([{ text: 'Ask me anything about treatments, timings or booking.' }]);

  // Leaving a flow.
  if (context.flow && mentions(text, CANCEL)) {
    return reply(
      [{ text: 'No problem, I have stopped that. What else can I help with?' }],
      startSuggestions,
      { ...context, flow: undefined },
    );
  }

  // Emergencies always come first, even mid-flow.
  if (
    mentions(text, [
      'emergency',
      'knocked out',
      'accident',
      'cant breathe',
      'cannot breathe',
      'difficulty breathing',
      'trouble breathing',
      'face swelling',
      'swollen face',
      'jaw swelling',
      'wont stop bleeding',
      'heavy bleeding',
      'broken jaw',
    ])
  ) {
    return reply(
      [
        {
          text: "I'm sorry, that sounds urgent. Please call the clinic now so a dentist can advise you. If there is trouble breathing or swallowing, heavy bleeding or a serious injury, go to the nearest hospital emergency or call 108.\n\nIf a tooth was knocked out: hold it by the crown (not the root), keep it in milk, and come in as quickly as you can.",
          actions: [call],
        },
      ],
      ['Timings and address', 'Call me back'],
      { ...context, flow: undefined },
    );
  }

  // A flow in progress takes the message.
  const flow = context.flow;
  if (flow?.kind === 'book') return continueBooking(text, raw, flow, context, env);
  if (flow?.kind === 'callback') return continueCallback(text, raw, flow, context);
  if (flow?.kind === 'pain') return continuePain(text, flow, context);
  if (flow?.kind === 'straighten') return continueStraighten(text, context);
  if (flow?.kind === 'missing') return continueMissing(text, context);

  const topic = byslug(context.topic);
  const mentioned = findTreatment(text);
  const subject = mentioned ?? topic;
  const name = firstName(context.name);

  // Small talk.
  if (mentions(text, ['thank', 'thanks', 'thx', 'thankyou', 'dhanyavad', 'shukriya'])) {
    return reply([
      { text: `You're welcome${name ? `, ${name}` : ''}! Anything else I can help with?` },
    ]);
  }
  if (mentions(text, ['bye', 'goodbye', 'see you', 'good night'])) {
    return reply(
      [{ text: `Take care${name ? `, ${name}` : ''}! We're here whenever you need us.` }],
      [],
    );
  }
  if (
    mentions(text, [
      'are you a bot',
      'are you human',
      'real person',
      'who are you',
      'are you real',
      'talk to a human',
      'talk to someone',
      'speak to someone',
      'human',
    ])
  ) {
    return reply(
      [
        {
          text: "I'm the clinic's website assistant, answering from this site. For anything personal or medical, the team is happy to talk: call, WhatsApp, or I can arrange a call back.",
          actions: [call, whatsapp],
        },
      ],
      ['Call me back', 'Book an appointment'],
    );
  }

  // Booking, call back and other actions.
  if (
    mentions(text, [
      'book',
      'booking',
      'appointment',
      'schedule',
      'reserve',
      'slot',
      'visit you',
      'come in',
      'book it',
      'consultation',
    ])
  ) {
    return startBooking(context, subject?.slug);
  }
  if (mentions(text, ['call me', 'call back', 'callback', 'ring me', 'phone me', 'contact me'])) {
    return startCallback(context);
  }

  // Symptoms and "help me choose".
  if (
    mentions(text, [
      'tooth pain',
      'toothache',
      'tooth ache',
      'teeth pain',
      'pain in my tooth',
      'hurts',
      'hurting',
      'aching',
      'sensitive',
      'sensitivity',
      'throbbing',
    ]) &&
    !mentions(text, ['does it hurt', 'will it hurt', 'is it painful'])
  ) {
    return startPain(context);
  }
  if (
    mentions(text, [
      'straighten',
      'straight teeth',
      'crooked',
      'crowded',
      'gap',
      'gaps',
      'spacing',
      'aligners or braces',
      'braces or aligners',
      'compare aligners and braces',
      'which is better',
    ])
  ) {
    return startStraighten(context);
  }
  if (
    mentions(text, [
      'missing tooth',
      'missing teeth',
      'lost a tooth',
      'lost my tooth',
      'replace a tooth',
      'replace my tooth',
      'gap where',
    ])
  ) {
    return startMissing(context);
  }

  // Practical information.
  if (
    mentions(text, [
      'timing',
      'timings',
      'hours',
      'open',
      'opening',
      'closed',
      'close',
      'sunday',
      'holiday',
      'when are you',
    ])
  ) {
    return reply([hoursReply(env)], ['Address and directions', 'Book an appointment']);
  }
  if (
    mentions(text, [
      'address',
      'location',
      'located',
      'where',
      'directions',
      'reach',
      'route',
      'map',
      'metro',
      'parking',
      'landmark',
    ])
  ) {
    return reply([addressReply()], ['Timings', 'Book an appointment']);
  }
  if (mentions(text, ['timings and address'])) {
    return reply([hoursReply(env), addressReply()], ['Book an appointment']);
  }
  if (mentions(text, ['phone', 'number', 'contact', 'whatsapp', 'email', 'mail'])) {
    return reply([contactReply()], ['Call me back', 'Book an appointment']);
  }

  // Questions about the current (or mentioned) treatment.
  if (subject) {
    const slug = subject.slug;
    const next = { ...context, topic: slug };
    if (
      mentions(text, [
        'cost',
        'price',
        'fee',
        'fees',
        'charge',
        'charges',
        'how much',
        'expensive',
        'afford',
        'emi',
        'rate',
        'budget',
      ])
    ) {
      return reply([costReply(subject)], ['Request a call back', 'Book a consultation'], next);
    }
    if (
      mentions(text, [
        'how long',
        'duration',
        'time does it take',
        'how many visits',
        'how many sittings',
        'sittings',
        'weeks',
        'months',
        'days',
      ])
    ) {
      const faq = faqAbout(slug, ['long', 'time', 'visits']);
      return reply(
        [faq ? { text: faq.answer } : steps(subject)],
        treatmentFollowUps.filter((s) => !s.startsWith('How long')),
        next,
      );
    }
    if (
      mentions(text, [
        'hurt',
        'painful',
        'pain',
        'anaesthesia',
        'anesthesia',
        'numb',
        'scared',
        'afraid',
        'nervous',
      ])
    ) {
      const faq = faqAbout(slug, ['hurt', 'pain', 'painful', 'comfortable']);
      return reply(
        [
          {
            text: faq
              ? faq.answer
              : 'Most treatments are done under local anaesthesia, so you feel pressure rather than pain, and the dentist checks you are comfortable throughout. Tell the team if you are nervous; they will take it slowly.',
          },
        ],
        treatmentFollowUps.filter((s) => s !== 'Does it hurt?'),
        next,
      );
    }
    if (
      mentions(text, [
        'steps',
        'process',
        'procedure',
        'how does it work',
        'how is it done',
        'what happens',
      ])
    ) {
      return reply([steps(subject)], treatmentFollowUps, next);
    }
    if (mentions(text, ['types', 'options', 'kinds', 'which type'])) {
      const options = treatmentDetails[slug]?.options;
      if (options?.length)
        return reply(
          [
            {
              text: `Options we offer:\n${options.map((option) => `• ${option.title}: ${option.body}`).join('\n')}`,
            },
          ],
          treatmentFollowUps,
          next,
        );
    }
    if (mentions(text, ['who', 'doctor', 'dentist', 'specialist'])) {
      const doctor = leadDoctor(subject);
      if (doctor)
        return reply(
          [
            {
              text: `${oneLine(doctor.name)} (${doctor.degree}) leads ${subject.name.toLowerCase()} at the clinic.`,
              actions: [{ label: `Meet ${oneLine(doctor.name)}`, to: `/doctors/${doctor.slug}` }],
            },
          ],
          treatmentFollowUps,
          next,
        );
    }
    const faq = findFaq(text, slug);
    if (faq && !mentioned) return reply([{ text: faq.answer }], treatmentFollowUps, next);
    if (mentioned) {
      if (slug === 'aligners' && mentions(text, ['invisalign']))
        return reply(
          [
            {
              text: 'Yes, we are an official Invisalign provider. Invisalign aligners are clear, removable trays that straighten teeth without brackets or wires, planned digitally so you can see the result first.',
              actions: [
                { label: 'Clear aligners', to: '/treatments/aligners' },
                { label: 'Book a free consultation', to: bookingPath('aligners') },
              ],
            },
          ],
          treatmentFollowUps,
          next,
        );
      return reply(aboutTreatment(mentioned), treatmentFollowUps, next);
    }
  }

  // General topics.
  // Travel first: "can I come for treatment from Dubai" is about travelling, not the list.
  if (
    mentions(text, [
      'abroad',
      'international',
      'travel',
      'tourism',
      'flight',
      'nri',
      'outside india',
      'another city',
      'visa',
      'hotel',
      'stay',
      'live in',
      'visiting from',
      'coming from',
      'fly in',
      'dubai',
      'gulf',
      'usa',
      'canada',
      'australia',
      'london',
    ])
  ) {
    return reply(
      [
        {
          text: 'Many patients travel to us. Send your photos and X-rays first and our specialists will plan your treatment and timeline before you book flights. Hotels and serviced apartments are close by in S R Nagar, Ameerpet and Begumpet.',
          actions: [{ label: 'Dental tourism guide', to: '/dental-tourism' }, whatsapp],
        },
      ],
      ['Book an appointment', 'Timings and address'],
    );
  }
  if (mentions(text, ['cost', 'price', 'fee', 'fees', 'charges', 'how much', 'emi', 'insurance'])) {
    if (mentions(text, ['insurance', 'claim', 'mediclaim']))
      return reply([
        {
          text: 'Whether your insurance covers dental treatment depends on your policy. The clinic can give you the bills and records you need for a claim; please ask the front desk which insurers they work with.',
          actions: [call],
        },
      ]);
    return reply([costReply()], ['Request a call back', 'Treatments']);
  }
  if (
    mentions(text, [
      'treatments',
      'services',
      'what do you do',
      'what do you offer',
      'what treatments',
    ])
  ) {
    return reply(
      [
        {
          text: `We offer ${treatments.length} treatments under one roof. The most asked about:\n${treatments
            .filter((treatment) => treatment.featured)
            .map((treatment) => `• ${treatment.name}: ${treatment.summary}`)
            .join('\n')}`,
          actions: [{ label: `All ${treatments.length} treatments`, to: '/treatments' }],
        },
      ],
      ['Implants', 'Clear aligners', 'Teeth whitening', 'Kids dentistry'],
    );
  }
  if (
    mentions(text, [
      'doctor',
      'doctors',
      'dentist',
      'dentists',
      'specialist',
      'team',
      'pradeep',
      'bindu',
      'qualification',
    ])
  ) {
    return reply([doctorsReply()], ['Book an appointment', 'Treatments']);
  }
  if (
    mentions(text, [
      'review',
      'reviews',
      'rating',
      'ratings',
      'google',
      'feedback',
      'testimonial',
      'good clinic',
      'trust',
    ])
  ) {
    return reply(
      [
        {
          text: `Patients rate us ${googleRating.score.toFixed(1)} out of 5 from ${googleRating.count} Google reviews. You can read them all on Google, or see before and after results on the site.`,
          actions: [
            { label: 'Read reviews on Google', href: clinic.googleReviewsUrl },
            { label: 'Smile results', to: '/results' },
          ],
        },
      ],
      ['Book an appointment', 'Treatments'],
    );
  }
  if (
    mentions(text, [
      'safe',
      'safety',
      'sterile',
      'sterilisation',
      'sterilization',
      'hygiene',
      'clean instruments',
    ])
  ) {
    return reply([
      {
        text: 'Every instrument is cleaned and sterilised between patients, and single-use items are used once. The patient safety page explains each step.',
        actions: [{ label: 'Patient safety', to: '/patient-safety' }],
      },
    ]);
  }
  if (mentions(text, ['results', 'before and after', 'before after', 'photos', 'gallery'])) {
    return reply([
      {
        text: 'You can see before and after results for every treatment, and photos of the clinic.',
        actions: [
          { label: 'Smile results', to: '/results' },
          { label: 'Gallery', to: '/gallery' },
        ],
      },
    ]);
  }

  // A treatment FAQ from anywhere on the site.
  const faq = findFaq(text);
  if (faq) {
    const treatment = byslug(faq.slug);
    return reply(
      [
        {
          text: faq.answer,
          actions: treatment
            ? [
                {
                  label: `More on ${treatment.shortName ?? treatment.name}`,
                  to: `/treatments/${treatment.slug}`,
                },
              ]
            : undefined,
        },
      ],
      treatmentFollowUps,
      { ...context, topic: faq.slug },
    );
  }

  // Greetings, then a gentle "didn't get that".
  if (
    mentions(text, [
      'hi',
      'hii',
      'hello',
      'hey',
      'hlo',
      'hai',
      'namaste',
      'namaskaram',
      'good morning',
      'good afternoon',
      'good evening',
    ])
  ) {
    return reply([
      {
        text: `Hello${name ? ` ${name}` : ''}! How can I help today? You can ask about a treatment, our timings, or book a visit right here in the chat.`,
      },
    ]);
  }
  if (isYes(text) && topic) return startBooking(context, topic.slug);

  return reply(
    [
      {
        text: "Sorry, I didn't quite get that. I can help with treatments and what to expect, timings and directions, booking a visit or arranging a call back. Or talk to the team directly.",
        actions: [call, whatsapp],
      },
    ],
    startSuggestions,
  );
}

/** The opening message. */
export function greeting(env: Environment, name?: string): Turn {
  const hour = env.now.getHours();
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const now = openNow(env);
  return {
    replies: [
      {
        text: `${part}${name ? ` ${firstName(name)}` : ''}! I'm the Quantum Digital Dentistry assistant. Ask me about any treatment, our timings and location, or book a visit right here.${now ? `\n\nThe clinic: ${now}` : ''}`,
      },
    ],
    suggestions: startSuggestions,
    context: { name },
  };
}
