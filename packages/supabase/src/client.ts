import { createClient, type SupabaseClient as BaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

export type SupabaseClient = BaseClient<Database>;

/**
 * Browser client. Sessions persist in localStorage (supabase-js default) and OAuth or
 * magic-link redirects are picked up from the URL.
 */
export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}
