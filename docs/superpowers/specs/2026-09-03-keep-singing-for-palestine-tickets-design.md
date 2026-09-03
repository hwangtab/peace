# Keep Singing for Palestine — 콘서트 페이지·예매 접수·관리자 설계

작성일: 2026-09-03. 대상 공연: 2026-09-19(토) 18:00~20:00, 반쥴(서울 종로구 삼일대로17길 23 3층).

## 1. 목표

- 공연 소개 페이지를 사이트 안에 만들고, 구글 폼을 대체하는 예매 신청 폼으로 접수를 받는다.
- 신청자는 이름+연락처로 자기 예매 상태(입금 대기/확정)를 스스로 조회한다.
- 관리자는 신청자 목록을 보고 입금 확인(확정)·취소·메모·CSV 내보내기·일괄 폐기를 한다.
- 새 접수가 오면 onethehuman@gmail.com 으로 알림 메일을 보낸다.

## 2. 위치·라우팅

- 공개 페이지: `/solidarity/keep-singing-for-palestine`. 정적 라우트 파일 `pages/solidarity/keep-singing-for-palestine.tsx`가 `[slug].tsx`보다 우선하므로 전용 페이지 컴포넌트(`src/pages/KeepSingingPage.tsx`)를 쓴다.
- `src/data/solidarity.ts`의 `eventStructs`에 이 공연을 추가해 `/solidarity` 목록·Event JSON-LD·사이트맵에 자동 포함되게 한다. `getStaticPaths`는 이 slug를 제외한다(정적 파일과 중복 방지).
- 헤더 메뉴는 건드리지 않는다. 홈(`pages/index.tsx`) HeroSection 바로 아래에 공연 CTA 배너(`src/components/home/ConcertBanner.tsx`)를 넣고 공연 다음 날(2026-09-20 KST)부터는 렌더하지 않는다.
- 포스터: `public/images-webp/solidarity/keep-singing-for-palestine.webp`(변환 완료).

## 3. 공개 페이지 디자인

포스터 톤을 계승한 **다크 테마 단독 페이지**. 사이트 기본 팔레트(제주 바다색)와 달리 이 페이지 배경은 `#0a0a0a` 계열, 텍스트는 웜 화이트, 포인트는 팔레스타인 국기 4색(빨강 `#CE1126`, 초록 `#007A3D`, 흰색, 검정). 필름 그레인 오버레이(SVG feTurbulence, 저투명) + 히어로 뒤에 천천히 회전하는 원형 conic-gradient(CD 반사광 은유). `prefers-reduced-motion` 시 정지.

섹션 순서(모두 `useScrollReveal`로 등장):

1. **Hero** — 좌 포스터(4:5), 우 "Keep Singing for Palestine" 영문 디스플레이 + "강정피스앤뮤직캠프 × 팔레스타인해방운동", 일시·장소·가격 요약, 예매 버튼(폼 앵커)·후원 버튼(계좌 앵커).
2. **소개문** — 원문 4문단 그대로. "Keep singing for peace! / Keep singing with us!"는 큰 명조 인용 스타일.
3. **집회 안내 카드** — 14:00 긴급행동 집회, 남수 연대 공연.
4. **라인업** — 4팀. 카드 대신 큰 세로 사진 + 세로쓰기 이름(포스터처럼) 대형 레이아웃, 교차 배치. 각 팀: 사진, 이름, 소개(원문), 링크(캠프 뮤지션 페이지 또는 외부). 이서영(12)·모레도토요일(7)·모모(10)는 `musicians.json`과 사진 재사용, 이형주는 별도 정적 데이터(사진 `public/images-webp/solidarity/lineup/ihyeongju.webp`).
5. **티켓 안내** — 사전 30,000 / 현장 35,000, "구글 예약 순이 아니라 입금 순 마감", 환불 불가.
6. **예매 폼** — 아래 §4.
7. **예매 확인** — 이름+연락처 → 상태 표시.
8. **후원 안내** — 계좌 `농협 352-2296-3136-63 장O나` + 복사 버튼(`CopyButton` 재사용).
9. **오시는 길** — 주소, 네이버/카카오 지도 링크.

i18n: 네임스페이스 `concert_ksfp_2026`(13로케일 + `next-i18next.config.js` ns 등록). ko·en은 실번역, 나머지는 en 기반 번역. 폼 오류 메시지·관리자는 한국어만.

## 4. 예매 폼

필드: 이름(입금자명, 1~40자) / 연락처(휴대폰, 010-XXXX-XXXX로 정규화) / 매수(1~4, 기본 1) / 입금 안내 확인(체크 필수) / 개인정보 동의(체크 필수; 원문 문구 그대로 표시).

제출: `POST /api/solidarity/reservations` JSON `{ name, phone, quantity, privacyAgreed: true, depositAgreed: true }`.

- Zod 검증. 레이트리밋: IP당 10분 5회(`createRateLimiter`), `getClientIp`.
- 같은 `event_slug`+`phone`(정규화) 활성 건이 있으면 409 `{ code: 'duplicate' }` → 화면에 "이미 접수된 연락처입니다. 아래 예매 확인에서 상태를 확인하세요."
- 성공 201 `{ id, quantity, amount }`. 성공 화면: 입금액(매수×30,000)·계좌·복사 버튼·"입금 순으로 확정됩니다" 안내.
- 저장 후 Resend `sendEmail`(from `강정 피스앤뮤직캠프 <admin@peaceandmusic.net>`, to onethehuman@gmail.com)로 알림. 메일 실패는 접수 성공에 영향 없음(로그만).

예매 확인: `POST /api/solidarity/reservations/lookup` `{ name, phone }` → `{ status, quantity, createdAt }` 또는 404. 레이트리밋 IP당 10분 10회. 이름과 연락처가 모두 일치해야 한다.

## 5. DB

마이그레이션 `supabase/migrations/20260903090000_event_reservations.sql`:

```sql
create table public.event_reservations (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  name text not null,
  phone text not null,               -- 정규화 010-0000-0000
  quantity smallint not null check (quantity between 1 and 4),
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  admin_note text,
  privacy_agreed_at timestamptz not null default now(),
  client_ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index event_reservations_active_phone
  on public.event_reservations (event_slug, phone) where status <> 'cancelled';
create index on public.event_reservations (event_slug, created_at desc);
alter table public.event_reservations enable row level security;
-- 공개 정책 없음. 쓰기는 서버 API(service role)만.
create policy admin_read on public.event_reservations for select using (public.is_active_admin());
create policy admin_write on public.event_reservations for update using (public.admin_can_edit());
create policy admin_delete on public.event_reservations for delete using (public.admin_can_edit());
-- updated_at 트리거는 기존 패턴 재사용
```

## 6. 관리자

- 페이지 `pages/admin/reservations.tsx`, `AdminLayout` 메뉴에 "예매 관리" 추가.
- 상단 요약: 접수 건수 / 확정 건수 / 확정 매수 합계 / 확정 금액(×30,000) / 대기 매수.
- 목록: 접수시각·이름·연락처·매수·상태·메모. 검색(이름/연락처), 상태 필터, 정렬은 접수시각 오름차순(입금 순 확인용).
- 행 액션: 입금확인(→confirmed) / 취소(→cancelled) / 대기로(→pending), 메모 인라인 편집. 체크박스 다중 선택 후 일괄 확정.
- CSV 내려받기(UTF-8 BOM, 현장 명단용).
- "전체 폐기" 버튼: `ConfirmDialog` 2단 확인 후 해당 event_slug 전체 삭제. owner만.
- API `pages/api/admin/reservations.ts`: GET(목록+요약, viewer) / PATCH(단건·일괄 상태, 메모, editor) / DELETE(전체 폐기, owner). `board-posts.ts` 패턴 복제. 인증 쿠키 기반 `createSupabaseServerClient` + RLS.

## 7. 테스트·검증

- 단위: phone 정규화, Zod 스키마, 금액 계산, 배너 노출 종료일.
- API: 중복 409, 레이트리밋 429, 검증 400, lookup 불일치 404.
- 브라우저(chrome-devtools MCP): 데스크톱·모바일 스크린샷, 콘솔 에러 0, 폼 제출→성공 화면→예매 확인 흐름, 관리자 상태 토글.
- `pnpm lint`, `pnpm typecheck`(있으면), `pnpm test`, prettier, 빌드.

## 8. 범위 밖

SMS 발송, 온라인 결제, 좌석 지정, 자동 폐기 크론, 헤더 메뉴 변경.
