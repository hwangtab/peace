# 관리자 인증 통일(매직링크 제거 → 회원 비밀번호 로그인) 설계

작성일: 2026-06-22
대상: `hwangtab/peace` (Next.js pages router + Supabase)

## 1. 배경 / 목적

관리자 로그인이 매직링크(OTP)라 이메일 발송에 의존했는데, Supabase 이메일이 도착하지 않고(기본 메일 제약/SMTP 미설정) 링크 주소도 localhost로 떠(=Supabase **Site URL** 오설정) 관리자가 로그인할 수 없었다.

해결 방향(사용자 확정): **매직링크를 없애고, 모두 회원 시스템(이메일+비밀번호)으로 로그인한다. 그중 `admin_members` 명단에 지정된 회원이 관리자가 된다.** 회원가입 이메일 인증은 **유지**(이메일 전달은 Supabase SMTP/Site URL 설정으로 별도 해결).

## 2. 핵심 통찰

`getAdminSession`은 **로그인 방식과 무관하게** Supabase 세션의 user를 `admin_members`(active)와 대조해 관리자 여부를 판정한다. 즉 매직링크는 "세션을 만드는 한 가지 수단"일 뿐이며, 회원 비밀번호 로그인(`signInWithPassword`)으로 만든 세션도 동일하게 동작한다. → **권한(authorization) 로직은 그대로 두고, 인증(authentication) 진입점만 회원 로그인으로 통일**한다.

## 3. 범위

### 3.1 코드 변경 (이번 작업)
1. **매직링크 페이지 제거/대체**
   - `pages/admin/callback.tsx` 삭제(매직링크 OTP 콜백 — 비밀번호 로그인엔 불필요).
   - `pages/admin/login.tsx`는 본문을 제거하고 `getServerSideProps`에서 `/login?next=/admin`으로 리다이렉트하는 얇은 스텁으로 교체(기존 북마크/링크 호환).
2. **리다이렉트 목적지 통일** — `src/lib/adminAuth.ts`의 `redirectToAdminLogin`이 `/admin/login` 대신 `/login?next=…`을 가리키도록 변경.
3. **"미로그인" vs "로그인했지만 비관리자" 구분** — 현재 `getAdminSession`은 둘 다 `null`이라 비관리자가 `/admin` 접근 시 `/login`으로 갔다가 다시 막히는 루프 위험이 있다. 새 헬퍼를 추가한다:
   - `resolveAdminPageAccess(context)` → `{ redirect }` 또는 `{ session }`:
     - Supabase user 없음 → `{ redirect: { destination: '/login?next=<resolvedUrl>', permanent: false } }`
     - user는 있으나 `admin_members`에 없음 → `{ redirect: { destination: '/', permanent: false } }` (홈으로; 루프 방지)
     - 둘 다 충족 → `{ session }`
   - 모든 `pages/admin/*` 페이지의 게이트(`getAdminSession` + `if(!session) return redirectToAdminLogin`)를 이 헬퍼로 교체.
   - API 라우트의 `requireAdminApi`/`requireAdminRole`은 그대로(미인증/권한부족 시 401/403).
4. **로그아웃 목적지** — `AdminLayout`의 signOut 후 이동을 `/admin/login` → `/login`으로.
5. **owner 부트스트랩 마이그레이션** — `admin_members`에 `hwangtab@gmail.com`을 owner·active로 등록(현재 명단에 넣는 INSERT가 없음). 이메일 유니크 충돌 시 owner·active로 갱신(idempotent). `user_id`는 NULL로 두고 최초 로그인 시 이메일 매칭으로 연결.

### 3.2 운영자(대시보드) 작업 — 코드로 불가, 사용자가 수행
1. **Supabase Site URL을 `https://peaceandmusic.net`로 수정** (localhost 링크 원인 제거). Redirect URLs에 `https://peaceandmusic.net/auth/confirm`, `https://peaceandmusic.net/update-password` 등록.
2. **즉시 잠금 해제**: Auth → Users → `hwangtab@gmail.com` 생성(없으면) + **비밀번호 설정** + 이메일 확인 처리. 이후 `/login`에서 입장.
3. **회원가입 메일 실제 전달**: 커스텀 SMTP(Resend/SES 등) 연결(미설정 시 가입 확인 메일이 일반 주소로 도달하지 않음).

### 3.3 범위 밖
- 매직링크 HTML 템플릿 파일(`supabase/templates/magic-link.html`)은 남겨두되 README에서 "관리자 로그인용" 설명만 정리(선택, 후속). 회원 confirm/reset 템플릿은 그대로 사용.
- SMTP 자동 설정(대시보드 작업).

## 4. 영향 파일
- 삭제: `pages/admin/callback.tsx`
- 대체(스텁): `pages/admin/login.tsx`
- 수정: `src/lib/adminAuth.ts`(redirectToAdminLogin, resolveAdminPageAccess 추가), `pages/admin/*.tsx` 전부(게이트 교체), `src/components/admin/AdminLayout.tsx`(signOut 목적지)
- 신규: `supabase/migrations/<ts>_admin_member_bootstrap_owner.sql`

## 5. 보안/회귀 고려
- 인증 진입점만 바뀌고 권한 게이트(admin_members + RLS)는 동일 → 권한 상승 위험 없음.
- 비관리자 회원이 `/admin/*` 접근 시 홈으로(정보 노출 없음). API는 401/403.
- 회원 비밀번호 정책/RLS는 기존 그대로.
- `safeRedirectPath`가 내부 경로(`/admin/...`)를 허용함을 확인(외부/`//` 차단).

## 6. 테스트/검증
- `resolveAdminPageAccess` 단위 테스트(anon→/login, 비관리자→/, 관리자→session). Supabase 모킹은 기존 adminAuth 테스트 패턴 따름.
- tsc/eslint/jest/prettier/build 통과, i18n 영향 없음(admin 한국어 하드코딩).
- 수동: (a) 대시보드에서 owner 비번 설정 후 `/login` → `/admin` 진입, (b) 비관리자 회원 `/admin` → 홈, (c) 미로그인 `/admin` → `/login?next=/admin` → 로그인 → 복귀, (d) `/admin/login`·옛 링크 → `/login` 리다이렉트.

## 7. ggac/기존 대비 메모
- 회원/관리자 단일 Supabase auth.users를 공유(이메일당 1계정). 한 비밀번호로 회원·관리자 양쪽 세션 사용.
- 매직링크 의존 제거로 관리자 로그인이 이메일 발송과 무관해짐(가입 확인 메일은 여전히 이메일 필요 — 운영자 SMTP/Site URL로 해결).
