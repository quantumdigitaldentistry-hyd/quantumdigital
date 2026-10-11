import {
  CaretLeftIcon,
  CaretRightIcon,
  PhoneIcon,
  PlusIcon,
  WhatsappLogoIcon,
} from '@phosphor-icons/react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { buttonClass } from '@/components/ui/button-class';
import { useClinicHours } from '@/lib/clinic-hours';
import { cx } from '@/lib/cx';

import { AppointmentEditor, type EditorTarget } from './appointment-editor';
import {
  dayWindow,
  statusClass,
  statusLabel,
  timeOfDayLabel,
  treatmentName,
  useDoctors,
  useLiveAppointments,
  useRequests,
  useSchedule,
  whatsappLink,
  type Appointment,
} from './appointments-data';
import { useStaffDocument } from './document';
import type { TeamMember } from './session';
import {
  addDays,
  addMinutes,
  fmtDate,
  fmtTime,
  sameDay,
  startOfDay,
  startOfWeek,
  timeAgo,
} from './time';
import { Empty, Notice, Pill, StaffPage } from './ui';

const SLOT_MINUTES = 30;
const ROW_PX = 28; // height of a 30-minute row

function RequestCard({ appointment, onOpen }: { appointment: Appointment; onOpen: () => void }) {
  return (
    <li className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-display font-semibold">{appointment.patient_name}</span>
          <Pill
            className={
              appointment.kind === 'callback'
                ? 'bg-aqua-soft text-on-aqua-soft'
                : statusClass.requested
            }
          >
            {appointment.kind === 'callback' ? 'Call back' : 'Appointment'}
          </Pill>
          <span className="text-caption text-ink-muted">{timeAgo(appointment.created_at)}</span>
        </p>
        <p className="text-small text-ink-muted">
          {treatmentName(appointment.treatment_slug)}
          {appointment.preferred_date ? ` · prefers ${appointment.preferred_date}` : ''}
          {appointment.preferred_time
            ? `, ${timeOfDayLabel[appointment.preferred_time]?.toLowerCase()}`
            : ''}
        </p>
        {appointment.message ? (
          <p className="line-clamp-2 text-small">“{appointment.message}”</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <a
          href={`tel:${appointment.patient_phone}`}
          className={buttonClass('secondary', 'min-h-10 px-3 text-small')}
        >
          <PhoneIcon size={16} aria-hidden /> Call
        </a>
        <a
          href={whatsappLink(
            appointment.patient_phone,
            `Hello ${appointment.patient_name}, this is Quantum Digital Dentistry about your request.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass('secondary', 'min-h-10 px-3 text-small')}
        >
          <WhatsappLogoIcon size={16} aria-hidden /> WhatsApp
        </a>
        <Button className="min-h-10 px-4 text-small" onClick={onOpen}>
          Allocate
        </Button>
      </div>
    </li>
  );
}

/** Week (desktop) or day (phone) grid. Appointments are coloured by doctor. */
function Calendar({
  doctors,
  onOpen,
  onNew,
}: {
  doctors: TeamMember[];
  onOpen: (appointment: Appointment) => void;
  onNew: (start: Date, doctorId?: string) => void;
}) {
  const hours = useClinicHours();
  const [compact] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [anchor, setAnchor] = useState(() =>
    compact ? startOfDay(new Date()) : startOfWeek(new Date()),
  );
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const days = compact ? 1 : 7;
  const schedule = useSchedule(anchor, days);

  const dates = Array.from({ length: days }, (_, i) => addDays(anchor, i));
  // Visible hours: the widest opening window of the shown days.
  const windows = dates.map((date) => dayWindow(hours, date)).filter(Boolean) as {
    open: number;
    close: number;
  }[];
  const open = Math.min(...windows.map((w) => w.open), 9 * 60);
  const close = Math.max(...windows.map((w) => w.close), 18 * 60);
  const rows = Math.ceil((close - open) / SLOT_MINUTES);

  const colourOf = (id: string | null) => doctors.find((d) => d.id === id)?.colour ?? '#64748b';
  const items = (schedule.data ?? []).filter(
    (item) =>
      item.status !== 'cancelled' && (doctorFilter === 'all' || item.doctor_id === doctorFilter),
  );
  const today = new Date();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setAnchor(addDays(anchor, -days))}
            className="grid size-10 place-items-center rounded-full border border-line hover:border-brand"
          >
            <CaretLeftIcon size={18} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setAnchor(compact ? startOfDay(new Date()) : startOfWeek(new Date()))}
            className="min-h-10 rounded-full border border-line px-4 text-small font-medium hover:border-brand"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => setAnchor(addDays(anchor, days))}
            className="grid size-10 place-items-center rounded-full border border-line hover:border-brand"
          >
            <CaretRightIcon size={18} aria-hidden />
          </button>
          <p className="ml-2 font-display font-semibold">
            {compact ? fmtDate(anchor) : `${fmtDate(anchor)} – ${fmtDate(addDays(anchor, 6))}`}
          </p>
        </div>
        <div role="radiogroup" aria-label="Doctor" className="flex flex-wrap gap-1.5">
          {[{ id: 'all', full_name: 'All doctors', colour: '' }, ...doctors].map((doctor) => (
            <button
              key={doctor.id}
              type="button"
              role="radio"
              aria-checked={doctorFilter === doctor.id}
              onClick={() => setDoctorFilter(doctor.id)}
              className={cx(
                'flex min-h-9 items-center gap-2 rounded-full border px-3 text-small',
                doctorFilter === doctor.id
                  ? 'border-brand bg-brand-soft text-on-brand-soft'
                  : 'border-line hover:border-brand',
              )}
            >
              {doctor.colour ? (
                <span className="size-2.5 rounded-full" style={{ background: doctor.colour }} />
              ) : null}
              {doctor.full_name}
            </button>
          ))}
        </div>
      </div>

      {schedule.isError ? <Notice tone="error">Could not load the calendar.</Notice> : null}

      <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
        <div
          className="grid min-w-[44rem] md:min-w-0"
          style={{ gridTemplateColumns: `3.5rem repeat(${days}, minmax(0, 1fr))` }}
        >
          {/* Header row */}
          <div className="border-b border-line" />
          {dates.map((date) => (
            <div
              key={date.toISOString()}
              className={cx(
                'border-b border-l border-line px-2 py-2 text-center text-small font-semibold',
                sameDay(date, today) && 'bg-brand-soft text-on-brand-soft',
              )}
            >
              {fmtDate(date)}
            </div>
          ))}
          {/* Time column */}
          <div className="relative" style={{ height: rows * ROW_PX }}>
            {Array.from({ length: rows }, (_, i) =>
              i % 2 === 0 ? (
                <span
                  key={i}
                  className="absolute right-2 -translate-y-1/2 text-caption text-ink-muted"
                  style={{ top: i * ROW_PX }}
                >
                  {fmtTime(addMinutes(startOfDay(anchor), open + i * SLOT_MINUTES))}
                </span>
              ) : null,
            )}
          </div>
          {/* Day columns */}
          {dates.map((date) => {
            const window = dayWindow(hours, date);
            return (
              <div
                key={date.toISOString()}
                className="relative border-l border-line"
                style={{ height: rows * ROW_PX }}
              >
                {Array.from({ length: rows }, (_, i) => {
                  const start = addMinutes(startOfDay(date), open + i * SLOT_MINUTES);
                  const minute = open + i * SLOT_MINUTES;
                  const closed = !window || minute < window.open || minute >= window.close;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`New appointment ${fmtDate(start)} ${fmtTime(start)}`}
                      onClick={() =>
                        onNew(start, doctorFilter === 'all' ? undefined : doctorFilter)
                      }
                      className={cx(
                        'absolute inset-x-0 border-t border-line/60 transition-colors hover:bg-brand-soft/60',
                        closed && 'bg-sunken/70',
                      )}
                      style={{ top: i * ROW_PX, height: ROW_PX }}
                    />
                  );
                })}
                {items
                  .filter((item) => item.starts_at && sameDay(new Date(item.starts_at), date))
                  .map((item) => {
                    const start = new Date(item.starts_at!);
                    const end = item.ends_at ? new Date(item.ends_at) : addMinutes(start, 30);
                    const top =
                      ((start.getHours() * 60 + start.getMinutes() - open) / SLOT_MINUTES) * ROW_PX;
                    const height = Math.max(
                      ROW_PX - 2,
                      ((end.getTime() - start.getTime()) / 60000 / SLOT_MINUTES) * ROW_PX - 2,
                    );
                    const colour = colourOf(item.doctor_id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onOpen(item)}
                        className="absolute inset-x-1 z-10 overflow-hidden rounded-xl border-l-4 bg-surface px-2 py-1 text-left text-caption shadow-md shadow-elevation/10 hover:shadow-lg"
                        style={{
                          top: top + 1,
                          height,
                          borderLeftColor: colour,
                          background: `color-mix(in oklab, ${colour} 14%, var(--color-surface))`,
                        }}
                      >
                        <span className="block truncate font-semibold">{item.patient_name}</span>
                        <span className="block truncate text-ink-muted">
                          {fmtTime(start)} · {treatmentName(item.treatment_slug)}
                        </span>
                        {item.status !== 'confirmed' ? (
                          <span className="block truncate font-medium">
                            {statusLabel[item.status]}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-caption text-ink-muted">
        Shaded times are outside opening hours. Tap an empty slot to book it; changes appear
        instantly for everyone.
      </p>
    </div>
  );
}

export default function AppointmentsPage() {
  useStaffDocument('Appointments');
  useLiveAppointments();
  const doctors = useDoctors();
  const requests = useRequests();
  const [tab, setTab] = useState<'requests' | 'calendar'>('requests');
  const [editor, setEditor] = useState<EditorTarget | null>(null);
  const doctorList = useMemo(() => doctors.data ?? [], [doctors.data]);
  const count = requests.data?.length ?? 0;

  return (
    <StaffPage
      title="Appointments"
      description="Website requests arrive here. Allocate a doctor and time to confirm them; the calendar is shared by doctors and staff and updates live."
      actions={
        <Button
          onClick={() =>
            setEditor({ mode: 'new', start: addMinutes(startOfDay(new Date()), 10 * 60) })
          }
        >
          <PlusIcon size={18} aria-hidden /> New appointment
        </Button>
      }
    >
      {doctors.data && doctors.data.length === 0 ? (
        <Notice>
          No doctors on the team yet. Add doctors in Team so appointments can be allocated.
        </Notice>
      ) : null}
      <div role="tablist" aria-label="View" className="flex gap-2">
        {(
          [
            ['requests', `New requests${count ? ` (${count})` : ''}`],
            ['calendar', 'Calendar'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cx(
              'min-h-10 rounded-full px-4 text-small font-semibold',
              tab === value ? 'bg-brand text-on-brand' : 'border border-line hover:border-brand',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'requests' ? (
        requests.isPending ? (
          <p className="text-small text-ink-muted">Loading…</p>
        ) : requests.isError ? (
          <Notice tone="error">Could not load requests.</Notice>
        ) : count ? (
          <ul className="flex flex-col gap-3">
            {requests.data!.map((item) => (
              <RequestCard
                key={item.id}
                appointment={item}
                onOpen={() => setEditor({ mode: 'edit', appointment: item })}
              />
            ))}
          </ul>
        ) : (
          <Empty>No new requests. Website bookings and call-back requests will appear here.</Empty>
        )
      ) : (
        <Calendar
          doctors={doctorList}
          onOpen={(appointment) => setEditor({ mode: 'edit', appointment })}
          onNew={(start, doctorId) => setEditor({ mode: 'new', start, doctorId })}
        />
      )}

      <AppointmentEditor target={editor} doctors={doctorList} onClose={() => setEditor(null)} />
    </StaffPage>
  );
}
