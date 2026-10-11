import type { Database } from '@quantam/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { clinic, type DayHours } from '@/config/site';
import { treatments } from '@/content/clinic';

import { backend, type TeamMember } from './session';
import { addDays, addMinutes, fmtLongDate, fmtTime, minutesOf, startOfDay } from './time';

export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
export type AppointmentMessage = Database['public']['Tables']['appointment_messages']['Row'];

export const statusLabel: Record<AppointmentStatus, string> = {
  requested: 'New request',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No show',
};

export const statusClass: Record<AppointmentStatus, string> = {
  requested: 'bg-highlight text-on-highlight',
  confirmed: 'bg-brand-soft text-on-brand-soft',
  completed: 'bg-success-soft text-success',
  cancelled: 'bg-sunken text-ink-muted line-through',
  no_show: 'bg-danger-soft text-danger',
};

export const treatmentName = (slug: string | null) =>
  slug ? (treatments.find((item) => item.slug === slug)?.name ?? slug) : 'Not sure yet';

export const timeOfDayLabel: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

/** Doctors on the team (active), for allocation and the calendar. The clinic account (super
 * admin) is a doctor too, so it can be booked and has its own calendar column. */
export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    enabled: !!backend,
    queryFn: async () => {
      const { data, error } = await backend!
        .from('team_members')
        .select('*')
        .in('role', ['doctor', 'super_admin'])
        .eq('active', true)
        .order('full_name');
      if (error) throw error;
      return data as TeamMember[];
    },
  });
}

/** Requests waiting for a time (website bookings and call-backs). */
export function useRequests() {
  return useQuery({
    queryKey: ['appointments', 'requests'],
    enabled: !!backend,
    queryFn: async () => {
      const { data, error } = await backend!
        .from('appointments')
        .select('*')
        .eq('status', 'requested')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
}

/** Scheduled appointments between two dates (any status with a time). */
export function useSchedule(from: Date, days: number) {
  const to = addDays(from, days);
  return useQuery({
    queryKey: ['appointments', 'schedule', from.toISOString(), days],
    enabled: !!backend,
    queryFn: async () => {
      const { data, error } = await backend!
        .from('appointments')
        .select('*')
        .gte('starts_at', from.toISOString())
        .lt('starts_at', to.toISOString())
        .order('starts_at');
      if (error) throw error;
      return data;
    },
  });
}

export function useMessages(appointmentId: string | null) {
  return useQuery({
    queryKey: ['appointment-messages', appointmentId],
    enabled: !!backend && !!appointmentId,
    queryFn: async () => {
      const { data, error } = await backend!
        .from('appointment_messages')
        .select('*')
        .eq('appointment_id', appointmentId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Live updates: any change to appointments (from a doctor, staff or the website) refreshes
 * every open calendar and list. Doctor and staff views stay in step both ways.
 */
export function useLiveAppointments() {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!backend) return;
    const channel = backend
      .channel('appointments-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      })
      .subscribe();
    return () => {
      void backend!.removeChannel(channel);
    };
  }, [queryClient]);
}

/** Opening window for a day: saved hours, else 9 am – 9 pm. null if closed. */
export function dayWindow(hours: DayHours[], date: Date): { open: number; close: number } | null {
  const day = hours[date.getDay()];
  if (day === 'closed') return null;
  if (day) return { open: minutesOf(day.open), close: minutesOf(day.close) };
  return { open: 9 * 60, close: 21 * 60 };
}

/** Free start times for a doctor on a day, given confirmed bookings and the duration. */
export function freeSlots({
  date,
  duration,
  hours,
  booked,
  step = 30,
}: {
  date: Date;
  duration: number;
  hours: DayHours[];
  booked: { starts_at: string | null; ends_at: string | null }[];
  step?: number;
}) {
  const window = dayWindow(hours, date);
  if (!window) return [];
  const base = startOfDay(date);
  const now = Date.now();
  const busy = booked
    .filter((item) => item.starts_at && item.ends_at)
    .map(
      (item) => [new Date(item.starts_at!).getTime(), new Date(item.ends_at!).getTime()] as const,
    );
  const slots: Date[] = [];
  for (let minute = window.open; minute + duration <= window.close; minute += step) {
    const start = addMinutes(base, minute);
    const end = addMinutes(start, duration);
    if (start.getTime() < now) continue;
    if (busy.some(([s, e]) => start.getTime() < e && end.getTime() > s)) continue;
    slots.push(start);
  }
  return slots;
}

// ---- Messages to patients ------------------------------------------------------------

export function confirmationText(appointment: Appointment, doctor: TeamMember | undefined) {
  if (!appointment.starts_at) return '';
  const start = new Date(appointment.starts_at);
  return `Hello ${appointment.patient_name}, your appointment at ${clinic.name} is confirmed for ${fmtLongDate(start)} at ${fmtTime(start)}${
    doctor ? ` with ${doctor.full_name}` : ''
  }. Address: ${clinic.address.lines.join(', ')}. To change it, call ${clinic.phone.display}.`;
}

export function slotsText(
  appointment: Appointment,
  date: Date,
  slots: Date[],
  doctor?: TeamMember,
) {
  const list = slots.slice(0, 8).map(fmtTime).join(', ');
  return `Hello ${appointment.patient_name}, thank you for contacting ${clinic.name}. ${
    doctor ? `${doctor.full_name} is` : 'We are'
  } available on ${fmtLongDate(date)} at: ${list}. Reply with the time that suits you, or call ${clinic.phone.display}.`;
}

const digits = (phone: string) => phone.replace(/\D/g, '');

export const whatsappLink = (phone: string, text: string) =>
  `https://wa.me/${digits(phone)}?text=${encodeURIComponent(text)}`;

export const smsLink = (phone: string, text: string) =>
  `sms:${phone}?body=${encodeURIComponent(text)}`;
