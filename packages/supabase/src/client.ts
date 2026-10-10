import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient as BaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import type { Database } from './database.types';

export type SupabaseClient = BaseClient<Database>;

const isWeb = Platform.OS === 'web';
// Web static export pre-renders pages in Node, where `window` does not exist.
const isServer = isWeb && typeof window === 'undefined';

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return createClient<Database>(url, anonKey, {
    auth: {
      storage: isWeb ? (isServer ? undefined : window.localStorage) : AsyncStorage,
      autoRefreshToken: !isServer,
      persistSession: !isServer,
      // OAuth/magic-link redirects only land in the URL on web.
      detectSessionInUrl: isWeb && !isServer,
    },
  });
}
