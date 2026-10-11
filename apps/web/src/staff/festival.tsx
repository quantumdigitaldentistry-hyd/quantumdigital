import { CheckCircleIcon, DownloadSimpleIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { LogoMark } from '@/components/brand/logo';
import type { DayHours } from '@/config/site';
import { festivalPacks } from '@/lib/festival-packs';
import { useSiteSettings } from '@/lib/site-settings';
import { cx } from '@/lib/cx';

import { useStaffDocument } from './document';
import { backend, errorMessage } from './session';
import { Notice, Panel, StaffPage } from './ui';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function FestivalPicker() {
  const current = useSiteSettings((s) => s.festivalId);
  const setFestivalId = useSiteSettings((s) => s.setFestivalId);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const choose = async (id: string | null) => {
    if (!backend) return;
    setSaving(id ?? 'none');
    setMessage(null);
    const { error } = await backend
      .from('site_settings')
      .update({ value: { theme: id } })
      .eq('key', 'festival');
    setSaving(null);
    if (error) return setMessage({ tone: 'error', text: errorMessage(error) });
    setFestivalId(id);
    const label = festivalPacks.find((pack) => pack.id === id)?.label;
    setMessage({
      tone: 'success',
      text: id ? `${label} is live on the website.` : 'Back to the everyday look.',
    });
  };

  const options = [
    { id: null as string | null, label: 'Everyday (no festival)', months: '' },
    ...festivalPacks,
  ];

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-heading font-semibold">Festival package</h2>
        <p className="text-small text-ink-muted">
          Switches the website’s festive colours, header logo, greeting banner, page loader and
          browser icon at once.
        </p>
      </div>
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const pack = festivalPacks.find((item) => item.id === option.id);
          const active = current === option.id;
          return (
            <li key={option.id ?? 'none'}>
              <button
                type="button"
                aria-pressed={active}
                disabled={saving !== null}
                onClick={() => void choose(option.id)}
                className={cx(
                  'flex w-full items-center gap-3 rounded-3xl border p-3 text-left transition-colors',
                  active ? 'border-brand bg-brand-soft' : 'border-line hover:border-brand',
                )}
              >
                <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sunken">
                  {pack ? (
                    <img
                      src={pack.logo.small}
                      alt=""
                      width={56}
                      height={56}
                      className="size-full object-contain"
                    />
                  ) : (
                    <LogoMark className="h-8 w-auto" />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{option.label}</span>
                  {option.months ? (
                    <span className="text-caption text-ink-muted">{option.months}</span>
                  ) : null}
                </span>
                {active ? (
                  <CheckCircleIcon
                    size={22}
                    weight="fill"
                    className="text-brand"
                    aria-label="Live"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {current ? (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <p className="text-small font-medium">Live greeting banner and social post</p>
          {(() => {
            const pack = festivalPacks.find((item) => item.id === current);
            if (!pack) return null;
            return (
              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                <img src={pack.banner.webp} alt="" className="w-full rounded-2xl md:w-2/3" />
                <div className="flex flex-col gap-2 md:w-1/3">
                  <img src={pack.social} alt="" className="w-40 rounded-2xl" />
                  <a
                    href={pack.social}
                    download={`quantum-${pack.id}.webp`}
                    className="inline-flex items-center gap-2 text-small font-semibold text-brand"
                  >
                    <DownloadSimpleIcon size={18} aria-hidden /> Download social post
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}
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
