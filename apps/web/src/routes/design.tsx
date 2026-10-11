import { APPOINTMENT_STATUSES, FESTIVAL_KEYS } from '@quantam/shared';
import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DotsLoader } from '@/components/ui/dots-loader';
import { OfferBanner } from '@/components/ui/offer-banner';
import { PageLoader } from '@/components/ui/page-loader';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { cx } from '@/lib/cx';
import { useFestival } from '@/lib/festival';
import { festiveThemes } from '@/lib/festive-themes';
import { appointmentStatusBadge } from '@/lib/status';
import { supabase } from '@/lib/supabase';

/** Living style guide: every token rendered with the real components, in the current theme. */

/** Each background with the only text colour allowed on it, so readability is visible. */
const backgrounds = [
  { name: 'canvas', className: 'bg-canvas text-ink', use: 'Page background' },
  { name: 'surface', className: 'bg-surface text-ink', use: 'Cards, rows' },
  { name: 'sunken', className: 'bg-sunken text-ink-muted', use: 'Inputs, skeletons' },
  { name: 'aqua-soft', className: 'bg-aqua-soft text-on-aqua-soft', use: 'Tinted sections' },
  { name: 'brand-soft', className: 'bg-brand-soft text-on-brand-soft', use: 'Selected rows' },
  {
    name: 'highlight-soft',
    className: 'bg-highlight-soft text-on-highlight-soft',
    use: 'Tips, notices',
  },
];

const brandColours = [
  { name: 'brand', className: 'bg-brand text-on-brand', use: 'Actions, links' },
  { name: 'aqua', className: 'bg-aqua text-on-aqua', use: 'Brand atmosphere' },
  { name: 'highlight', className: 'bg-highlight text-on-highlight', use: 'New, featured' },
  { name: 'danger', className: 'bg-danger text-on-danger', use: 'Destructive' },
];

const typeSamples = [
  {
    name: 'display → display-lg from md',
    className: 'font-display text-display font-bold md:text-display-lg',
    sample: 'Bright smiles',
  },
  { name: 'title', className: 'font-display text-title font-semibold', sample: 'Appointments' },
  {
    name: 'heading',
    className: 'font-display text-heading font-semibold',
    sample: 'Dr B Mohana Bindu',
  },
  {
    name: 'body',
    className: 'text-body',
    sample: 'Root canal, second sitting. Prefers WhatsApp reminders.',
  },
  { name: 'small', className: 'text-small', sample: 'Last visit 14 Aug, scaling and polishing' },
  { name: 'label', className: 'text-label font-medium', sample: 'Phone number' },
  { name: 'caption', className: 'text-caption', sample: 'Reminder sent 2 h before' },
  {
    name: 'data (mono)',
    className: 'font-mono text-small',
    sample: '10:30  +91 98480 21573  QD-00418',
  },
];

const sampleAppointments = [
  { time: '09:15', name: 'Ananya Reddy', treatment: 'Scaling and polishing', status: 'confirmed' },
  {
    time: '10:30',
    name: 'Mohammed Irfan',
    treatment: 'Root canal, sitting 2',
    status: 'scheduled',
  },
  { time: '11:45', name: 'Sravani Goud', treatment: 'Crown fitting', status: 'no_show' },
] as const;

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-heading font-semibold md:text-title">{title}</h2>
        {hint ? <p className="text-small text-ink-muted">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, className, use }: { name: string; className: string; use: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cx(
          'flex h-16 items-center rounded-control border border-line px-3 font-medium',
          className,
        )}
      >
        Aa Readable
      </div>
      <p className="text-label font-medium">{name}</p>
      <p className="text-caption text-ink-muted">{use}</p>
    </div>
  );
}

function FestivalPicker() {
  const { festival, setFestival } = useFestival();
  return (
    <div role="radiogroup" aria-label="Festival theme" className="flex flex-wrap gap-2">
      {FESTIVAL_KEYS.map((key) => {
        const selected = key === festival;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setFestival(key)}
            className={cx(
              'min-h-11 rounded-full border px-4 text-label font-medium transition-colors',
              selected
                ? 'border-brand bg-brand text-on-brand'
                : 'border-line-strong bg-surface text-ink hover:bg-sunken',
            )}
          >
            {festiveThemes[key].label}
          </button>
        );
      })}
    </div>
  );
}

type BackendStatus = { label: string; tone: BadgeTone; hint: string };

function useBackendStatus(): BackendStatus {
  const { status } = useQuery({
    queryKey: ['supabase-health'],
    enabled: supabase !== null,
    retry: false,
    queryFn: async () => {
      const { error } = await supabase!.auth.getSession();
      if (error) throw error;
      return true;
    },
  });
  if (!supabase)
    return {
      label: 'Not configured',
      tone: 'neutral',
      hint: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to apps/web/.env.',
    };
  if (status === 'pending')
    return { label: 'Checking', tone: 'brand', hint: 'Contacting Supabase.' };
  return status === 'success'
    ? { label: 'Connected', tone: 'success', hint: 'Supabase is reachable.' }
    : { label: 'Unreachable', tone: 'danger', hint: 'Check the Supabase URL and anon key.' };
}

export default function DesignPage() {
  const festival = festiveThemes[useFestival((s) => s.festival)];
  const [loading, setLoading] = useState(true);
  const backend = useBackendStatus();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-8 md:px-6 md:py-12">
      <header className="flex flex-col gap-4 rounded-container bg-linear-to-br from-hero-from to-hero-to p-5 text-on-hero md:flex-row md:items-end md:justify-between md:p-8">
        <div className="flex max-w-xl flex-col gap-2">
          <h1 className="font-display text-title font-bold md:text-display">Design system</h1>
          <p className="text-on-hero-muted">
            Clinic Sky: the aqua, blue and sunshine yellow from the clinic signage. Sora for
            headings, Instrument Sans for text, IBM Plex Mono for data.
          </p>
        </div>
        <ThemeSwitcher className="self-start md:self-auto" />
      </header>

      <Section title="Backgrounds" hint="Each background with the only text colour allowed on it.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {backgrounds.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </Section>

      <Section title="Brand colours" hint="Blue is for actions. Aqua and yellow set the mood.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {brandColours.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </Section>

      <Section
        title="Gradients"
        hint="Linear only, two close stops, one gradient band per view. Text passes on both stops."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1 rounded-container bg-linear-to-br from-hero-from to-hero-to p-5 text-on-hero">
            <p className="text-label tracking-[0.08em] text-on-hero-muted uppercase">Hero</p>
            <p className="font-display text-heading font-semibold">Good morning, Dr Pradeep</p>
            <p className="text-small text-on-hero-muted">
              8 appointments today, 2 need confirmation
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-container bg-linear-to-br from-festive to-festive-end p-5 text-on-festive">
            <p className="text-label tracking-[0.08em] uppercase">Festive</p>
            <p className="font-display text-heading font-semibold">Follows the festival below</p>
          </div>
        </div>
      </Section>

      <Section
        title="Festival themes"
        hint="Only offer banners, greetings and festive badges change colour. Everything else stays put."
      >
        <FestivalPicker />
        <OfferBanner
          greeting={festival.greeting}
          offer="20% off"
          title="Teeth cleaning and whitening"
          validity="Sample offer, valid 7 days"
          action={<Button variant="secondary">Book now</Button>}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Badge label={`${festival.label} offer`} tone="festive" />
          <Button variant="festive">Claim offer</Button>
        </div>
        <p className="text-caption text-ink-subtle">Inspiration: {festival.inspiration}</p>
      </Section>

      <Section title="Type">
        <Card className="flex flex-col gap-4">
          {typeSamples.map(({ name, className, sample }) => (
            <div key={name} className="flex flex-col gap-0.5">
              <p className="text-caption text-ink-subtle">{name}</p>
              <p className={className}>{sample}</p>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Buttons" hint="Pills, 44px tall, flat fills.">
        <div className="flex flex-wrap gap-3">
          <Button>Book appointment</Button>
          <Button variant="secondary">Reschedule</Button>
          <Button variant="ghost">Send reminder</Button>
          <Button variant="callback">Instant call back</Button>
          <Button variant="danger">Cancel visit</Button>
          <Button disabled>Unavailable</Button>
        </div>
      </Section>

      <Section
        title="Loaders"
        hint="Pages use the Fill loader from the brand kit. Buttons use Dots in the label colour, at the same width."
      >
        <div className="overflow-hidden rounded-container border border-line">
          <PageLoader label="Loading patients" delay={0} className="min-h-72" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button loading={loading}>Book appointment</Button>
          <Button variant="secondary" loading={loading}>
            Reschedule
          </Button>
          <Button variant="ghost" loading={loading}>
            Send reminder
          </Button>
          <Button variant="danger" loading={loading}>
            Cancel visit
          </Button>
          <Button variant="festive" loading={loading}>
            Claim offer
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => setLoading((on) => !on)}>
            {loading ? 'Stop loading' : 'Show loading'}
          </Button>
          <DotsLoader />
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          {APPOINTMENT_STATUSES.map((status) => (
            <Badge key={status} {...appointmentStatusBadge[status]} />
          ))}
          <Badge label="New" tone="highlight" />
        </div>
      </Section>

      <Section title="In context">
        <Card className="p-0 md:p-0">
          <ul>
            {sampleAppointments.map((appointment, index) => (
              <li
                key={appointment.time}
                className={cx(
                  'flex items-center gap-4 px-4 py-3',
                  index > 0 && 'border-t border-line',
                )}
              >
                <span className="w-12 font-mono text-small font-medium">{appointment.time}</span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-medium">{appointment.name}</span>
                  <span className="truncate text-small text-ink-muted">
                    {appointment.treatment}
                  </span>
                </div>
                <Badge {...appointmentStatusBadge[appointment.status]} />
              </li>
            ))}
          </ul>
        </Card>
        <p className="text-caption text-ink-subtle">Sample data for preview only.</p>
      </Section>

      <Section title="Backend">
        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-heading font-semibold">Supabase</p>
            <Badge label={backend.label} tone={backend.tone} />
          </div>
          <p className="text-small text-ink-muted">{backend.hint}</p>
        </Card>
      </Section>
    </div>
  );
}
