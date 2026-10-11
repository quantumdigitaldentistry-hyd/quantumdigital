import { toIndianE164 } from '@quantam/shared';
import {
  ChatTextIcon,
  ClockCountdownIcon,
  PaperPlaneTiltIcon,
  PhoneIcon,
  WhatsappLogoIcon,
} from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { buttonClass } from '@/components/ui/button-class';
import { Dialog } from '@/components/ui/dialog';
import { Field, SelectField, TextAreaField } from '@/components/ui/field';
import { treatments } from '@/content/clinic';
import { useClinicHours } from '@/lib/clinic-hours';

import {
  confirmationText,
  freeSlots,
  formatPhone,
  slotsText,
  smsLink,
  statusLabel,
  timeOfDayLabel,
  useMessages,
  whatsappLink,
  type Appointment,
  type AppointmentStatus,
} from './appointments-data';
import { backend, errorMessage, type TeamMember } from './session';
import { addMinutes, fmtTime, fromInputs, timeAgo, toDateInput, toTimeInput } from './time';
import { Notice } from './ui';

/** A new appointment pre-filled from a calendar slot, or an existing one to edit. */
export type EditorTarget =
  { mode: 'edit'; appointment: Appointment } | { mode: 'new'; start: Date; doctorId?: string };

const DURATIONS = [15, 30, 45, 60, 90, 120];
const STATUSES: AppointmentStatus[] = [
  'requested',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
];

type Form = {
  name: string;
  phone: string;
  treatment: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  notes: string;
};

function initialForm(target: EditorTarget, doctors: TeamMember[]): Form {
  if (target.mode === 'new') {
    return {
      name: '',
      phone: '',
      treatment: '',
      doctorId: target.doctorId ?? (doctors.length === 1 ? doctors[0]!.id : ''),
      date: toDateInput(target.start),
      time: toTimeInput(target.start),
      duration: 30,
      status: 'confirmed',
      notes: '',
    };
  }
  const a = target.appointment;
  const start = a.starts_at ? new Date(a.starts_at) : null;
  const end = a.ends_at ? new Date(a.ends_at) : null;
  const preferred = a.preferred_date ? new Date(`${a.preferred_date}T10:00`) : new Date();
  return {
    name: a.patient_name,
    phone: a.patient_phone.replace(/^\+91/, ''),
    treatment: a.treatment_slug ?? '',
    doctorId: a.doctor_id ?? (doctors.length === 1 ? doctors[0]!.id : ''),
    date: toDateInput(start ?? preferred),
    time: start ? toTimeInput(start) : '',
    duration: start && end ? Math.round((end.getTime() - start.getTime()) / 60_000) : 30,
    // Opening a request to allocate it: default to confirming.
    status: a.status === 'requested' ? 'confirmed' : a.status,
    notes: a.internal_notes ?? '',
  };
}

export function AppointmentEditor({
  target,
  doctors,
  onClose,
}: {
  target: EditorTarget | null;
  doctors: TeamMember[];
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      variant="drawer"
      className="w-[min(34rem,100vw)]!"
      title={target?.mode === 'new' ? 'New appointment' : 'Appointment'}
    >
      {target ? (
        <EditorBody
          key={target.mode === 'edit' ? target.appointment.id : target.start.toISOString()}
          target={target}
          doctors={doctors}
          onClose={onClose}
        />
      ) : null}
    </Dialog>
  );
}

function EditorBody({
  target,
  doctors,
  onClose,
}: {
  target: EditorTarget;
  doctors: TeamMember[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const hours = useClinicHours();
  const [form, setForm] = useState(() => initialForm(target, doctors));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<Appointment | null>(
    target.mode === 'edit' ? target.appointment : null,
  );
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const request = target.mode === 'edit' ? target.appointment : null;
  const doctor = doctors.find((item) => item.id === form.doctorId);

  // Confirmed bookings for the chosen doctor on the chosen day, to offer free slots.
  // Under the 'appointments' key, so live updates refresh it too.
  const dayQuery = useQuery({
    queryKey: ['appointments', 'day', form.doctorId, form.date],
    enabled: !!backend && !!form.doctorId && !!form.date,
    queryFn: async () => {
      const { data, error: loadError } = await backend!
        .from('appointments')
        .select('*')
        .eq('doctor_id', form.doctorId)
        .eq('status', 'confirmed')
        .gte('starts_at', fromInputs(form.date, '00:00').toISOString())
        .lte('starts_at', fromInputs(form.date, '23:59').toISOString());
      if (loadError) throw loadError;
      return data;
    },
  });
  const dayBookings = useMemo(
    () => (form.doctorId && form.date ? (dayQuery.data ?? []) : []),
    [dayQuery.data, form.doctorId, form.date],
  );

  const slots = useMemo(
    () =>
      form.date
        ? freeSlots({
            date: fromInputs(form.date, '00:00'),
            duration: form.duration,
            hours,
            booked: dayBookings.filter((item) => item.id !== request?.id),
          })
        : [],
    [form.date, form.duration, hours, dayBookings, request?.id],
  );

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!backend) return;
    setError('');
    const phone = toIndianE164(form.phone);
    if (form.name.trim().length < 2) return setError('Enter the patient’s name.');
    if (!phone) return setError('Enter a 10-digit mobile number.');
    const scheduled = !!form.time;
    if (form.status === 'confirmed' && (!form.doctorId || !scheduled)) {
      return setError('Choose a doctor and a time to confirm.');
    }
    const start = scheduled ? fromInputs(form.date, form.time) : null;
    const row = {
      patient_name: form.name.trim(),
      patient_phone: phone,
      treatment_slug: form.treatment || null,
      doctor_id: form.doctorId || null,
      starts_at: start?.toISOString() ?? null,
      ends_at: start ? addMinutes(start, form.duration).toISOString() : null,
      status: form.status,
      internal_notes: form.notes.trim() || null,
    };
    setSaving(true);
    const result =
      target.mode === 'edit'
        ? await backend
            .from('appointments')
            .update(row)
            .eq('id', target.appointment.id)
            .select()
            .single()
        : await backend
            .from('appointments')
            .insert({ ...row, source: 'staff' })
            .select()
            .single();
    setSaving(false);
    if (result.error) return setError(errorMessage(result.error));
    setSaved(result.data);
    void queryClient.invalidateQueries({ queryKey: ['appointments'] });
  };

  const remove = async () => {
    if (!backend || target.mode !== 'edit') return;
    if (!window.confirm('Delete this appointment? This cannot be undone.')) return;
    const { error: deleteError } = await backend
      .from('appointments')
      .delete()
      .eq('id', target.appointment.id);
    if (deleteError) return setError(errorMessage(deleteError));
    void queryClient.invalidateQueries({ queryKey: ['appointments'] });
    onClose();
  };

  return (
    <div className="flex flex-col gap-6">
      {request && request.source === 'website' ? (
        <div className="flex flex-col gap-1 rounded-3xl bg-sunken p-4 text-small">
          <p className="font-semibold">
            {request.kind === 'callback' ? 'Call-back request' : 'Website request'}{' '}
            <span className="font-normal text-ink-muted">· {timeAgo(request.created_at)}</span>
          </p>
          <p className="text-ink-muted">
            Prefers {request.preferred_date ?? 'any date'}
            {request.preferred_time
              ? `, ${timeOfDayLabel[request.preferred_time]?.toLowerCase()}`
              : ''}
          </p>
          {request.message ? <p>“{request.message}”</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={`tel:${request.patient_phone}`}
              className={buttonClass('secondary', 'min-h-9 px-3 text-small')}
            >
              <PhoneIcon size={16} aria-hidden /> Call {formatPhone(request.patient_phone)}
            </a>
          </div>
        </div>
      ) : null}

      <form onSubmit={save} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Patient name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
          <Field
            label="Mobile number"
            type="tel"
            prefix="+91"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
          <SelectField
            label="Treatment"
            placeholder="Not sure yet"
            options={treatments.map((item) => ({ value: item.slug, label: item.name }))}
            value={form.treatment}
            onChange={(e) => set('treatment', e.target.value)}
          />
          <SelectField
            label="Doctor"
            placeholder="Choose a doctor"
            options={doctors.map((item) => ({
              value: item.id,
              label: item.full_name || item.email,
            }))}
            value={form.doctorId}
            onChange={(e) => set('doctorId', e.target.value)}
          />
          <Field
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Time"
              type="time"
              step={900}
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
            />
            <SelectField
              label="Length"
              options={DURATIONS.map((value) => ({ value: String(value), label: `${value} min` }))}
              value={String(form.duration)}
              onChange={(e) => set('duration', Number(e.target.value))}
            />
          </div>
        </div>

        {form.doctorId && form.date ? (
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-small font-medium">
              <ClockCountdownIcon size={18} className="text-brand" aria-hidden />
              Free times {doctor ? `for ${doctor.full_name}` : ''}
            </p>
            {slots.length ? (
              <div className="flex flex-wrap gap-1.5">
                {slots.slice(0, 18).map((slot) => {
                  const value = toTimeInput(slot);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('time', value)}
                      className={
                        form.time === value
                          ? 'rounded-full border border-brand bg-brand px-3 py-1 text-small font-medium text-on-brand'
                          : 'rounded-full border border-line px-3 py-1 text-small hover:border-brand'
                      }
                    >
                      {fmtTime(slot)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-small text-ink-muted">No free times that day.</p>
            )}
          </div>
        ) : null}

        <SelectField
          label="Status"
          options={STATUSES.map((value) => ({ value, label: statusLabel[value] }))}
          value={form.status}
          onChange={(e) => set('status', e.target.value as AppointmentStatus)}
        />
        <TextAreaField
          label="Notes for the team (not sent to the patient)"
          maxLength={2000}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
        {error ? <Notice tone="error">{error}</Notice> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={saving}>
            {target.mode === 'new' && !saved ? 'Save appointment' : 'Save changes'}
          </Button>
          {target.mode === 'edit' ? (
            <Button variant="ghost" onClick={remove}>
              Delete
            </Button>
          ) : null}
        </div>
      </form>

      {saved ? (
        <MessagePanel
          // Fresh panel (and suggested text) whenever the appointment or free slots change.
          key={`${saved.id}-${saved.updated_at}-${form.date}-${form.duration}-${slots.length}`}
          appointment={saved}
          doctor={doctors.find((item) => item.id === saved.doctor_id)}
          slotsMessage={
            slots.length && form.date
              ? slotsText(saved, fromInputs(form.date, '00:00'), slots, doctor)
              : ''
          }
        />
      ) : null}
    </div>
  );
}

/** Tell the patient: automatic SMS (if set up), or WhatsApp / SMS from this phone. */
function MessagePanel({
  appointment,
  doctor,
  slotsMessage,
}: {
  appointment: Appointment;
  doctor: TeamMember | undefined;
  slotsMessage: string;
}) {
  const queryClient = useQueryClient();
  const messages = useMessages(appointment.id);
  const confirmed = appointment.status === 'confirmed' && !!appointment.starts_at;
  const [text, setText] = useState(() =>
    confirmed ? confirmationText(appointment, doctor) : slotsMessage,
  );
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const log = async (channel: 'whatsapp_device' | 'sms_device') => {
    if (!backend || !text.trim()) return;
    const { data } = await backend.auth.getUser();
    await backend.from('appointment_messages').insert({
      appointment_id: appointment.id,
      channel,
      to_phone: appointment.patient_phone,
      body: text.trim().slice(0, 1000),
      status: 'opened_on_device',
      sent_by: data.user?.id,
    });
    void queryClient.invalidateQueries({ queryKey: ['appointment-messages', appointment.id] });
  };

  const sendAutomatic = async () => {
    if (!backend) return;
    setSending(true);
    setStatus('');
    const { data, error } = await backend.functions.invoke<{ status?: string; error?: string }>(
      'send-message',
      {
        body: { appointmentId: appointment.id },
      },
    );
    setSending(false);
    if (error) return setStatus('The SMS could not be sent. Use WhatsApp or SMS from this phone.');
    if (data?.status === 'not_configured') {
      return setStatus(
        'Automatic SMS isn’t set up yet (needs MSG91 + DLT). Use WhatsApp or SMS below.',
      );
    }
    setStatus('Confirmation SMS sent.');
    void queryClient.invalidateQueries({ queryKey: ['appointment-messages', appointment.id] });
  };

  return (
    <section className="flex flex-col gap-3 border-t border-line pt-5">
      <h3 className="flex items-center gap-2 font-display font-semibold">
        <ChatTextIcon size={20} className="text-brand" aria-hidden />
        Message the patient
      </h3>
      {!confirmed && !slotsMessage ? (
        <p className="text-small text-ink-muted">
          Confirm a time to send the confirmation, or pick a doctor and day to offer free times.
        </p>
      ) : null}
      <TextAreaField
        label="Message"
        rows={5}
        maxLength={1000}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappLink(appointment.patient_phone, text)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => void log('whatsapp_device')}
          className={buttonClass('primary', 'min-h-10 px-4 text-small')}
        >
          <WhatsappLogoIcon size={18} aria-hidden /> WhatsApp
        </a>
        <a
          href={smsLink(appointment.patient_phone, text)}
          onClick={() => void log('sms_device')}
          className={buttonClass('secondary', 'min-h-10 px-4 text-small')}
        >
          <ChatTextIcon size={18} aria-hidden /> SMS from this phone
        </a>
        {confirmed ? (
          <Button
            variant="secondary"
            className="min-h-10 px-4 text-small"
            loading={sending}
            onClick={sendAutomatic}
          >
            <PaperPlaneTiltIcon size={18} aria-hidden /> Automatic confirmation SMS
          </Button>
        ) : null}
      </div>
      {status ? <Notice>{status}</Notice> : null}
      {messages.data?.length ? (
        <ul className="flex flex-col gap-2 text-small">
          {messages.data.map((message) => (
            <li key={message.id} className="rounded-2xl bg-sunken p-3">
              <p className="text-caption text-ink-muted">
                {message.channel === 'sms'
                  ? 'Automatic SMS'
                  : message.channel === 'whatsapp_device'
                    ? 'WhatsApp'
                    : 'SMS'}{' '}
                · {message.status === 'opened_on_device' ? 'opened on phone' : message.status} ·{' '}
                {timeAgo(message.created_at)}
              </p>
              <p className="line-clamp-3">{message.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
