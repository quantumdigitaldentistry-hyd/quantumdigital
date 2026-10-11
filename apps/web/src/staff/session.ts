import type { Database, Session } from '@quantam/supabase';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type TeamRole = Database['public']['Enums']['team_role'];

/** The staff area needs the backend; without it every screen explains that instead. */
export const backend = supabase;

/** Current auth session, kept in sync with sign-in, sign-out and token refresh. */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(backend ? undefined : null);
  useEffect(() => {
    if (!backend) return;
    void backend.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = backend.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);
  return session; // undefined while loading
}

/** The signed-in person's team record; null if they are not (or no longer) on the team. */
export function useMe(session: Session | null | undefined) {
  return useQuery({
    queryKey: ['me', session?.user.id],
    enabled: !!backend && !!session,
    queryFn: async () => {
      const { data, error } = await backend!
        .from('team_members')
        .select('*')
        .eq('id', session!.user.id)
        .maybeSingle();
      if (error) throw error;
      return data && data.active ? data : null;
    },
  });
}

export const canManageTeam = (role: TeamRole | undefined) =>
  role === 'super_admin' || role === 'doctor';

export const roleLabel: Record<TeamRole, string> = {
  super_admin: 'Clinic admin',
  doctor: 'Doctor',
  staff: 'Staff',
};

/** Readable message from a Supabase / Postgres error. */
export function errorMessage(error: unknown, fallback = 'Something went wrong.') {
  if (!error) return fallback;
  const e = error as { message?: string; code?: string };
  if (e.code === '23P01') return 'That doctor already has a confirmed appointment at that time.';
  if (e.code === '23505') return 'That already exists. Try a different name or slug.';
  if (e.code === '42501') return 'You do not have permission to do that.';
  return e.message || fallback;
}
