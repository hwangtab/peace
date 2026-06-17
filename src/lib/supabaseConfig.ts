export interface SupabasePublicConfig {
  url: string;
  anonKey: string;
}

export const getSupabasePublicConfig = (): SupabasePublicConfig | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
};

export const requireSupabasePublicConfig = (): SupabasePublicConfig => {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error('Supabase public configuration is missing.');
  }
  return config;
};
