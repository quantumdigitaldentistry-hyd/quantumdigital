import { CheckCircleIcon, DownloadSimpleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { LogoMark } from '@/components/brand/logo';
import type { DayHours } from '@/config/site';
import { festivalPacks, greetingFor } from '@/lib/festival-packs';
import { festiveThemes } from '@/lib/festive-themes';
import { useSiteSettings, type FestivalOffer } from '@/lib/site-settings';
import { cx } from '@/lib/cx';

import { useStaffDocument } from './document';
import { backend, errorMessage } from './session';
import { Notice, Panel, StaffPage, Toggle } from './ui';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function FestivalPicker() {
  const current = useSiteSettings((s) => s.festivalId);
  const currentOffer = useSiteSettings((s) => s.offer);
  const setFestival = useSiteSettings((s) => s.setFestival);
  const [selected, setSelected] = useState<string | null>(current);
  const [offer, setOffer] = useState<FestivalOffer>(
    () => currentOffer ?? { title: '', discount: '', details: '', validUntil: '', popup: true },
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const setField = <K extends keyof FestivalOffer>(key: K, value: FestivalOffer[K]) =>
    setOffer((o) => ({ ...o, [key]: value }));

  const hasOffer = !!(offer.title.trim() || offer.discount.trim());
  const pack = festivalPacks.find((item) => item.id === selected);

  const livePack = festivalPacks.find((item) => item.id === current);
  const [removing, setRemoving] = useState(false);

  /** Switches the website back to the everyday look (the offer goes with it). */
  const remove = async () => {
    if (!backend || !livePack) return;
    if (!window.confirm(`Remove the ${livePack.label} theme from the website?`)) return;
    setRemoving(true);
    setMessage(null);
    const { error } = await backend
      .from('site_settings')
      .update({ value: { theme: null, offer: null } })
      .eq('key', 'festival');
    setRemoving(false);
    if (error) return setMessage({ tone: 'error', text: errorMessage(error) });
    setFestival(null, null);
    setSelected(null);
    setMessage({
      tone: 'success',
      text: `${livePack.label} theme removed. Back to the everyday look.`,
    });
  };

  const save = async () => {
    if (!backend) return;
    setSaving(true);
    setMessage(null);
    const cleanOffer =
      selected && hasOffer
        ? {
            title: offer.title.trim(),
            discount: offer.discount.trim(),
            details: offer.details.trim(),
            validUntil: offer.validUntil,
            popup: offer.popup,
          }
        : null;
    const { error } = await backend
      .from('site_settings')
      .update({ value: { theme: selected, offer: cleanOffer } })
      .eq('key', 'festival');
    setSaving(false);
    if (error) return setMessage({ tone: 'error', text: errorMessage(error) });
    setFestival(selected, cleanOffer);
    setMessage({
      tone: 'success',
      text: selected
        ? `${pack?.label} is live on the website${cleanOffer ? ' with the offer' : ''}.`
        : 'Back to the everyday look.',
    });
  };

  const options = [
    { id: null as string | null, label: 'Everyday (no festival)', months: '' },
    ...festivalPacks,
  ];
  const input = 'min-h-11 rounded-control border border-line-strong bg-surface px-3 text-body';

  return (
    <Panel className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-heading font-semibold">Festival package</h2>
        <p className="text-small text-ink-muted">
          Lights the whole website in the festival’s colours with its deity or symbol, festive
          particles, the greeting banner, loader and browser icon. Add an offer to show it on the
          banner and in a welcome popup. It stays on until you remove it here.
        </p>
      </div>
      {livePack ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-success/40 bg-success-soft p-4 sm:flex-row sm:items-center">
          <img
            src={livePack.icon3d.small}
            alt=""
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-full object-cover"
          />
          <p className="flex-1 text-small">
            <span className="font-semibold text-success">Live now: {livePack.label}</span>
            <br />
            <span className="text-ink-muted">
              Every visitor sees this theme until it’s removed
              {currentOffer?.validUntil
                ? `. The offer hides itself after ${currentOffer.validUntil}; the theme stays.`
                : '.'}
            </span>
          </p>
          <Button
            variant="secondary"
            className="self-start sm:self-center"
            loading={removing}
            onClick={() => void remove()}
          >
            <XCircleIcon size={18} aria-hidden /> Remove festival theme
          </Button>
        </div>
      ) : (
        <p className="rounded-2xl bg-sunken p-3 text-small text-ink-muted">
          No festival theme is on. The website shows the everyday look.
        </p>
      )}
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const item = festivalPacks.find((p) => p.id === option.id);
          const chosen = selected === option.id;
          return (
            <li key={option.id ?? 'none'}>
              <button
                type="button"
                aria-pressed={chosen}
                onClick={() => setSelected(option.id)}
                className={cx(
                  'flex w-full items-center gap-3 rounded-3xl border p-3 text-left transition-colors',
                  chosen ? 'border-brand bg-brand-soft' : 'border-line hover:border-brand',
                )}
              >
                <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-sunken">
                  {item ? (
                    <img
                      src={item.icon3d.small}
                      alt=""
                      width={56}
                      height={56}
                      className="size-full object-cover"
                    />
                  ) : (
                    <LogoMark className="h-8 w-auto" />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-caption text-ink-muted">
                    {current === option.id ? 'Live now' : option.months}
                  </span>
                </span>
                {chosen ? (
                  <CheckCircleIcon size={22} weight="fill" className="text-brand" aria-hidden />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {pack ? (
        <div className="grid gap-5 border-t border-line pt-5 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-3">
            <h3 className="font-display font-semibold">Festival offer (optional)</h3>
            <label className="flex flex-col gap-1 text-label font-medium">
              Discount
              <input
                className={input}
                maxLength={20}
                placeholder="e.g. 20% off"
                value={offer.discount}
                onChange={(e) => setField('discount', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-label font-medium">
              Offer title
              <input
                className={input}
                maxLength={60}
                placeholder={`e.g. ${pack.label} smile offer`}
                value={offer.title}
                onChange={(e) => setField('title', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-label font-medium">
              Details
              <textarea
                className={cx(input, 'py-2')}
                rows={2}
                maxLength={200}
                placeholder="e.g. On teeth whitening and smile designing"
                value={offer.details}
                onChange={(e) => setField('details', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-label font-medium">
              Valid until
              <input
                type="date"
                className={cx(input, 'sm:max-w-60')}
                value={offer.validUntil}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setField('validUntil', e.target.value)}
              />
            </label>
            <Toggle
              label="Show a welcome popup with the offer"
              hint="Once per visit, a few seconds after the page opens."
              checked={offer.popup}
              onChange={(value) => setField('popup', value)}
            />
            <p className="text-caption text-ink-muted">
              Leave discount and title empty for a greeting without an offer.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-small font-medium">Preview</p>
            <div
              className="relative overflow-hidden rounded-3xl p-5 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${festiveThemes[pack.palette].light.festive}, ${festiveThemes[pack.palette].light.festiveEnd})`,
                color: festiveThemes[pack.palette].light.onFestive,
              }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={pack.icon3d.small}
                  alt=""
                  className="size-20 rounded-t-full rounded-b-2xl border-2 border-white/70 object-cover"
                />
                <div className="flex min-w-0 flex-col">
                  <span className="font-display text-heading font-bold">{greetingFor(pack)}</span>
                  <span className="text-small opacity-90">{pack.blessing}</span>
                </div>
              </div>
              {hasOffer ? (
                <div className="mt-4 rounded-2xl bg-white/15 p-3">
                  {offer.discount ? (
                    <p className="font-display text-title font-bold">{offer.discount}</p>
                  ) : null}
                  {offer.title ? <p className="font-semibold">{offer.title}</p> : null}
                  {offer.details ? <p className="text-small opacity-90">{offer.details}</p> : null}
                </div>
              ) : null}
            </div>
            <a
              href={pack.social}
              download={`quantum-${pack.id}.webp`}
              className="mt-2 inline-flex items-center gap-2 text-small font-semibold text-brand"
            >
              <DownloadSimpleIcon size={18} aria-hidden /> Download the social post
            </a>
          </div>
        </div>
      ) : null}

      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      <Button className="self-start" loading={saving} onClick={save}>
        {selected ? 'Publish festival' : 'Switch to everyday'}
      </Button>
    </Panel>
  );
}

type Row = { mode: 'unknown' | 'closed' | 'open'; open: string; close: string };
const toRow = (day: DayHours): Row =>
  day === 'closed'
    ? { mode: 'closed', open: '10:00', close: '20:00' }
    : day
      ? { mode: 'open', open: day.open, close: day.close }
      : { mode: 'unknown', open: '10:00', close: '20:00' };

function HoursEditor() {
  const hours = useSiteSettings((s) => s.hours);
  const setHours = useSiteSettings((s) => s.setHours);
  const [rows, setRows] = useState<Row[]>(() => hours.map(toRow));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const save = async () => {
    if (!backend) return;
    const value: DayHours[] = rows.map((row) =>
      row.mode === 'closed'
        ? 'closed'
        : row.mode === 'open'
          ? { open: row.open, close: row.close }
          : null,
    );
    if (rows.some((row) => row.mode === 'open' && row.close <= row.open)) {
      return setMessage({ tone: 'error', text: 'Closing time must be after opening time.' });
    }
    setSaving(true);
    const { error } = await backend
      .from('site_settings')
      .update({ value })
      .eq('key', 'clinic_hours');
    setSaving(false);
    if (error) return setMessage({ tone: 'error', text: errorMessage(error) });
    setHours(value);
    setMessage({ tone: 'success', text: 'Timings updated on the website.' });
  };

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-heading font-semibold">Opening hours</h2>
        <p className="text-small text-ink-muted">
          Shown on the Contact page and the home page, and used for free slots in the calendar.
        </p>
      </div>
      <ul className="flex flex-col divide-y divide-line">
        {rows.map((row, index) => (
          <li key={DAYS[index]} className="flex flex-wrap items-center gap-3 py-2.5">
            <span className="w-28 font-medium">{DAYS[index]}</span>
            <select
              aria-label={`${DAYS[index]} status`}
              value={row.mode}
              onChange={(e) => update(index, { mode: e.target.value as Row['mode'] })}
              className="min-h-10 rounded-control border border-line-strong bg-surface px-3 text-small"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="unknown">Not set (call to confirm)</option>
            </select>
            {row.mode === 'open' ? (
              <span className="flex items-center gap-2 text-small">
                <input
                  type="time"
                  aria-label={`${DAYS[index]} opens`}
                  value={row.open}
                  onChange={(e) => update(index, { open: e.target.value })}
                  className="min-h-10 rounded-control border border-line-strong bg-surface px-2"
                />
                to
                <input
                  type="time"
                  aria-label={`${DAYS[index]} closes`}
                  value={row.close}
                  onChange={(e) => update(index, { close: e.target.value })}
                  className="min-h-10 rounded-control border border-line-strong bg-surface px-2"
                />
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      <Button className="self-start" loading={saving} onClick={save}>
        Save hours
      </Button>
    </Panel>
  );
}

export default function FestivalPage() {
  useStaffDocument('Festival & hours');
  const loaded = useSiteSettings((s) => s.loaded);
  return (
    <StaffPage title="Festival & hours" description="What visitors see across the website.">
      {loaded ? (
        <>
          <FestivalPicker />
          <HoursEditor />
        </>
      ) : (
        <p className="text-small text-ink-muted">Loading…</p>
      )}
    </StaffPage>
  );
}
