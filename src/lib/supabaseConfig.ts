export interface SupabasePublicConfig {
  url: string;
  anonKey: string;
}

const SUPABASE_CONFIG_ERROR = 'Supabase public configuration is missing.';

const isSupabasePublicConfigRequired = () =>
  process.env.VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_REQUIRE_SUPABASE === 'true';

export const getSupabasePublicConfig = (): SupabasePublicConfig | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) return { url, anonKey };
  if (isSupabasePublicConfigRequired()) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }
  if (url || anonKey) {
    throw new Error('Supabase public configuration is incomplete.');
  }
  return null;
};

export const requireSupabasePublicConfig = (): SupabasePublicConfig => {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }
  return config;
};
