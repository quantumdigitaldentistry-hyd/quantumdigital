import { MagnifyingGlassIcon, PhoneIcon, WhatsappLogoIcon, XIcon } from '@phosphor-icons/react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDeferredValue, useMemo, useState } from 'react';

import { buttonClass } from '@/components/ui/button-class';
import { treatments } from '@/content/clinic';
import { cx } from '@/lib/cx';

import { AppointmentEditor, type EditorTarget } from './appointment-editor';
import {
  statusClass,
  statusLabel,
  treatmentName,
  useDoctors,
  useLiveAppointments,
  whatsappLink,
  type Appointment,
  type AppointmentStatus,
} from './appointments-data';
import { useStaffDocument } from './document';
import { backend } from './session';
import { addDays, fmtDate, fmtTime, fromInputs } from './time';
import { Empty, Notice, Pill, StaffPage } from './ui';

type Filters = {
  search: string;
  treatment: string;
  from: string;
  to: string;
  status: AppointmentStatus | '';
};

const STATUSES: AppointmentStatus[] = [
  'requested',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
];

/**
 * Search appointments on the server. The search text is reduced to letters, digits and
 * spaces before it goes into the filter, so it can't change the query's structure.
 */
function usePatientSearch(filters: Filters) {
  return useQuery({
    queryKey: ['appointments', 'search', filters],
    enabled: !!backend,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      let query = backend!.from('appointments').select('*');
      const text = filters.search
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const digits = filters.search.replace(/\D/g, '');
      if (digits.length >= 3) {
        // Phone numbers are stored as +91XXXXXXXXXX; match any part of the number.
        query = query.ilike('patient_phone', `%${digits.slice(-10)}%`);
      } else if (text) {
        query = query.ilike('patient_name', `%${text}%`);
      }
      if (filters.treatment) query = query.eq('treatment_slug', filters.treatment);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.from || filters.to) {
        // Scheduled visits by their time; unscheduled requests by when they came in.
        const from = (
          filters.from ? fromInputs(filters.from, '00:00') : new Date(2000, 0, 1)
        ).toISOString();
        const to = (
          filters.to ? addDays(fromInputs(filters.to, '00:00'), 1) : new Date(2100, 0, 1)
        ).toISOString();
        query = query.or(
          `and(starts_at.gte.${from},starts_at.lt.${to}),and(starts_at.is.null,created_at.gte.${from},created_at.lt.${to})`,
        );
      }
      const { data, error } = await query.order('created_at', { ascending: false }).limit(300);
      if (error) throw error;
      return data;
    },
  });
}

type Patient = {
  phone: string;
  name: string;
  visits: Appointment[];
  last: Date | null;
  treatments: string[];
};

/** One card per patient (by mobile number), newest activity first. */
function groupByPatient(rows: Appointment[]): Patient[] {
  const byPhone = new Map<string, Patient>();
  for (const row of rows) {
    const patient =
      byPhone.get(row.patient_phone) ??
      ({
        phone: row.patient_phone,
        name: row.patient_name,
        visits: [],
        last: null,
        treatments: [],
      } as Patient);
    patient.visits.push(row);
    const when = new Date(row.starts_at ?? row.created_at);
    if (!patient.last || when > patient.last) patient.last = when;
    if (row.treatment_slug && !patient.treatments.includes(row.treatment_slug)) {
      patient.treatments.push(row.treatment_slug);
    }
    byPhone.set(row.patient_phone, patient);
  }
  return [...byPhone.values()].sort((a, b) => (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0));
}

function VisitRow({ visit, onOpen }: { visit: Appointment; onOpen: () => void }) {
  const when = visit.starts_at ? new Date(visit.starts_at) : null;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-sunken sm:grid-cols-[9rem_1fr_auto]"
      >
        <span className="text-small font-medium">
          {when
            ? `${fmtDate(when)}, ${fmtTime(when)}`
            : `Requested ${fmtDate(new Date(visit.created_at))}`}
        </span>
        <span className="hidden truncate text-small text-ink-muted sm:block">
          {treatmentName(visit.treatment_slug)}
          {visit.internal_notes ? ` · ${visit.internal_notes}` : ''}
        </span>
        <Pill className={statusClass[visit.status]}>{statusLabel[visit.status]}</Pill>
      </button>
    </li>
  );
}

export default function PatientsPage() {
  useStaffDocument('Patients');
  useLiveAppointments();
  const doctors = useDoctors();
  const [filters, setFilters] = useState<Filters>({
    search: '',
    treatment: '',
    from: '',
    to: '',
    status: '',
  });
  // Typing stays responsive; the search runs on the settled value.
  const deferred = useDeferredValue(filters);
  const results = usePatientSearch(deferred);
  const patients = useMemo(() => groupByPatient(results.data ?? []), [results.data]);
  const [editor, setEditor] = useState<EditorTarget | null>(null);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));
  const active = Object.values(filters).some(Boolean);

  const field = 'min-h-11 rounded-control border border-line-strong bg-surface px-3 text-small';

  return (
    <StaffPage
      title="Patients"
      description="Find anyone who has booked or been booked: search by name or mobile number, and narrow by treatment, date or status."
    >
      <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-4">
        <label className="relative flex items-center">
          <span className="sr-only">Search by name or mobile number</span>
          <MagnifyingGlassIcon
            size={20}
            className="pointer-events-none absolute left-3 text-ink-muted"
            aria-hidden
          />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Name or mobile number"
            autoComplete="off"
            className={cx(field, 'w-full pl-10 text-body')}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-caption font-medium">
            Treatment
            <select
              value={filters.treatment}
              onChange={(e) => set('treatment', e.target.value)}
              className={field}
            >
              <option value="">All treatments</option>
              {treatments.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-caption font-medium">
            From
            <input
              type="date"
              value={filters.from}
              onChange={(e) => set('from', e.target.value)}
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1 text-caption font-medium">
            To
            <input
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => set('to', e.target.value)}
              className={field}
            />
          </label>
          <label className="flex flex-col gap-1 text-caption font-medium">
            Status
            <select
              value={filters.status}
              onChange={(e) => set('status', e.target.value as AppointmentStatus | '')}
              className={field}
            >
              <option value="">Any status</option>
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {statusLabel[value]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-small text-ink-muted">
          <span aria-live="polite">
            {results.isFetching
              ? 'Searching…'
              : `${patients.length} patient${patients.length === 1 ? '' : 's'}, ${results.data?.length ?? 0} visit${results.data?.length === 1 ? '' : 's'}`}
          </span>
          {active ? (
            <button
              type="button"
              onClick={() =>
                setFilters({ search: '', treatment: '', from: '', to: '', status: '' })
              }
              className="inline-flex items-center gap-1 font-semibold text-brand"
            >
              <XIcon size={14} aria-hidden /> Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {results.isError ? <Notice tone="error">Search failed. Try again.</Notice> : null}

      {patients.length ? (
        <ul className="flex flex-col gap-3">
          {patients.map((patient) => (
            <li
              key={patient.phone}
              className="flex flex-col gap-2 rounded-3xl border border-line bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-display font-semibold">{patient.name}</span>
                  <span className="text-small text-ink-muted">
                    {patient.phone} · {patient.visits.length} visit
                    {patient.visits.length === 1 ? '' : 's'}
                    {patient.last ? ` · last ${fmtDate(patient.last)}` : ''}
                  </span>
                  {patient.treatments.length ? (
                    <span className="text-caption text-ink-muted">
                      {patient.treatments.map(treatmentName).join(', ')}
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${patient.phone}`}
                    className={buttonClass('secondary', 'min-h-9 px-3 text-small')}
                  >
                    <PhoneIcon size={16} aria-hidden /> Call
                  </a>
                  <a
                    href={whatsappLink(
                      patient.phone,
                      `Hello ${patient.name}, this is Quantum Digital Dentistry.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass('secondary', 'min-h-9 px-3 text-small')}
                  >
                    <WhatsappLogoIcon size={16} aria-hidden /> WhatsApp
                  </a>
                </div>
              </div>
              <ul className="flex flex-col border-t border-line pt-1">
                {patient.visits.map((visit) => (
                  <VisitRow
                    key={visit.id}
                    visit={visit}
                    onOpen={() => setEditor({ mode: 'edit', appointment: visit })}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : results.isPending ? null : (
        <Empty>
          {active
            ? 'No patients match these filters.'
            : 'No patients yet. Bookings from the website and the calendar appear here.'}
        </Empty>
      )}

      <AppointmentEditor
        target={editor}
        doctors={doctors.data ?? []}
        onClose={() => setEditor(null)}
      />
    </StaffPage>
  );
}
