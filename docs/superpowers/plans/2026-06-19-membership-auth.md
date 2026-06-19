# 회원가입·인증 시스템 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 일반인이 이메일+비밀번호로 가입·로그인하고 마이페이지를 쓰는 회원 시스템을 구축하고, 후기 게시판 연결을 위한 `profiles` 기반을 마련한다.

**Architecture:** Supabase `auth.users`를 admin·일반 회원 공용 인증 소스로 쓰고, 신규 `public.profiles`(닉네임)를 트리거로 자동 생성한다. 공개 영역(`/signup` `/login` `/account` 등)은 `supabaseBrowser` 세션과 `AuthProvider` Context로 동작하며, admin(`/admin/*`, magic link)과 진입점을 분리한다.

**Tech Stack:** Next.js pages router, TypeScript, Supabase JS(@supabase/ssr), next-i18next, Tailwind, Jest.

## Global Constraints

- 저장소는 PUBLIC — 키/비밀을 코드에 넣지 않고 기존 `NEXT_PUBLIC_SUPABASE_*` env만 사용.
- 패키지 매니저는 pnpm. `package.json` 변경 시 `pnpm-lock.yaml` 함께 커밋. (이번 플랜은 새 의존성 없음)
- next-i18next `fallbackLng: false` — 신규 namespace는 13개 로케일 모두 키를 채워야 raw key 노출이 없음. `auth` namespace는 ko(한국어)·en(영어) 작성 후 나머지 11개 로케일에 en 내용 복사.
- 인증 클라이언트는 `src/lib/supabaseBrowser.ts`(`createSupabaseBrowserClient`, 세션 유지)와 `src/lib/supabaseServer.ts`(`createSupabaseServerClient`)만 사용. 설문 전용 `src/lib/supabase.ts`(persistSession:false)는 회원 인증에 쓰지 않는다.
- 검증 명령은 pnpm이 store 충돌을 일으키므로 직접 바이너리로 실행: `node node_modules/typescript/bin/tsc --noEmit --pretty false`, `node node_modules/jest/bin/jest.js`, `node node_modules/eslint/bin/eslint.js src pages`.
- 마이그레이션 DB 적용은 `printf 'Y\n' | supabase db push`(원격 linked). 작업 브랜치는 `codex/press-og-images`.
- 디자인 토큰: 기존 admin/공개 페이지의 Tailwind 색상 클래스(`jeju-ocean`, `deep-ocean`, `coastal-gray`, `sunset-coral`, `ocean-sand`) 재사용.

---

## File Structure

신규/수정 파일과 책임:

- `supabase/migrations/<ts>_membership_profiles.sql` — profiles 테이블·인덱스·RLS·트리거 (생성)
- `src/types/member.ts` — `MemberProfile`, `NicknameCheckResult` 등 타입 (생성)
- `src/lib/memberAuth.ts` — 닉네임 검증·인증 에러 메시지 매핑 등 순수 로직 (생성, 테스트 대상)
- `src/lib/memberAuth.test.ts` — 위 순수 로직 단위 테스트 (생성)
- `src/components/auth/AuthProvider.tsx` — 세션/유저/프로필 Context + `useAuth` 훅 (생성)
- `src/components/auth/AuthFormShell.tsx` — 공개 인증 페이지 공통 레이아웃(카드/제목/에러/메시지) (생성)
- `pages/signup.tsx`, `pages/login.tsx`, `pages/account.tsx`, `pages/auth/confirm.tsx`, `pages/reset-password.tsx`, `pages/update-password.tsx` — 공개 페이지 (생성)
- `public/locales/<lc>/auth.json` (13개 로케일) — 인증 UI 문구 (생성)
- `pages/_app.tsx` — `AuthProvider`로 비-admin 영역 래핑 (수정)
- `src/components/layout/Navigation.tsx`(+필요 시 `DesktopMenu.tsx`/`MobileMenu.tsx`) — 로그인 상태 반영 (수정)

---

## Task 1: profiles 테이블 마이그레이션

**Files:**
- Create: `supabase/migrations/<ts>_membership_profiles.sql` (`<ts>`는 `date +%Y%m%d%H%M%S`로 생성)

**Interfaces:**
- Produces: `public.profiles(id uuid, nickname text, created_at, updated_at)`, 공개 select RLS, 본인 update RLS, `handle_new_user` 트리거. 후속 태스크가 `profiles`를 select/update하고 `signUp(... data:{nickname})`이 트리거로 행을 만든다.

- [ ] **Step 1: 마이그레이션 SQL 작성**

`set_updated_at()` 함수는 기존 마이그레이션(`20260617022058`)에서 정의돼 재사용한다.

```sql
-- Public member profiles. auth.users holds identity/email; profiles holds the
-- public nickname shown as the author name on future review-board posts.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nickname_len check (char_length(nickname) between 2 and 20)
);

create unique index if not exists profiles_nickname_lower_idx
  on public.profiles (lower(nickname));

alter table public.profiles enable row level security;

grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Public read: nickname is shown publicly as an author label; no sensitive data here.
drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
on public.profiles
for select
to anon, authenticated
using (true);

-- Only the owner may edit their own profile.
drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Auto-create a profile row when an auth user is created. SECURITY DEFINER so it
-- can insert regardless of profiles RLS. Nickname comes from signUp metadata;
-- falls back to a generated handle (e.g. magic-link admin accounts).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''),
      '회원' || substr(new.id::text, 1, 8)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

- [ ] **Step 2: 기존 회원에 대한 프로필 백필**

같은 파일 끝에 추가(트리거는 신규 가입만 처리하므로 기존 auth.users 보강):

```sql
insert into public.profiles (id, nickname)
select u.id, '회원' || substr(u.id::text, 1, 8)
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;
```

- [ ] **Step 3: 로컬 마이그레이션 목록 확인**

Run: `supabase migration list`
Expected: 새 `<ts>_membership_profiles`가 Local에만 표시(Remote 비어 있음).

- [ ] **Step 4: 원격 적용**

Run: `printf 'Y\n' | supabase db push`
Expected: `Applying migration <ts>_membership_profiles.sql...` 후 `Finished supabase db push.`

- [ ] **Step 5: 적용 검증**

Run: `supabase db query --linked --yes -o csv "select count(*) from public.profiles;"`
Expected: 숫자 1행 반환(에러 없음). RLS 확인: `supabase db query --linked --yes -o csv "select polname from pg_policies where tablename='profiles';"` → 2개 정책.

- [ ] **Step 6: Commit**

```bash
git add "supabase/migrations/<ts>_membership_profiles.sql"
git commit -m "feat(members): add profiles table, RLS, and signup trigger"
```

---

## Task 2: 회원 인증 순수 로직 (`memberAuth.ts`) — TDD

**Files:**
- Create: `src/types/member.ts`
- Create: `src/lib/memberAuth.ts`
- Test: `src/lib/memberAuth.test.ts`

**Interfaces:**
- Produces:
  - `validateNickname(value: string): { ok: true; value: string } | { ok: false; reason: string }`
  - `validatePassword(value: string): { ok: true } | { ok: false; reason: string }`
  - `mapAuthError(error: { message?: string } | null | undefined): string` — Supabase 에러 메시지를 한국어 문구로 매핑
  - `MemberProfile` 타입: `{ id: string; nickname: string; created_at: string; updated_at: string }`

- [ ] **Step 1: 타입 파일 작성**

`src/types/member.ts`:

```typescript
export interface MemberProfile {
  id: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: 실패하는 테스트 작성**

`src/lib/memberAuth.test.ts`:

```typescript
import { validateNickname, validatePassword, mapAuthError } from './memberAuth';

describe('validateNickname', () => {
  it('trims and accepts a 2-20 char nickname', () => {
    expect(validateNickname('  강정러버  ')).toEqual({ ok: true, value: '강정러버' });
  });
  it('rejects too short', () => {
    expect(validateNickname('a').ok).toBe(false);
  });
  it('rejects too long (>20)', () => {
    expect(validateNickname('a'.repeat(21)).ok).toBe(false);
  });
  it('rejects whitespace/control chars inside', () => {
    expect(validateNickname('hi there').ok).toBe(false);
    expect(validateNickname('hi\tthere').ok).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts 8+ chars', () => {
    expect(validatePassword('abcd1234')).toEqual({ ok: true });
  });
  it('rejects under 8 chars', () => {
    expect(validatePassword('abc12').ok).toBe(false);
  });
});

describe('mapAuthError', () => {
  it('maps already-registered', () => {
    expect(mapAuthError({ message: 'User already registered' })).toMatch(/이미.*가입/);
  });
  it('maps invalid credentials', () => {
    expect(mapAuthError({ message: 'Invalid login credentials' })).toMatch(/이메일|비밀번호/);
  });
  it('maps email-not-confirmed', () => {
    expect(mapAuthError({ message: 'Email not confirmed' })).toMatch(/인증|확인/);
  });
  it('falls back to a generic message for unknown errors', () => {
    expect(mapAuthError({ message: 'weird' })).toBeTruthy();
  });
  it('returns empty string for no error', () => {
    expect(mapAuthError(null)).toBe('');
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `node node_modules/jest/bin/jest.js src/lib/memberAuth.test.ts`
Expected: FAIL — `Cannot find module './memberAuth'`.

- [ ] **Step 4: 구현 작성**

`src/lib/memberAuth.ts`:

```typescript
export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 20;
export const PASSWORD_MIN = 8;

export const validateNickname = (
  value: string
): { ok: true; value: string } | { ok: false; reason: string } => {
  const trimmed = (value ?? '').trim();
  if (trimmed.length < NICKNAME_MIN || trimmed.length > NICKNAME_MAX) {
    return { ok: false, reason: `닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자여야 합니다.` };
  }
  if (/[\s -]/.test(trimmed)) {
    return { ok: false, reason: '닉네임에 공백이나 제어문자를 쓸 수 없습니다.' };
  }
  return { ok: true, value: trimmed };
};

export const validatePassword = (
  value: string
): { ok: true } | { ok: false; reason: string } => {
  if ((value ?? '').length < PASSWORD_MIN) {
    return { ok: false, reason: `비밀번호는 최소 ${PASSWORD_MIN}자 이상이어야 합니다.` };
  }
  return { ok: true };
};

export const mapAuthError = (error: { message?: string } | null | undefined): string => {
  if (!error) return '';
  const msg = error.message ?? '';
  if (/already registered|already exists/i.test(msg)) return '이미 가입된 이메일입니다.';
  if (/invalid login credentials/i.test(msg)) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (/email not confirmed/i.test(msg)) return '이메일 인증을 먼저 완료해 주세요.';
  if (/password should be at least/i.test(msg)) return '비밀번호가 너무 짧습니다.';
  if (/rate limit|too many/i.test(msg)) return '잠시 후 다시 시도해 주세요.';
  return msg || '요청을 처리하지 못했습니다.';
};
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `node node_modules/jest/bin/jest.js src/lib/memberAuth.test.ts`
Expected: PASS (모든 케이스).

- [ ] **Step 6: Commit**

```bash
git add src/types/member.ts src/lib/memberAuth.ts src/lib/memberAuth.test.ts
git commit -m "feat(members): add member auth pure logic with tests"
```

---

## Task 3: `auth` i18n namespace (13 로케일)

**Files:**
- Create: `public/locales/ko/auth.json`, `public/locales/en/auth.json`
- Create: `public/locales/{es,fr,de,pt,ru,ar,ja,zh-Hans,zh-Hant,hi,id}/auth.json` (en 복사)

**Interfaces:**
- Produces: `auth` namespace 키. 후속 페이지가 `useTranslation('auth')`와 `serverSideTranslations(locale, ['auth'])`로 사용.

- [ ] **Step 1: ko 문구 작성**

`public/locales/ko/auth.json`:

```json
{
  "common": {
    "email": "이메일",
    "password": "비밀번호",
    "nickname": "닉네임",
    "submit": "확인",
    "loading": "처리 중",
    "or": "또는"
  },
  "signup": {
    "title": "회원가입",
    "cta": "가입하기",
    "haveAccount": "이미 계정이 있으신가요?",
    "toLogin": "로그인",
    "checkEmail": "확인 메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료해 주세요.",
    "nicknameTaken": "이미 사용 중인 닉네임입니다."
  },
  "login": {
    "title": "로그인",
    "cta": "로그인",
    "noAccount": "아직 회원이 아니신가요?",
    "toSignup": "회원가입",
    "forgot": "비밀번호를 잊으셨나요?"
  },
  "account": {
    "title": "내 계정",
    "nickname": "닉네임",
    "save": "저장",
    "changePassword": "비밀번호 변경",
    "newPassword": "새 비밀번호",
    "signout": "로그아웃",
    "saved": "저장했습니다."
  },
  "reset": {
    "title": "비밀번호 재설정",
    "cta": "재설정 메일 보내기",
    "sent": "재설정 메일을 보냈습니다.",
    "updateTitle": "새 비밀번호 설정",
    "updateCta": "비밀번호 변경",
    "updated": "비밀번호를 변경했습니다."
  },
  "confirm": {
    "working": "인증을 확인하는 중입니다…",
    "failed": "인증 링크가 만료되었거나 잘못되었습니다."
  },
  "nav": {
    "login": "로그인",
    "signup": "회원가입",
    "account": "내 계정",
    "signout": "로그아웃"
  }
}
```

- [ ] **Step 2: en 문구 작성**

`public/locales/en/auth.json` (동일 키, 영어):

```json
{
  "common": { "email": "Email", "password": "Password", "nickname": "Nickname", "submit": "Submit", "loading": "Processing", "or": "or" },
  "signup": { "title": "Sign up", "cta": "Create account", "haveAccount": "Already have an account?", "toLogin": "Log in", "checkEmail": "We sent a confirmation email. Click the link to finish signing up.", "nicknameTaken": "That nickname is already taken." },
  "login": { "title": "Log in", "cta": "Log in", "noAccount": "Not a member yet?", "toSignup": "Sign up", "forgot": "Forgot your password?" },
  "account": { "title": "My account", "nickname": "Nickname", "save": "Save", "changePassword": "Change password", "newPassword": "New password", "signout": "Log out", "saved": "Saved." },
  "reset": { "title": "Reset password", "cta": "Send reset email", "sent": "Reset email sent.", "updateTitle": "Set a new password", "updateCta": "Change password", "updated": "Password updated." },
  "confirm": { "working": "Confirming…", "failed": "This confirmation link is invalid or expired." },
  "nav": { "login": "Log in", "signup": "Sign up", "account": "My account", "signout": "Log out" }
}
```

- [ ] **Step 3: 나머지 11개 로케일에 en 복사**

Run:
```bash
for lc in es fr de pt ru ar ja zh-Hans zh-Hant hi id; do cp public/locales/en/auth.json "public/locales/$lc/auth.json"; done
```
Expected: 13개 로케일 모두 `auth.json` 존재.

- [ ] **Step 4: 키 parity 확인**

Run: `for lc in ko en es fr de pt ru ar ja zh-Hans zh-Hant hi id; do node -e "JSON.parse(require('fs').readFileSync('public/locales/$lc/auth.json'))" && echo "$lc ok"; done`
Expected: 13줄 모두 `ok`(JSON 유효).

- [ ] **Step 5: Commit**

```bash
git add public/locales/*/auth.json
git commit -m "feat(members): add auth i18n namespace (ko/en + en fallback copies)"
```

---

## Task 4: AuthProvider + useAuth

**Files:**
- Create: `src/components/auth/AuthProvider.tsx`
- Modify: `pages/_app.tsx` (비-admin 영역을 Provider로 래핑)

**Interfaces:**
- Consumes: `createSupabaseBrowserClient` from `@/lib/supabaseBrowser`, `MemberProfile` from `@/types/member`.
- Produces: `useAuth(): { user: User | null; profile: MemberProfile | null; loading: boolean; refreshProfile: () => Promise<void>; signOut: () => Promise<void> }`.

- [ ] **Step 1: AuthProvider 작성**

`src/components/auth/AuthProvider.tsx`:

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import type { MemberProfile } from '@/types/member';

interface AuthContextValue {
  user: User | null;
  profile: MemberProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null);
      return;
    }
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, nickname, created_at, updated_at')
        .eq('id', nextUser.id)
        .maybeSingle();
      setProfile((data as MemberProfile) ?? null);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let supabase;
    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      setLoading(false);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      await loadProfile(nextUser);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        void loadProfile(nextUser);
      }
    );

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user);
  }, [loadProfile, user]);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, loading, refreshProfile, signOut }),
    [user, profile, loading, refreshProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: _app.tsx에서 비-admin 영역 래핑**

`pages/_app.tsx`에서 import 추가(다른 import 옆):

```tsx
import { AuthProvider } from '@/components/auth/AuthProvider';
```

`return (...)` 내부의 `{!isAdminRoute && <Navigation />}` ~ `{!isAdminRoute && <Footer />}` 묶음을 `AuthProvider`로 감싼다. admin은 자체 인증을 쓰므로 비-admin일 때만 Provider를 적용:

```tsx
{isAdminRoute ? (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <main id="main-content" className="overflow-x-hidden">
      <Component {...pageProps} />
    </main>
  </ErrorBoundary>
) : (
  <AuthProvider>
    <Navigation />
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <main id="main-content" className="overflow-x-hidden">
        <Component {...pageProps} />
      </main>
    </ErrorBoundary>
    <Footer />
  </AuthProvider>
)}
```

- [ ] **Step 3: 타입체크**

Run: `node node_modules/typescript/bin/tsc --noEmit --pretty false`
Expected: 에러 없음(exit 0).

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/AuthProvider.tsx pages/_app.tsx
git commit -m "feat(members): add AuthProvider/useAuth and wrap public app"
```

---

## Task 5: 공통 폼 셸 + 회원가입 페이지

**Files:**
- Create: `src/components/auth/AuthFormShell.tsx`
- Create: `pages/signup.tsx`

**Interfaces:**
- Consumes: `useAuth`, `validateNickname`/`validatePassword`/`mapAuthError`, `createSupabaseBrowserClient`.
- Produces: `AuthFormShell` 컴포넌트(`{ title, children, footer? }`) — 이후 login/reset 페이지가 재사용.

- [ ] **Step 1: AuthFormShell 작성**

`src/components/auth/AuthFormShell.tsx`:

```tsx
import Head from 'next/head';
import type { ReactNode } from 'react';

export default function AuthFormShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <>
      <Head>
        <title>{title} | PEACE</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <h1 className="mb-6 font-display text-3xl font-bold text-deep-ocean">{title}</h1>
        <div className="rounded border border-deep-ocean/10 bg-white p-6 shadow-sm">{children}</div>
        {footer && <div className="mt-4 text-center text-sm text-coastal-gray">{footer}</div>}
      </div>
    </>
  );
}
```

- [ ] **Step 2: 회원가입 페이지 작성**

`pages/signup.tsx`:

```tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config';
import AuthFormShell from '@/components/auth/AuthFormShell';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { mapAuthError, validateNickname, validatePassword } from '@/lib/memberAuth';

export default function SignupPage() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const nick = validateNickname(nickname);
    if (!nick.ok) return setError(nick.reason);
    const pw = validatePassword(password);
    if (!pw.ok) return setError(pw.reason);

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      // Pre-check nickname uniqueness (final guard is the DB unique index).
      const { data: taken } = await supabase
        .from('profiles')
        .select('id')
        .ilike('nickname', nick.value)
        .maybeSingle();
      if (taken) {
        setBusy(false);
        return setError(t('signup.nicknameTaken'));
      }

      const { error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { nickname: nick.value },
          emailRedirectTo:
            typeof window === 'undefined' ? undefined : `${window.location.origin}/auth/confirm`,
        },
      });
      setBusy(false);
      if (signErr) return setError(mapAuthError(signErr));
      setMessage(t('signup.checkEmail'));
    } catch (err) {
      setBusy(false);
      setError(mapAuthError(err as { message?: string }));
    }
  };

  return (
    <AuthFormShell
      title={t('signup.title')}
      footer={
        <span>
          {t('signup.haveAccount')}{' '}
          <Link href="/login" className="text-jeju-ocean underline">
            {t('signup.toLogin')}
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label={t('common.email')}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </Field>
        <Field label={t('common.nickname')}>
          <input type="text" required value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputCls} />
        </Field>
        <Field label={t('common.password')}>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </Field>
        {message && <p className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{message}</p>}
        {error && <p className="rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">{error}</p>}
        <button type="submit" disabled={busy} className={btnCls}>
          {busy ? t('common.loading') : t('signup.cta')}
        </button>
      </form>
    </AuthFormShell>
  );
}

const inputCls =
  'w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';
const btnCls =
  'w-full rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-deep-ocean">{label}</span>
      {children}
    </label>
  );
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolved = locale ?? 'ko';
  return {
    props: {
      ...(await serverSideTranslations(resolved, ['auth', 'translation'], nextI18NextConfig)),
    },
  };
}
```

- [ ] **Step 3: 타입체크 + lint**

Run: `node node_modules/typescript/bin/tsc --noEmit --pretty false && node node_modules/eslint/bin/eslint.js pages/signup.tsx src/components/auth`
Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/AuthFormShell.tsx pages/signup.tsx
git commit -m "feat(members): add signup page with nickname precheck"
```

---

## Task 6: 로그인 페이지

**Files:**
- Create: `pages/login.tsx`

**Interfaces:**
- Consumes: `createSupabaseBrowserClient`, `mapAuthError`, `AuthFormShell`. `next` 쿼리로 로그인 후 목적지(기본 `/account`).

- [ ] **Step 1: 로그인 페이지 작성**

`pages/login.tsx` (Field/inputCls/btnCls는 signup과 동일 — 이 파일에 다시 정의):

```tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config';
import AuthFormShell from '@/components/auth/AuthFormShell';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { mapAuthError } from '@/lib/memberAuth';

const safeNext = (value: unknown) => {
  const n = typeof value === 'string' ? value : '/account';
  return n.startsWith('/') && !n.startsWith('//') ? n : '/account';
};

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setBusy(false);
      if (signErr) return setError(mapAuthError(signErr));
      await router.push(safeNext(router.query.next));
    } catch (err) {
      setBusy(false);
      setError(mapAuthError(err as { message?: string }));
    }
  };

  return (
    <AuthFormShell
      title={t('login.title')}
      footer={
        <div className="space-y-1">
          <p>
            {t('login.noAccount')}{' '}
            <Link href="/signup" className="text-jeju-ocean underline">
              {t('login.toSignup')}
            </Link>
          </p>
          <p>
            <Link href="/reset-password" className="text-coastal-gray underline">
              {t('login.forgot')}
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-deep-ocean">{t('common.email')}</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-deep-ocean">{t('common.password')}</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </label>
        {error && <p className="rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">{error}</p>}
        <button type="submit" disabled={busy} className={btnCls}>
          {busy ? t('common.loading') : t('login.cta')}
        </button>
      </form>
    </AuthFormShell>
  );
}

const inputCls =
  'w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';
const btnCls =
  'w-full rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60';

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolved = locale ?? 'ko';
  return {
    props: {
      ...(await serverSideTranslations(resolved, ['auth', 'translation'], nextI18NextConfig)),
    },
  };
}
```

- [ ] **Step 2: 타입체크 + lint**

Run: `node node_modules/typescript/bin/tsc --noEmit --pretty false && node node_modules/eslint/bin/eslint.js pages/login.tsx`
Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add pages/login.tsx
git commit -m "feat(members): add login page"
```

---

## Task 7: 이메일 확인 콜백 페이지

**Files:**
- Create: `pages/auth/confirm.tsx`

**Interfaces:**
- Consumes: `createSupabaseServerClient` (admin `callback.tsx`와 동일한 `exchangeCodeForSession` 패턴).
- 동작: `?code=` 있으면 세션 교환 후 `/account`로, 실패 시 `/login?error=confirm_failed`로 리다이렉트.

- [ ] **Step 1: confirm 페이지 작성**

`pages/auth/confirm.tsx`:

```tsx
import type { GetServerSideProps } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const safeNext = (value: unknown) => {
  const n = typeof value === 'string' ? value : '/account';
  return n.startsWith('/') && !n.startsWith('//') ? n : '/account';
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = typeof context.query.code === 'string' ? context.query.code : null;
  const next = safeNext(context.query.next);

  if (!code) {
    return { redirect: { destination: '/login?error=confirm_failed', permanent: false } };
  }

  try {
    const supabase = createSupabaseServerClient(context.req, context.res);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return { redirect: { destination: next, permanent: false } };
    }
  } catch {
    // fall through to error redirect
  }

  return { redirect: { destination: '/login?error=confirm_failed', permanent: false } };
};

export default function AuthConfirmPage() {
  return null;
}
```

- [ ] **Step 2: 타입체크**

Run: `node node_modules/typescript/bin/tsc --noEmit --pretty false`
Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add pages/auth/confirm.tsx
git commit -m "feat(members): add email confirmation callback"
```

---

## Task 8: 마이페이지(account)

**Files:**
- Create: `pages/account.tsx`

**Interfaces:**
- Consumes: `useAuth`(user/profile/loading/refreshProfile/signOut), `createSupabaseBrowserClient`, `validateNickname`/`validatePassword`/`mapAuthError`.
- 동작: 미로그인 시 `/login?next=/account`로 클라이언트 리다이렉트. 닉네임 업데이트(`profiles.update`), 비밀번호 변경(`auth.updateUser`), 로그아웃.

- [ ] **Step 1: account 페이지 작성**

`pages/account.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import nextI18NextConfig from '../next-i18next.config';
import { useAuth } from '@/components/auth/AuthProvider';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { mapAuthError, validateNickname, validatePassword } from '@/lib/memberAuth';

export default function AccountPage() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const [nickname, setNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) void router.replace('/login?next=/account');
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) setNickname(profile.nickname);
  }, [profile]);

  const saveNickname = async () => {
    setError('');
    setMessage('');
    const nick = validateNickname(nickname);
    if (!nick.ok) return setError(nick.reason);
    if (!user) return;
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase
        .from('profiles')
        .update({ nickname: nick.value })
        .eq('id', user.id);
      setBusy(false);
      if (upErr) return setError(/duplicate|unique/i.test(upErr.message) ? t('signup.nicknameTaken') : upErr.message);
      await refreshProfile();
      setMessage(t('account.saved'));
    } catch (err) {
      setBusy(false);
      setError(mapAuthError(err as { message?: string }));
    }
  };

  const changePassword = async () => {
    setError('');
    setMessage('');
    const pw = validatePassword(newPassword);
    if (!pw.ok) return setError(pw.reason);
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: upErr } = await supabase.auth.updateUser({ password: newPassword });
      setBusy(false);
      if (upErr) return setError(mapAuthError(upErr));
      setNewPassword('');
      setMessage(t('reset.updated'));
    } catch (err) {
      setBusy(false);
      setError(mapAuthError(err as { message?: string }));
    }
  };

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-coastal-gray">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('account.title')} | PEACE</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="mx-auto max-w-md space-y-6 px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-deep-ocean">{t('account.title')}</h1>
        <p className="text-sm text-coastal-gray">{user.email}</p>

        {message && <p className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{message}</p>}
        {error && <p className="rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">{error}</p>}

        <section className="space-y-2 rounded border border-deep-ocean/10 bg-white p-5">
          <label className="block text-sm font-semibold text-deep-ocean">{t('account.nickname')}</label>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputCls} />
          <button type="button" onClick={saveNickname} disabled={busy} className={btnCls}>
            {t('account.save')}
          </button>
        </section>

        <section className="space-y-2 rounded border border-deep-ocean/10 bg-white p-5">
          <label className="block text-sm font-semibold text-deep-ocean">{t('account.newPassword')}</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} />
          <button type="button" onClick={changePassword} disabled={busy} className={btnCls}>
            {t('account.changePassword')}
          </button>
        </section>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            await router.push('/');
          }}
          className="w-full rounded border border-deep-ocean/20 bg-white px-4 py-2 font-semibold text-deep-ocean transition hover:border-jeju-ocean"
        >
          {t('account.signout')}
        </button>
      </div>
    </>
  );
}

const inputCls =
  'w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';
const btnCls =
  'w-full rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60';

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolved = locale ?? 'ko';
  return {
    props: {
      ...(await serverSideTranslations(resolved, ['auth', 'translation'], nextI18NextConfig)),
    },
  };
}
```

- [ ] **Step 2: 타입체크 + lint**

Run: `node node_modules/typescript/bin/tsc --noEmit --pretty false && node node_modules/eslint/bin/eslint.js pages/account.tsx`
Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add pages/account.tsx
git commit -m "feat(members): add account page (nickname, password, signout)"
```

---

## Task 9: 비밀번호 재설정 (요청 + 갱신)

**Files:**
- Create: `pages/reset-password.tsx`
- Create: `pages/update-password.tsx`

**Interfaces:**
- `reset-password`: `resetPasswordForEmail(email, { redirectTo: <origin>/update-password })`.
- `update-password`: 메일 링크 도착 후 세션에서 `updateUser({ password })`.

- [ ] **Step 1: reset-password 작성**

`pages/reset-password.tsx`:

```tsx
import { useState } from 'react';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config';
import AuthFormShell from '@/components/auth/AuthFormShell';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { mapAuthError } from '@/lib/memberAuth';

export default function ResetPasswordPage() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: rErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo:
          typeof window === 'undefined' ? undefined : `${window.location.origin}/update-password`,
      });
      setBusy(false);
      if (rErr) return setError(mapAuthError(rErr));
      setMessage(t('reset.sent'));
    } catch (err) {
      setBusy(false);
      setError(mapAuthError(err as { message?: string }));
    }
  };

  return (
    <AuthFormShell title={t('reset.title')}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-deep-ocean">{t('common.email')}</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </label>
        {message && <p className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{message}</p>}
        {error && <p className="rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">{error}</p>}
        <button type="submit" disabled={busy} className={btnCls}>
          {busy ? t('common.loading') : t('reset.cta')}
        </button>
      </form>
    </AuthFormShell>
  );
}

const inputCls =
  'w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';
const btnCls =
  'w-full rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60';

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolved = locale ?? 'ko';
  return {
    props: { ...(await serverSideTranslations(resolved, ['auth', 'translation'], nextI18NextConfig)) },
  };
}
```

- [ ] **Step 2: update-password 작성**

`pages/update-password.tsx`:

```tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config';
import AuthFormShell from '@/components/auth/AuthFormShell';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { mapAuthError, validatePassword } from '@/lib/memberAuth';

export default function UpdatePasswordPage() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const pw = validatePassword(password);
    if (!pw.ok) return setError(pw.reason);
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: uErr } = await supabase.auth.updateUser({ password });
      setBusy(false);
      if (uErr) return setError(mapAuthError(uErr));
      setMessage(t('reset.updated'));
      setTimeout(() => void router.push('/account'), 1200);
    } catch (err) {
      setBusy(false);
      setError(mapAuthError(err as { message?: string }));
    }
  };

  return (
    <AuthFormShell title={t('reset.updateTitle')}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-deep-ocean">{t('account.newPassword')}</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </label>
        {message && <p className="rounded bg-jeju-ocean/10 px-3 py-2 text-sm text-jeju-ocean">{message}</p>}
        {error && <p className="rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">{error}</p>}
        <button type="submit" disabled={busy} className={btnCls}>
          {busy ? t('common.loading') : t('reset.updateCta')}
        </button>
      </form>
    </AuthFormShell>
  );
}

const inputCls =
  'w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';
const btnCls =
  'w-full rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60';

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolved = locale ?? 'ko';
  return {
    props: { ...(await serverSideTranslations(resolved, ['auth', 'translation'], nextI18NextConfig)) },
  };
}
```

- [ ] **Step 3: 타입체크 + lint**

Run: `node node_modules/typescript/bin/tsc --noEmit --pretty false && node node_modules/eslint/bin/eslint.js pages/reset-password.tsx pages/update-password.tsx`
Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add pages/reset-password.tsx pages/update-password.tsx
git commit -m "feat(members): add password reset request and update pages"
```

---

## Task 10: Navigation 로그인 상태 반영

**Files:**
- Modify: `src/components/layout/Navigation.tsx` (그리고 메뉴 항목을 렌더하는 `DesktopMenu.tsx`/`MobileMenu.tsx` 중 실제로 링크를 그리는 곳)

**Interfaces:**
- Consumes: `useAuth`(user/profile/signOut). `auth` namespace의 `nav.*` 키.

**주의:** 구현 전 `Navigation.tsx`, `DesktopMenu.tsx`, `MobileMenu.tsx`를 읽어 기존 메뉴 렌더 구조와 i18n 사용 방식을 파악하고 그 패턴에 맞춰 항목을 추가한다. `useAuth`는 `AuthProvider` 내부(비-admin)에서만 호출 가능하므로, Navigation은 비-admin에서만 렌더된다는 점(Task 4)에 의존한다.

- [ ] **Step 1: 기존 메뉴 구조 확인**

Run: `node node_modules/typescript/bin/tsc --noEmit` 전에 파일 정독:
```bash
sed -n '1,80p' src/components/layout/Navigation.tsx
sed -n '1,80p' src/components/layout/DesktopMenu.tsx
sed -n '1,80p' src/components/layout/MobileMenu.tsx
```

- [ ] **Step 2: 로그인/계정 영역 추가**

메뉴 우측(또는 모바일 메뉴 하단)에 인증 영역을 추가한다. 비로그인이면 로그인/가입 링크, 로그인이면 닉네임+마이페이지+로그아웃. 데스크톱/모바일 각각의 기존 마크업 패턴을 따른다. 예시 블록(데스크톱):

```tsx
// import 추가
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslation } from 'next-i18next';

// 컴포넌트 내부
const { user, profile, signOut } = useAuth();
const { t } = useTranslation('auth');

// 렌더(메뉴 끝):
{user ? (
  <>
    <Link href="/account" className="text-sm font-semibold text-deep-ocean hover:text-jeju-ocean">
      {profile?.nickname ?? t('nav.account')}
    </Link>
    <button
      type="button"
      onClick={() => void signOut()}
      className="text-sm font-semibold text-coastal-gray hover:text-sunset-coral"
    >
      {t('nav.signout')}
    </button>
  </>
) : (
  <>
    <Link href="/login" className="text-sm font-semibold text-deep-ocean hover:text-jeju-ocean">
      {t('nav.login')}
    </Link>
    <Link href="/signup" className="rounded bg-jeju-ocean px-3 py-1.5 text-sm font-semibold text-white hover:bg-deep-ocean">
      {t('nav.signup')}
    </Link>
  </>
)}
```

**i18n 주의:** Navigation이 `auth` namespace를 쓰려면 모든 공개 페이지의 `getStaticProps`가 `serverSideTranslations(..., ['auth', ...])`에 `auth`를 포함해야 한다. 공개 페이지가 많으므로, 대신 **Navigation은 `auth` 키를 옵션 처리**한다: `useTranslation('auth')`의 `t`가 키를 못 찾으면 `nav.login` 등이 raw로 보일 수 있으니, Navigation에서는 하드코딩 한국어/영어 분기 대신 `translation` namespace에 `nav.member.*` 키를 추가하는 방식을 택한다.

> 결정: Navigation 문구는 기존 전역 `translation` namespace에 `memberNav` 키(13 로케일)로 추가한다(공개 페이지 전부가 이미 `translation`을 로드하므로 parity·로딩 문제 없음). `auth.json`의 `nav.*`는 사용하지 않는다.

- [ ] **Step 3: translation namespace에 memberNav 키 추가(13 로케일)**

각 `public/locales/<lc>/translation.json`에 최상위 `memberNav` 추가. ko 예:
```json
"memberNav": { "login": "로그인", "signup": "회원가입", "account": "내 계정", "signout": "로그아웃" }
```
en 및 나머지 11개는 영어:
```json
"memberNav": { "login": "Log in", "signup": "Sign up", "account": "My account", "signout": "Log out" }
```
Navigation에서는 `const { t } = useTranslation('translation');` 후 `t('memberNav.login')` 등을 쓴다(위 Step 2의 `t('nav.x')`를 `t('memberNav.x')`로 대체).

- [ ] **Step 4: 키 parity·JSON 유효성 확인**

Run: `for lc in ko en es fr de pt ru ar ja zh-Hans zh-Hant hi id; do node -e "const o=require('./public/locales/$lc/translation.json'); if(!o.memberNav||!o.memberNav.login){process.exit(1)}" && echo "$lc ok"; done`
Expected: 13줄 모두 `ok`.

- [ ] **Step 5: 타입체크 + lint + 기존 Navigation 테스트**

Run: `node node_modules/typescript/bin/tsc --noEmit --pretty false && node node_modules/eslint/bin/eslint.js src/components/layout && node node_modules/jest/bin/jest.js src/components/layout/Navigation.test.tsx`
Expected: 에러 없음, 테스트 PASS. (Navigation.test가 `AuthProvider` 없이 렌더해 `useAuth` 에러가 나면, 테스트에서 Provider로 감싸거나 Navigation에서 `useContext`를 직접 null-safe하게 호출하도록 조정 — `useAuth` 대신 컨텍스트를 옵셔널로 읽는 `useOptionalAuth`를 AuthProvider에 추가하고 Navigation은 그것을 사용한다.)

- [ ] **Step 6: Commit**

```bash
git add src/components/layout pages public/locales/*/translation.json src/components/auth/AuthProvider.tsx
git commit -m "feat(members): show login state in navigation"
```

---

## Task 11: 전체 검증 + 운영 메모

**Files:**
- 없음(검증·문서)

- [ ] **Step 1: 전체 타입체크**

Run: `node node_modules/typescript/bin/tsc --noEmit --pretty false`
Expected: exit 0.

- [ ] **Step 2: 전체 테스트**

Run: `node node_modules/jest/bin/jest.js`
Expected: 모든 스위트 PASS(기존 178 + memberAuth 신규).

- [ ] **Step 3: 전체 lint**

Run: `node node_modules/eslint/bin/eslint.js src pages`
Expected: 에러 0.

- [ ] **Step 4: 프로덕션 빌드 스모크(선택, 강력 권장)**

Run: `node node_modules/next/dist/bin/next build`
Expected: 빌드 성공(신규 페이지 6개 + auth namespace 정상). 실패 시 로그의 누락 키/타입 문제 수정.

- [ ] **Step 5: 운영 체크리스트 기록 + 커밋**

Supabase 대시보드(사용자 작업) 항목을 `docs/superpowers/plans/`의 본 plan 하단 또는 메모리에 남긴다:
- Authentication → Email: **Confirm email = ON**
- Authentication → URL Configuration → Redirect URLs에 `<도메인>/auth/confirm`, `<도메인>/update-password` 추가
- (선택) 비밀번호 최소 길이 등 정책 확인

```bash
git add -A
git commit -m "chore(members): finalize membership auth (verification pass)"
```

- [ ] **Step 6: 푸시**

```bash
git push origin codex/press-og-images
```

---

## Self-Review (작성자 점검 결과)

- **Spec coverage:** profiles/RLS/트리거(Task 1) · 순수 로직(Task 2) · i18n(Task 3,10) · 세션 Context(Task 4) · signup/login/confirm/account/reset/update(Task 5–9) · Navigation(Task 10) · 검증·운영(Task 11). spec의 모든 섹션이 태스크로 매핑됨.
- **Placeholder scan:** 모든 코드 단계에 실제 코드 포함. `<ts>`, `<도메인>`는 실행 시 치환하는 의도된 값(명령으로 생성/대시보드 입력).
- **Type consistency:** `MemberProfile`(id/nickname/created_at/updated_at)·`validateNickname`/`validatePassword`/`mapAuthError`·`useAuth` 반환 형태가 정의 태스크(2,4)와 소비 태스크(5–10)에서 일치.
- **알려진 조정 포인트:** Task 10에서 Navigation 문구는 `auth`가 아닌 전역 `translation` namespace의 `memberNav`로 둔다(공개 페이지 전부가 translation을 이미 로드하므로 raw key 회귀 없음). Navigation 테스트는 `useOptionalAuth`(컨텍스트 null 허용)로 Provider 미존재 시에도 안전하게.
