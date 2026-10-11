import { APPOINTMENT_STATUSES, FESTIVAL_KEYS } from '@quantam/shared';
import {
  Badge,
  Button,
  Card,
  DotsLoader,
  festiveThemes,
  HeroBand,
  OfferBanner,
  Screen,
  Text,
  type TextTone,
  type TextVariant,
} from '@quantam/ui';
import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

import { PageLoader } from '@/components/page-loader';
import { useFestival } from '@/theme/festival';
import { appointmentStatusBadge } from '@/theme/status';

/** Living style guide: every token rendered with the real components, in the current theme. */

/** Each background with the text colour that belongs on it, so readability is visible. */
const backgrounds: { name: string; className: string; tone: TextTone; use: string }[] = [
  { name: 'canvas', className: 'bg-canvas', tone: 'default', use: 'App background' },
  { name: 'surface', className: 'bg-surface', tone: 'default', use: 'Cards, rows' },
  { name: 'sunken', className: 'bg-sunken', tone: 'muted', use: 'Inputs, skeletons' },
  { name: 'aqua-soft', className: 'bg-aqua-soft', tone: 'on-aqua-soft', use: 'Tinted sections' },
  { name: 'brand-soft', className: 'bg-brand-soft', tone: 'on-brand-soft', use: 'Selected rows' },
  {
    name: 'highlight-soft',
    className: 'bg-highlight-soft',
    tone: 'on-highlight-soft',
    use: 'Tips, notices',
  },
];

const brandColours: { name: string; className: string; tone: TextTone; use: string }[] = [
  { name: 'brand', className: 'bg-brand', tone: 'on-brand', use: 'Actions, links' },
  { name: 'aqua', className: 'bg-aqua', tone: 'default', use: 'Brand atmosphere' },
  { name: 'highlight', className: 'bg-highlight', tone: 'on-highlight', use: 'New, featured' },
  { name: 'danger', className: 'bg-danger', tone: 'on-danger', use: 'Destructive' },
];

const typeSamples: { variant: TextVariant; sample: string }[] = [
  { variant: 'display', sample: 'Bright smiles' },
  { variant: 'title', sample: 'Appointments' },
  { variant: 'heading', sample: 'Dr. Mohana Bindu' },
  { variant: 'body', sample: 'Root canal, second sitting. Patient prefers WhatsApp reminders.' },
  { variant: 'small', sample: 'Last visit 14 Aug, scaling and polishing' },
  { variant: 'label', sample: 'Phone number' },
  { variant: 'caption', sample: 'Reminder sent 2 h before' },
  { variant: 'data', sample: '10:30  +91 98480 21573  QD-00418' },
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

const themeOptions = ['system', 'light', 'dark'] as const;

function ThemeSwitcher() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const active = hasAdaptiveThemes ? 'system' : theme;
  return (
    <View className="flex-row rounded-control border border-line bg-sunken p-1">
      {themeOptions.map((option) => {
        const selected = option === active;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => Uniwind.setTheme(option)}
            className={`min-h-9 flex-1 items-center justify-center rounded-[9px] ${
              selected ? 'bg-surface' : ''
            }`}
          >
            <Text variant="label" tone={selected ? 'default' : 'muted'} className="capitalize">
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Swatch({ name, className, tone, use }: (typeof backgrounds)[number]) {
  return (
    <View className="w-[47%] min-w-36 grow gap-1.5">
      <View className={`h-16 justify-center rounded-control border border-line px-3 ${className}`}>
        <Text variant="body-strong" tone={tone}>
          Aa Readable
        </Text>
      </View>
      <Text variant="label">{name}</Text>
      <Text variant="caption" tone="muted">
        {use}
      </Text>
    </View>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text variant="heading">{title}</Text>
        {hint ? (
          <Text variant="small" tone="muted">
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function FestivalPicker() {
  const { festival, setFestival } = useFestival();
  return (
    <View className="flex-row flex-wrap gap-2">
      {FESTIVAL_KEYS.map((key) => {
        const selected = key === festival;
        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => setFestival(key)}
            className={`min-h-11 justify-center rounded-full border px-4 ${
              selected ? 'border-brand bg-brand' : 'border-line-strong bg-surface active:bg-sunken'
            }`}
          >
            <Text variant="label" tone={selected ? 'on-brand' : 'default'}>
              {festiveThemes[key].label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function DesignScreen() {
  const festival = festiveThemes[useFestival((s) => s.festival)];

  return (
    <Screen className="gap-8">
      <View className="gap-3 pt-2">
        <Link href="/" asChild>
          <Button title="Back" variant="ghost" className="self-start px-0" />
        </Link>
        <HeroBand>
          <Text variant="title" tone="on-hero">
            Design system
          </Text>
          <Text tone="on-hero-muted">
            Clinic Sky: the aqua, blue and sunshine yellow from the clinic signage. Sora for
            headings, Instrument Sans for text, IBM Plex Mono for data.
          </Text>
        </HeroBand>
        <ThemeSwitcher />
      </View>

      <Section
        title="Backgrounds"
        hint="Each background is shown with the only text colour allowed on it."
      >
        <View className="flex-row flex-wrap gap-3">
          {backgrounds.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </View>
      </Section>

      <Section title="Brand colours" hint="Blue is for actions. Aqua and yellow set the mood.">
        <View className="flex-row flex-wrap gap-3">
          {brandColours.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </View>
      </Section>

      <Section
        title="Gradients"
        hint="Linear only, two close stops, one gradient per screen. Text must pass on both stops."
      >
        <HeroBand>
          <Text variant="label" tone="on-hero-muted" className="uppercase tracking-[1px]">
            Hero
          </Text>
          <Text variant="heading" tone="on-hero">
            Good morning, Dr. Pradeep
          </Text>
          <Text variant="small" tone="on-hero-muted">
            8 appointments today, 2 need confirmation
          </Text>
        </HeroBand>
        <View className="gap-2 rounded-container bg-linear-to-br from-festive to-festive-end p-5">
          <Text variant="label" tone="on-festive" className="uppercase tracking-[1px]">
            Festive
          </Text>
          <Text variant="heading" tone="on-festive">
            Follows the festival below
          </Text>
        </View>
      </Section>

      <Section
        title="Festival themes"
        hint="Only offer banners, greetings and festive badges change colour. Clinical screens stay the same."
      >
        <FestivalPicker />
        <OfferBanner
          greeting={festival.greeting}
          offer="20% off"
          title="Teeth cleaning and whitening"
          validity="Sample offer, valid 7 days"
          onPress={() => {}}
        />
        <View className="flex-row flex-wrap items-center gap-2">
          <Badge label={`${festival.label} offer`} tone="festive" />
          <Button title="Claim offer" variant="festive" />
        </View>
        <Text variant="caption" tone="subtle">
          Inspiration: {festival.inspiration}
        </Text>
      </Section>

      <Section title="Type">
        <Card className="gap-4">
          {typeSamples.map(({ variant, sample }) => (
            <View key={variant} className="gap-0.5">
              <Text variant="caption" tone="subtle">
                {variant}
              </Text>
              <Text variant={variant}>{sample}</Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Buttons">
        <View className="flex-row flex-wrap gap-3">
          <Button title="Book appointment" />
          <Button title="Reschedule" variant="secondary" />
          <Button title="Send reminder" variant="ghost" />
          <Button title="Cancel visit" variant="danger" />
          <Button title="Unavailable" disabled />
        </View>
      </Section>

      <Section
        title="Loaders"
        hint="Page loader: fill.gif from the brand kit. Buttons: dots, in the label colour, same width as the label."
      >
        <View className="h-72 overflow-hidden rounded-container border border-line">
          <PageLoader label="Loading patients" />
        </View>
        <View className="flex-row flex-wrap gap-3">
          <Button title="Book appointment" loading />
          <Button title="Reschedule" variant="secondary" loading />
          <Button title="Send reminder" variant="ghost" loading />
          <Button title="Cancel visit" variant="danger" loading />
          <Button title="Claim offer" variant="festive" loading />
        </View>
        <DotsLoader />
      </Section>

      <Section title="Badges">
        <View className="flex-row flex-wrap gap-2">
          {APPOINTMENT_STATUSES.map((status) => (
            <Badge key={status} {...appointmentStatusBadge[status]} />
          ))}
          <Badge label="New" tone="highlight" />
        </View>
      </Section>

      <Section title="In context">
        <Card className="gap-0 p-0">
          {sampleAppointments.map((appointment, index) => (
            <View
              key={appointment.time}
              className={`flex-row items-center gap-4 px-4 py-3 ${index > 0 ? 'border-t border-line' : ''}`}
            >
              <Text variant="data-strong" className="w-12">
                {appointment.time}
              </Text>
              <View className="flex-1 gap-0.5">
                <Text variant="body-strong" numberOfLines={1}>
                  {appointment.name}
                </Text>
                <Text variant="small" tone="muted" numberOfLines={1}>
                  {appointment.treatment}
                </Text>
              </View>
              <Badge {...appointmentStatusBadge[appointment.status]} />
            </View>
          ))}
        </Card>
        <Text variant="caption" tone="subtle">
          Sample data for preview only.
        </Text>
      </Section>
    </Screen>
  );
}
