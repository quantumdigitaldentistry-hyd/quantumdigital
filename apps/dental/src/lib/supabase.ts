import { createSupabaseClient } from '@quantam/supabase';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** `null` until EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY are set in apps/dental/.env. */
export const supabase = url && anonKey ? createSupabaseClient(url, anonKey) : null;
