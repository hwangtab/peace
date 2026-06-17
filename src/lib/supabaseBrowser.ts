import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireSupabasePublicConfig } from './supabaseConfig';

let browserClient: SupabaseClient | null = null;

export const createSupabaseBrowserClient = (): SupabaseClient => {
  if (browserClient) return browserClient;

  const { url, anonKey } = requireSupabasePublicConfig();
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
};
