# 관리자 메일함 (Resend 인바운드 → Supabase → /admin) 설계

작성일: 2026-06-22
대상: `hwangtab/peace` (PUBLIC), Next.js pages router + Supabase + Resend

## 1. 목적
`admin@peaceandmusic.net`으로 오는 메일(특히 회원에게 보낸 인증/공지 메일의 답장)을 별도 메일 클라이언트 없이 **관리자 시스템(/admin) 안에서 읽고 답장**한다. 포워딩 대신 Resend 인바운드(webhook)로 받아 DB에 저장하고, 답장은 Resend 발송 API로 보낸다.

## 2. 확정 사항
- 범위: **읽기 + 답장** (첨부파일은 MVP 제외 — 존재 시 파일명만 표시, 다운로드는 후속).
- webhook 저장에 **Supabase service role** 사용(서버 전용 env). 이 레포 최초 service role 도입이며 webhook 라우트에서만 사용.
- 발송 주소 `admin@peaceandmusic.net`(Resend에서 peaceandmusic.net 도메인 인증 필요). MX는 Resend 수신으로 이미 설정됨.
- 노출된 Resend API 키는 폐기·재발급 후 env에 새 키 사용.

## 3. 데이터 모델 (신규 테이블 `public.mailbox_messages`)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK default gen_random_uuid() | |
| direction | text not null check in ('inbound','outbound') | |
| resend_id | text | 인바운드 Resend 이메일 id, 중복방지 unique(부분 인덱스) |
| from_email | text not null default '' | |
| from_name | text not null default '' | |
| to_email | text not null default '' | |
| subject | text not null default '' | |
| text_body | text not null default '' | |
| html_body | text not null default '' | |
| reply_to_id | uuid references public.mailbox_messages(id) on delete set null | outbound→원본 inbound 연결 |
| is_read | boolean not null default false | inbound 읽음 표시 |
| created_by | text not null default '' | outbound 발송 관리자 email |
| created_at | timestamptz not null default now() | |
- 인덱스: `(direction, created_at desc)`, unique `(resend_id)` where resend_id is not null.
- RLS: select=`is_active_admin()`, insert/update/delete=`admin_can_edit()`, anon 불가. (webhook은 service role로 RLS 우회 insert)

## 4. 컴포넌트
### 4.1 Webhook `pages/api/webhooks/resend-inbound.ts` (공개)
- raw body 읽기(서명 검증용; `export const config = { api: { bodyParser: false } }`).
- **Svix 서명 검증**: 헤더 `svix-id`/`svix-timestamp`/`svix-signature` + `RESEND_WEBHOOK_SECRET`로 검증, 실패 시 401.
- 이벤트가 인바운드 수신이면: payload의 이메일 id로 **Resend API(Get received email)** 호출해 본문(text/html)·발신자·제목 취득.
- service role Supabase 클라이언트로 `mailbox_messages`(direction='inbound') insert. `resend_id` 중복(23505/onConflict)은 무시(idempotent). 성공 200.
- 검증/조회 실패는 적절한 상태코드(Resend가 재시도).

### 4.2 답장 API `pages/api/admin/mailbox/reply.ts` (requireAdminRole 'editor')
- body: `{ reply_to_id(uuid), to(email), subject, text }` (Zod 검증).
- Resend 발송 API로 from=`admin@peaceandmusic.net`, To=원발신자, subject="Re: …"(없으면 그대로), 본문 text/html.
- 성공 시 outbound 행 저장(created_by=session.member.email, reply_to_id 연결). 응답 200 `{ message }`.

### 4.3 읽음 처리 API `pages/api/admin/mailbox/[id].ts` (PATCH, editor+)
- `{ is_read }` 갱신. (또는 reply API/상세 조회 시 함께 처리)

### 4.4 UI `pages/admin/mailbox/index.tsx` (+ 상세)
- SSR: `getAdminSession` 게이트(viewer 열람, editor 답장), service 아닌 admin 세션 클라로 `mailbox_messages` 조회.
- 목록: inbound 메시지(안읽음 강조) + 보낸 답장. 클릭 시 본문 + 답장창(editor+). 읽으면 is_read=true.
- HTML 본문은 신뢰 불가(외부 발신) → **react-markdown 아님**. 안전 렌더: 기본은 text_body를 `whitespace-pre-wrap`로 표시. html_body는 MVP에서 직접 dangerouslySetInnerHTML 하지 않음(XSS 위험) — 텍스트 우선, html은 후속(살균 필요).
- AdminLayout NAV에 "메일함" 추가.

## 5. 환경변수 (Vercel, 서버 전용 — 커밋 금지)
- `RESEND_API_KEY` (발송 + 본문조회)
- `RESEND_WEBHOOK_SECRET` (Svix 서명 검증; Resend 인바운드 webhook 등록 시 발급)
- `SUPABASE_SERVICE_ROLE_KEY` (webhook insert; 서버 전용)
- 발송 주소 상수 `admin@peaceandmusic.net`(코드 상수 가능, 비밀 아님).

## 6. 운영자 사전작업
- 위 env 3개 Vercel 등록 / Resend 인바운드 webhook URL `https://peaceandmusic.net/api/webhooks/resend-inbound` 등록 후 서명 시크릿 복사 / Resend에서 peaceandmusic.net 도메인 인증(발송) / 노출 키 재발급.

## 7. 보안
- webhook은 Svix 서명으로만 신뢰. service role 키는 서버 env, 공개 노출 없음.
- 외부 메일 HTML은 살균 없이 렌더하지 않음(텍스트 우선) — XSS 차단.
- 답장은 editor+; 메일함 열람은 viewer+; RLS 이중 방어.
- 레포 PUBLIC: 키/시크릿은 전부 env, 코드/문서에 비노출.

## 8. 테스트
- 순수 검증(답장 폼 Zod, 제목 "Re:" 정규화) 단위 테스트.
- Svix 검증은 라이브러리(svix) 사용; webhook 통합은 수동 + typecheck/build.
- tsc/eslint/prettier/jest/build 통과, i18n 영향 없음(admin 한국어).

## 9. 범위 밖(YAGNI)
첨부 다운로드, 대화 스레드 그룹핑, HTML 본문 살균 렌더, 라벨/검색/페이지네이션(초기엔 최근 N개) — 후속.
