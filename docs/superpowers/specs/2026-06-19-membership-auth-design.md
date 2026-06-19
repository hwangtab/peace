# 회원가입·인증 시스템 설계 (Phase 1)

작성일: 2026-06-19
대상 저장소: `hwangtab/peace` (PUBLIC), Next.js pages router, Supabase

## 1. 목적과 범위

일반인이 직접 가입·로그인할 수 있는 회원 시스템을 만든다. 추후 후기 게시판을
붙일 수 있도록 회원 식별 기반(`profiles`)을 함께 마련한다.

- **이번 범위(Phase 1)**: 이메일+비밀번호 가입/로그인, 이메일 인증, 마이페이지,
  비밀번호 재설정, 공개 헤더 로그인 상태 반영, `profiles` 테이블/RLS/트리거.
- **다음 범위(Phase 2, 별도 spec)**: 후기 게시판(`posts`) CRUD. 이번엔 만들지
  않되, `profiles.id`를 작성자 FK로 연결할 수 있게 설계만 열어둔다.

### 확정된 결정 사항
- 인증 방식: **이메일 + 비밀번호**
- 가입 흐름: **이메일 인증(확인 메일) 후 즉시 활성** (관리자 승인 없음)
- 수집 정보: **이메일 + 닉네임** (그 외 없음)
- 인증 UI 다국어: **한국어 + 영어만** (`auth` namespace, 타 로케일은 영어 폴백)
- admin/일반 로그인 **분리**: admin은 `/admin/login`(magic link) 유지, 일반은
  `/login`(비밀번호) — 별개 진입점
- 이메일은 `profiles`에 **중복 저장하지 않음** (`auth.users`에만 존재), 닉네임만 공개

## 2. 데이터 모델

### 2.1 기존
- `auth.users` — admin·일반 회원을 아우르는 단일 인증 소스. 일반 회원은 비밀번호
  자격증명, admin은 기존 magic link. 동일 이메일이 둘 다일 수 있다.
- `admin_members` — 권한 테이블. **변경 없음**. 일반 회원과 독립.

### 2.2 신규: `public.profiles`

| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | `uuid` PK | `references auth.users(id) on delete cascade` |
| `nickname` | `text not null` | 후기 작성자명으로 노출 |
| `created_at` | `timestamptz not null default now()` | |
| `updated_at` | `timestamptz not null default now()` | `set_updated_at` 트리거 재사용 |

- 유니크 인덱스: `create unique index profiles_nickname_lower_idx on public.profiles (lower(nickname));`
  → 대소문자 무시 닉네임 중복 방지.
- 닉네임 제약(앱+DB): 2~20자, 공백/제어문자 불가. DB는 `check (char_length(nickname) between 2 and 20)`.

### 2.3 가입 시 프로필 자동 생성 트리거

```
create function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''),
             '회원' || substr(new.id::text, 1, 8))
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- 닉네임은 `signUp` 시 `options.data.nickname`으로 전달되어 `raw_user_meta_data`에
  담긴다. 비어 있으면 `회원<uuid8>` 폴백(magic link로 만든 admin 계정 등 대비).
- 닉네임 유니크 충돌 시 트리거가 실패 → 가입 실패. 앱에서 **사전 중복 체크**로 완화.

## 3. 보안 (RLS)

`profiles`에 RLS 활성화. anon에는 `select`만 부여(공개 닉네임 표시용), 쓰기는 없음.

- **select**: 공개 (`using (true)`). 민감정보(이메일/비번)는 `profiles`에 없음.
- **update**: 본인만 — `using (id = auth.uid()) with check (id = auth.uid())`.
  닉네임 변경 시에도 유니크 인덱스가 중복을 막는다.
- **insert/delete**: 정책 미부여(트리거 SECURITY DEFINER가 insert 담당, 계정 삭제는
  `auth.users` cascade). 직접 insert/delete 불가.

권한:
- `grant select on public.profiles to anon, authenticated;`
- `grant update on public.profiles to authenticated;`

## 4. 인증 흐름과 페이지 (공개 영역)

모든 신규 공개 페이지는 `auth` i18n namespace(ko/en) 사용. 라우팅은 기존 로케일
구조를 따른다.

| 경로 | 동작 |
|---|---|
| `/signup` | 이메일·비밀번호·닉네임 입력 → 닉네임 사전 중복 체크 → `supabase.auth.signUp({ email, password, options: { data: { nickname }, emailRedirectTo: <origin>/auth/confirm } })` → "확인 메일을 보냈습니다" 안내 |
| `/login` | `signInWithPassword({ email, password })` → 성공 시 `/account`(또는 `next` 파라미터) |
| `/auth/confirm` | 이메일 확인 링크 착지. Supabase 세션 성립 확인 후 `/account`로 이동, 실패 시 안내 |
| `/account` | 로그인 가드(미로그인 시 `/login?next=/account`). 닉네임 표시·변경, 비밀번호 변경, 로그아웃. 추후 "내 후기" 영역 |
| `/reset-password` | 이메일 입력 → `resetPasswordForEmail(email, { redirectTo: <origin>/update-password })` |
| `/update-password` | 메일 링크로 도착한 세션에서 `updateUser({ password })` |

- 닉네임 사전 중복 체크: `supabase.from('profiles').select('id').ilike('nickname', value).maybeSingle()`
  (공개 select 활용). 최종 보증은 DB 유니크 인덱스.
- 에러 메시지는 사용자 친화적으로 매핑(이미 가입된 이메일, 비번 불일치, 닉네임 중복 등).

## 5. 세션 인프라와 컴포넌트

- **클라이언트**: `supabaseBrowser`(`createBrowserClient`, 세션 유지) 재사용.
  설문 전용 `src/lib/supabase.ts`(persistSession:false)와 **분리** — 혼용 금지.
- **서버**: `supabaseServer`(쿠키 기반) 재사용 — `/account` 등 가드.
- **`AuthProvider`(React Context)**: 앱 루트(`_app.tsx`)에 마운트. 현재 세션/유저/
  프로필을 구독(`onAuthStateChange`)해 전역 공유. 헤더가 이를 사용.
- **Navigation 변경**: 비로그인 → "로그인/가입" 링크, 로그인 → 닉네임 + 마이페이지 +
  로그아웃. 데스크톱/모바일 메뉴 양쪽 반영.
- 새 유틸: `src/lib/memberAuth.ts`(또는 유사) — 닉네임 검증, 가입/로그인 래퍼,
  에러 메시지 매핑 등 순수 로직을 분리해 단위 테스트 대상으로 삼는다.

## 6. 단위 설계 원칙 (파일 경계)

- DB: `supabase/migrations/<ts>_membership_profiles.sql` (테이블·인덱스·RLS·트리거)
- 순수 로직: `src/lib/memberAuth.ts` (닉네임 검증, 에러 매핑) + 테스트
- 세션 상태: `src/components/auth/AuthProvider.tsx`, `useAuth` 훅
- 페이지: `pages/signup.tsx`, `pages/login.tsx`, `pages/account.tsx`,
  `pages/auth/confirm.tsx`, `pages/reset-password.tsx`, `pages/update-password.tsx`
- 폼 UI 공통: `src/components/auth/AuthForm*` (입력/검증/제출 공통 묶음)

## 7. 에러 처리

- 네트워크/Supabase 에러는 폼 하단에 한국어/영어 메시지로 노출.
- 가입: 이미 존재하는 이메일, 약한 비밀번호, 닉네임 중복.
- 로그인: 자격증명 불일치, 이메일 미확인.
- 비번 재설정: 잘못된/만료된 링크.
- 환경변수 미설정(`requireSupabasePublicConfig` 실패) 시 안내 메시지로 graceful degrade.

## 8. 테스트 계획

- `memberAuth` 순수 로직 단위 테스트(닉네임 검증 경계값, 에러 매핑).
- 기존 테스트 회귀(`pnpm test` 178개) 및 `pnpm typecheck`/`lint` 통과.
- 수동 검증: 가입→확인메일→로그인→닉네임 변경→비번 재설정→로그아웃 흐름.

## 9. 운영/배포 메모

- Supabase 대시보드: Confirm email = ON, redirect URL 허용목록에
  `<도메인>/auth/confirm`, `<도메인>/update-password` 추가 필요(사용자 작업).
- 마이그레이션은 `supabase db push`로 원격 적용(사용자 또는 CLI 경유).
- 레포가 PUBLIC이므로 비밀/키를 코드에 넣지 않는다(기존 env 방식 준수).

## 10. Phase 2 연결 지점 (이번 미구현)

후기 게시판은 별도 spec. 예상 구조만 기록:
- `posts(id, author_id → profiles.id, title, body, created_at, ...)`,
  필요 시 `post_comments`.
- RLS: 공개 읽기(공개 글), 작성자 본인 수정/삭제, 관리자(admin_members) 모더레이션.
- 마이페이지 "내 후기"가 `posts`를 author_id로 조회.
