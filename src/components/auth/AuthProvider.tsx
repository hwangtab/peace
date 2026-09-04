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
import Router from 'next/router';
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

// 익명 방문자 번들 절감: @supabase/ssr 클라이언트(gotrue + realtime-js, ~59KB gzip)를
// 로그인 흔적이 있는 방문자에게만 내려받는다. createBrowserClient는 세션을
// 쿠키(sb-<projectRef>-auth-token, 길면 .0/.1 로 분할)에 저장하므로,
// document.cookie 문자열 검사만으로 SDK를 건드리지 않고 세션 유무를 판별할 수 있다.
// /gallery·/press·/videos 같은 공개 페이지 독자는 이 게이트에서 걸러져 SDK를 받지 않는다.
function getAuthCookiePrefix(): string | null {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  try {
    const ref = new URL(config.url).hostname.split('.')[0];
    return ref ? `sb-${ref}-auth-token` : null;
  } catch {
    return null;
  }
}

function hasAuthCookie(prefix: string | null): boolean {
  if (!prefix) return false;
  if (typeof document === 'undefined') return false;
  return document.cookie.includes(prefix);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isSupabaseConfigured = getSupabasePublicConfig() !== null;
  const authCookiePrefix = useMemo(() => getAuthCookiePrefix(), []);
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

  // getSession() 과 onAuthStateChange 는 로드 직후 같은 사용자로 연달아 발화한다
  // (INITIAL_SESSION·SIGNED_IN·TOKEN_REFRESHED). 그때마다 profiles 조회와
  // /api/admin/whoami 를 다시 부르면 로그인 사용자는 페이지당 3회씩 호출한다
  // (프로덕션 실측). 마지막으로 동기화한 사용자 id 를 기억해 같은 사용자면 건너뛴다.
  // 로그아웃(null)·계정 전환은 id 가 달라지므로 정상적으로 다시 로드된다.
  const syncedUserIdRef = useRef<string | null | undefined>(undefined);
  const syncUser = useCallback(
    async (nextUser: User | null) => {
      const nextId = nextUser?.id ?? null;
      if (syncedUserIdRef.current === nextId) return;
      syncedUserIdRef.current = nextId;
      await Promise.all([loadProfile(nextUser), loadAdminRole(nextUser)]);
    },
    [loadProfile, loadAdminRole]
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    let started = false;
    let subscription: { unsubscribe: () => void } | null = null;

    // Supabase 클라이언트를 동적 import로 지연 로드한다(초기 번들 분리).
    // 쿠키가 확인된 뒤에만 딱 한 번 실행된다(중복 구독 방지).
    const start = () => {
      if (started || !active) return;
      started = true;
      setLoading(true);

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
          await syncUser(nextUser);
          if (active) setLoading(false);
        });

        const { data: sub } = supabase.auth.onAuthStateChange(
          (_event: string, session: Session | null) => {
            if (!active) return;
            const nextUser = session?.user ?? null;
            setUser(nextUser);
            void syncUser(nextUser);
          }
        );
        subscription = sub.subscription;
        // import 대기 중 언마운트된 경우 즉시 구독 해제(클린업이 이미 실행됨).
        if (!active) subscription.unsubscribe();
      })();
    };

    if (hasAuthCookie(authCookiePrefix)) {
      start();
      return () => {
        active = false;
        subscription?.unsubscribe();
      };
    }

    // 쿠키가 없으면 SDK를 받지 않고 익명 상태로 끝낸다.
    // (effect 본문에서 동기 setState 하면 cascading render 경고 — 마이크로태스크로 미룬다.)
    queueMicrotask(() => {
      if (active && !started) setLoading(false);
    });

    // 다만 로그인/가입은 이 게이트가 지나간 뒤에 쿠키를 만든다. 하드 리로드 없이도
    // 프로바이더가 살아나도록 라우트 전환·탭 복귀 시점에 같은 문자열 검사를 다시 한다.
    const recheck = () => {
      if (started || !active) return;
      if (hasAuthCookie(authCookiePrefix)) start();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') recheck();
    };

    // useRouter() 대신 싱글턴 Router — 라우트 전환마다 effect가 재실행되지 않는다.
    const routerEvents = Router.events;
    routerEvents?.on('routeChangeComplete', recheck);
    window.addEventListener('focus', recheck);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      subscription?.unsubscribe();
      routerEvents?.off('routeChangeComplete', recheck);
      window.removeEventListener('focus', recheck);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isSupabaseConfigured, authCookiePrefix, syncUser]);

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
