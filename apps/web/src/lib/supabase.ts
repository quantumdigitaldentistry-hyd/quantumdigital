import { createSupabaseClient } from '@quantam/supabase';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** `null` until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set in apps/web/.env. */
export const supabase = url && anonKey ? createSupabaseClient(url, anonKey) : null;
