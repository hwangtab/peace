import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './supabaseConfig';

let publicClient: SupabaseClient | null | undefined;

export const getSupabasePublicClient = (): SupabaseClient | null => {
  if (publicClient !== undefined) return publicClient;

  const config = getSupabasePublicConfig();
  publicClient = config
    ? createClient(config.url, config.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  return publicClient;
};
