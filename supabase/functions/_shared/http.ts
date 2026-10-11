// Shared helpers for the clinic's Edge Functions: CORS, JSON responses, clients and
// the "who is calling" check. Secrets come from the function environment only.

import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

/** Origins allowed to call the functions from a browser (comma-separated env). */
const allowedOrigins = (
  Deno.env.get('ALLOWED_ORIGINS') ?? 'http://localhost:5173,http://localhost:4321'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0]!,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

export function json(request: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
  });
}

/** Handles the CORS preflight and rejects anything that isn't a POST. */
export function preflight(request: Request): Response | null {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) });
  if (request.method !== 'POST') return json(request, 405, { error: 'Method not allowed' });
  return null;
}

/** Service-role client: bypasses RLS. Use only after checking the caller. */
export function adminClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type TeamRole = 'super_admin' | 'doctor' | 'staff';
export type Caller = { id: string; email: string; role: TeamRole; fullName: string };

/** The signed-in, active team member making this request, or null. */
export async function teamCaller(request: Request, admin: SupabaseClient): Promise<Caller | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: member } = await admin
    .from('team_members')
    .select('id, email, role, full_name, active')
    .eq('id', data.user.id)
    .maybeSingle();
  if (!member || !member.active) return null;
  return { id: member.id, email: member.email, role: member.role, fullName: member.full_name };
}

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

/** Salted SHA-256, so rate-limit keys never store an IP or email in the clear. */
export async function saltedHash(value: string) {
  const salt = Deno.env.get('RATE_LIMIT_SALT') ?? 'quantum-local-salt';
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${salt}:${value}`),
  );
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export const clientIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
