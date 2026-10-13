/**
 * The public site's door to Supabase. The client library (~55 kB gzipped) is fetched only
 * when something actually needs data, so it never delays the first paint. The staff area
 * imports lib/supabase directly; it loads in its own chunks anyway.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set. */
export const hasBackend = Boolean(url && anonKey);

let client: Promise<typeof import('@/lib/supabase').supabase> | null = null;

/** The Supabase client, loaded on first use (null without a backend). */
export function getSupabase() {
  client ??= import('@/lib/supabase').then((module) => module.supabase);
  return client;
}

/** How long a signed media link stays valid, in seconds. */
export const MEDIA_LINK_SECONDS = 60 * 60;
