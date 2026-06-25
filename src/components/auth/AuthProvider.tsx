import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from '@/lib/supabaseConfig';
import type { MemberProfile } from '@/types/member';
import type { AdminRole } from '@/types/cms';

interface AuthContextValue {
  user: User | null;
  profile: MemberProfile | null;
  loading: boolean;
  /** admin_members에 등록된 관리자면 권한 등급, 아니면 null. 관리자 진입 버튼 노출용. */
  adminRole: AdminRole | null;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Supabase 브라우저 클라이언트(@supabase/supabase-js, realtime-js 포함 ~수백KB)를
// 초기 번들에서 분리한다. AuthProvider는 전체 공개 페이지를 감싸지만 인증 로직은
// 마운트 후(클라이언트)에만 필요하므로, 클라이언트 생성을 동적 import로 지연하여
// LCP를 막는 메인 청크에서 Supabase 코드를 빼낸다. SSR/children 렌더에는 영향 없음.
async function loadBrowserClient() {
  const { createSupabaseBrowserClient } = await import('@/lib/supabaseBrowser');
  return createSupabaseBrowserClient();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isSupabaseConfigured = getSupabasePublicConfig() !== null;
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const loadSeqRef = useRef(0);
  const adminSeqRef = useRef(0);

  // 로그인 사용자가 관리자(admin_members)인지 서버에 한 번 물어본다.
  // 비로그인/비관리자면 null. UI 노출 판단용일 뿐, 접근 통제는 서버가 한다.
  const loadAdminRole = useCallback(async (nextUser: User | null) => {
    const seq = ++adminSeqRef.current;
    if (!nextUser) {
      if (seq === adminSeqRef.current) setAdminRole(null);
      return;
    }
    try {
      const response = await fetch('/api/admin/whoami');
      if (!response.ok) {
        if (seq === adminSeqRef.current) setAdminRole(null);
        return;
      }
      const data = (await response.json()) as { isAdmin?: boolean; role?: AdminRole };
      if (seq !== adminSeqRef.current) return;
      setAdminRole(data.isAdmin && data.role ? data.role : null);
    } catch {
      if (seq === adminSeqRef.current) setAdminRole(null);
    }
  }, []);

  const loadProfile = useCallback(async (nextUser: User | null) => {
    const seq = ++loadSeqRef.current;
    if (!nextUser) {
      if (seq !== loadSeqRef.current) return;
      setProfile(null);
      return;
    }
    try {
      const supabase = await loadBrowserClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, nickname, created_at, updated_at')
        .eq('id', nextUser.id)
        .maybeSingle();
      if (seq !== loadSeqRef.current) return;
      setProfile((data as MemberProfile) ?? null);
    } catch {
      if (seq !== loadSeqRef.current) return;
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    let subscription: { unsubscribe: () => void } | null = null;

    // Supabase 클라이언트를 동적 import로 지연 로드한다(초기 번들 분리).
    void (async () => {
      let supabase;
      try {
        supabase = await loadBrowserClient();
      } catch {
        if (active) setLoading(false);
        return;
      }
      if (!active) return;

      void supabase.auth.getSession().then(async ({ data }) => {
        if (!active) return;
        const nextUser = data.session?.user ?? null;
        setUser(nextUser);
        // adminRole까지 확정한 뒤 loading을 끝낸다. void로 두면 loading=false 순간
        // isAdmin이 잠깐 false로 노출돼 관리자 진입 카드·플로팅 버튼이 깜빡인다.
        await Promise.all([loadProfile(nextUser), loadAdminRole(nextUser)]);
        if (active) setLoading(false);
      });

      const { data: sub } = supabase.auth.onAuthStateChange(
        (_event: string, session: Session | null) => {
          if (!active) return;
          const nextUser = session?.user ?? null;
          setUser(nextUser);
          void loadProfile(nextUser);
          void loadAdminRole(nextUser);
        }
      );
      subscription = sub.subscription;
      // import 대기 중 언마운트된 경우 즉시 구독 해제(클린업이 이미 실행됨).
      if (!active) subscription.unsubscribe();
    })();

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [isSupabaseConfigured, loadProfile, loadAdminRole]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user);
  }, [loadProfile, user]);

  const signOut = useCallback(async () => {
    try {
      const supabase = await loadBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // ignore — clear local state regardless below
    } finally {
      setUser(null);
      setProfile(null);
      setAdminRole(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      adminRole,
      isAdmin: adminRole !== null,
      refreshProfile,
      signOut,
    }),
    [user, profile, loading, adminRole, refreshProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Null-safe variant — returns the context value or null when used outside AuthProvider.
 *  Use this in components (e.g. Navigation) that may render in test environments
 *  without a provider. Never throws. */
export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}
