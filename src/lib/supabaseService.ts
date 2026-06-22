import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireSupabasePublicConfig } from './supabaseConfig';

/**
 * Service-role Supabase 클라이언트 (서버 전용, RLS 우회).
 * webhook처럼 admin 세션이 없는 신뢰된 서버 경로에서만 사용한다.
 * SUPABASE_SERVICE_ROLE_KEY는 서버 환경변수로만 존재해야 하며 절대 클라이언트에 노출 금지.
 */
export const createSupabaseServiceClient = (): SupabaseClient => {
  const { url } = requireSupabasePublicConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};
