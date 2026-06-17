import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from './supabaseConfig';

// 설문 응답 저장 전용 Supabase 클라이언트 (KOSMART 프로젝트).
// publishable(anon) 키 + RLS(INSERT 전용) 조합이라 키가 클라이언트에 노출돼도 안전하다.
// 설문 페이지에서만 사용하며, 환경변수가 없으면 null 을 반환해 제출 시점에 안내 처리한다.
const publicConfig = getSupabasePublicConfig();

export const supabase: SupabaseClient | null = publicConfig
  ? createClient(publicConfig.url, publicConfig.anonKey, {
      // 익명 설문이므로 세션 저장/갱신 비활성화 — localStorage 를 건드리지 않는다.
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
