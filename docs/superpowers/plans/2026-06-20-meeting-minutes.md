# 기획단 회의록 시스템 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기획단(관리자) 전용 비공개 회의록 시스템 — 회의 목록/상세, 회의록 본문(마크다운), 일시·장소, 안건 관리, 참석자 기록, 첨부파일(비공개 버킷)을 `/admin/meetings`에 추가한다.

**Architecture:** 기존 peace admin 시스템(owner/editor/viewer) 위에 올린다. 신규 테이블 4개(`meetings`, `meeting_agendas`, `meeting_attendees`, `meeting_attachments`) + 비공개 storage 버킷 `meeting-files`. RLS는 `is_active_admin()`(읽기)·`admin_can_edit()`(쓰기)로 admin_documents 패턴을 그대로 따른다(admin 전용 테이블이므로 컬럼 레벨 grant·enforce 트리거 불필요). 페이지는 SSR로 직접 읽고(getServerSideProps + supabase), 변경은 `/api/admin/*` 라우트(requireAdminRole)로만 수행한 뒤 `router.replace`로 재조회한다. 첨부 파일은 클라이언트가 비공개 버킷에 직접 업로드하고 메타데이터만 API에 등록하며, 다운로드는 signed URL로 한다.

**Tech Stack:** Next.js pages router(^16.2.4), React 18, TypeScript, Supabase(@supabase/ssr 0.12, anon key + 쿠키 세션, RLS), zod ^4, react-markdown ^10 + remark-gfm ^4, Tailwind(커스텀 토큰), Jest(next/jest), pnpm.

## Global Constraints

- **저장소 hwangtab/peace는 PUBLIC** — 비밀키/민감정보를 커밋하지 말 것. 회의록 본문·첨부는 DB/비공개 버킷에만 존재(공개 노출 0).
- **회의록은 관리자 전용 비공개** — 어떤 테이블/버킷/정책도 `anon`에 grant하거나 공개 노출하지 말 것. grant 대상은 `authenticated`만.
- **권한 매핑 고정**: 읽기(SELECT/페이지 열람) = viewer 이상(`is_active_admin()` / `getAdminSession`), 쓰기(INSERT/UPDATE/DELETE/API 변경) = editor 이상(`admin_can_edit()` / `requireAdminRole(req,res,'editor')`). 쓰기에 `is_active_admin()`을 쓰면 viewer가 변경 가능해지는 보안 회귀이므로 금지.
- **헬퍼 호출은 반드시 `public.` 접두사**: `public.is_active_admin()`, `public.admin_can_edit()`, `public.set_updated_at()`. set_updated_at()는 이미 정의돼 있으니 재정의하지 말고 호출만.
- **마이그레이션 멱등성**: 테이블/인덱스는 `create ... if not exists`, 정책/트리거는 `drop ... if exists` 선행, 버킷 insert는 `on conflict (id) do nothing`.
- **감사 컬럼**(`created_by`/`uploaded_by`)에는 `session.member.email`(text)을 기록한다(admin_documents.updated_by 관례). FK·SET NULL 사용 안 함. admin 전용이므로 컬럼 레벨 grant는 두지 않는다(admin_documents와 동일 신뢰 모델).
- **admin 페이지는 i18n 미사용** — 모든 라벨/문구를 한국어로 하드코딩.
- **타입 관례**: DB 매핑 타입은 `interface`, 필드 snake_case, id/FK/timestamp는 `string`, nullable은 `T | null`, status는 문자열 리터럴 유니온(enum 금지).
- **검증 함수 관례**: throw 대신 판별 유니온 `Ok<T> = {ok:true;value:T}` / `Err = {ok:false;reason:string}` 반환, reason은 한국어. `src/lib/<feature>Forms.ts` + 같은 폴더 `<feature>Forms.test.ts`.
- **API import 4줄 고정**: `import type { NextApiRequest, NextApiResponse } from 'next';` / `import { z, ZodError } from 'zod';` / `import { requireAdminRole } from '@/lib/adminAuth';` / `import { createSupabaseServerClient } from '@/lib/supabaseServer';`
- **에러 응답 규약**: 400 `{error}`(검증 실패; URL 파라미터는 `'invalid_xxx'`, body는 `getErrorMessage`), 404 `{error:'...찾을 수 없습니다.'}`(한국어), 405 `{error:'method_not_allowed'}`(+`res.setHeader('Allow', ...)`), 500 `{error: error.message}`. 401/403은 절대 핸들러에서 직접 쓰지 말 것 — `requireAdminRole`이 처리(`if (!session) return;`).
- **브라우저 supabase 클라이언트는 `createSupabaseBrowserClient` (`@/lib/supabaseBrowser`)만 사용.** `createClient` 직접 호출 금지.
- **Tailwind 색 토큰**: `deep-ocean`, `jeju-ocean`, `sunset-coral`, `coastal-gray`, `ocean-sand`. 성공=jeju-ocean, 에러/위험=sunset-coral. 제목 폰트 `font-display`.
- **실행 명령(pnpm 환경, 직접 바이너리)**: 테스트 `node node_modules/jest/bin/jest.js <path>`, 타입체크 `node node_modules/typescript/bin/tsc --noEmit --pretty false`, 린트 `node node_modules/eslint/bin/eslint.js <path>`, 빌드 `node node_modules/next/dist/bin/next build`.

---

## File Structure

신규/수정 파일과 책임:

- `supabase/migrations/<timestamp>_meeting_minutes.sql` (생성) — 4개 테이블 + RLS + 비공개 버킷 + 트리거. (Task 1)
- `src/types/meeting.ts` (생성) — `Meeting`, `MeetingAgenda`, `MeetingAttendee`, `MeetingAttachment`, 상태 유니온 타입. (Task 2)
- `src/lib/meetingForms.ts` (생성) + `src/lib/meetingForms.test.ts` (생성) — 순수 검증 함수 + 상태 상수/라벨. (Task 2)
- `pages/api/admin/meetings.ts` (생성) — POST 회의 생성. (Task 3)
- `pages/api/admin/meetings/[id].ts` (생성) — PATCH 회의/회의록/상태 수정, DELETE 회의(+첨부 storage 정리). (Task 3)
- `pages/api/admin/meeting-agendas.ts` (생성) — POST/PATCH/DELETE 안건. (Task 4)
- `pages/api/admin/meeting-attendees.ts` (생성) — POST/DELETE 참석자. (Task 4)
- `pages/api/admin/meeting-attachments.ts` (생성) — POST 메타 등록, DELETE 메타+storage 객체. (Task 4)
- `src/components/admin/AdminLayout.tsx` (수정) — NAV_ITEMS에 `회의록` 추가. (Task 5)
- `pages/admin/meetings/index.tsx` (생성) — 회의 목록(연도 그룹 + 상태 배지 + 새 회의). (Task 5)
- `pages/admin/meetings/new.tsx` (생성) — 새 회의 생성 폼. (Task 5)
- `pages/admin/meetings/[id].tsx` (생성) — 회의 상세(정보/상태/삭제 + 하위 섹션 조립). (Task 6~8에서 점증)
- `src/components/admin/meeting/MeetingMinutesEditor.tsx` (생성) — 회의록 본문 보기/편집 토글. (Task 6)
- `src/components/admin/meeting/AgendaSection.tsx` (생성) — 안건 목록/추가/상태/삭제. (Task 7)
- `src/components/admin/meeting/AttendeeSection.tsx` (생성) — 참석자 목록/추가/삭제. (Task 7)
- `src/components/admin/meeting/AttachmentSection.tsx` (생성) — 첨부 업로드/다운로드(signed URL)/삭제. (Task 8)

데이터 흐름: 페이지 `getServerSideProps`(SSR) → supabase 직접 읽기 → props(useState 초기값). 변경은 컴포넌트가 `/api/admin/*`에 `fetch` → 성공 시 `router.replace(router.asPath)`로 SSR 재실행. 첨부 업로드/다운로드만 클라이언트가 `createSupabaseBrowserClient`로 storage에 직접 접근(메타 CRUD는 API 경유).

---

## Task 1: 마이그레이션 — 테이블 4개 + RLS + 비공개 버킷 + 트리거

**Files:**
- Create: `supabase/migrations/<timestamp>_meeting_minutes.sql` (파일은 `supabase migration new meeting_minutes`로 생성)

**Interfaces:**
- Consumes: 기존 헬퍼 `public.is_active_admin()`, `public.admin_can_edit()`, `public.set_updated_at()` (이전 마이그레이션에 정의됨).
- Produces: 테이블 `public.meetings`, `public.meeting_agendas`, `public.meeting_attendees`, `public.meeting_attachments`; 비공개 버킷 `meeting-files`. 컬럼 셰이프는 Task 2의 타입과 Task 3/4의 API가 의존.

- [ ] **Step 1: 마이그레이션 파일 생성**

Run:
```bash
supabase migration new meeting_minutes
```
Expected: `supabase/migrations/<timestamp>_meeting_minutes.sql` 빈 파일 생성. 출력된 경로를 이후 단계에서 사용.

- [ ] **Step 2: 테이블 + 인덱스 DDL 작성**

생성된 파일에 작성:
```sql
-- 기획단 회의록 시스템: 회의/안건/참석자/첨부 (관리자 전용 비공개)

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meeting_date date,
  meeting_time text not null default '',
  location text not null default '',
  status text not null default 'scheduled',
  minutes_md text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meetings_title_len check (char_length(title) between 1 and 200),
  constraint meetings_status_check check (status in ('scheduled', 'completed'))
);
create index if not exists meetings_date_idx on public.meetings (meeting_date desc, created_at desc);

create table if not exists public.meeting_agendas (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  title text not null,
  content text not null default '',
  sort_order int not null default 0,
  status text not null default 'proposed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meeting_agendas_title_len check (char_length(title) between 1 and 200),
  constraint meeting_agendas_status_check check (status in ('proposed', 'discussed', 'resolved'))
);
create index if not exists meeting_agendas_meeting_idx on public.meeting_agendas (meeting_id, sort_order, created_at);

create table if not exists public.meeting_attendees (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  name text not null,
  note text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint meeting_attendees_name_len check (char_length(name) between 1 and 50)
);
create index if not exists meeting_attendees_meeting_idx on public.meeting_attendees (meeting_id, sort_order, created_at);

create table if not exists public.meeting_attachments (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_size bigint,
  mime_type text,
  uploaded_by text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists meeting_attachments_meeting_idx on public.meeting_attachments (meeting_id, created_at desc);
```

- [ ] **Step 3: RLS 활성화 + authenticated 전용 grant (anon 제외)**

이어서 작성:
```sql
alter table public.meetings enable row level security;
alter table public.meeting_agendas enable row level security;
alter table public.meeting_attendees enable row level security;
alter table public.meeting_attachments enable row level security;

-- Intentionally NOT granted to anon. 회의록은 관리자 전용 비공개.
grant select, insert, update, delete on public.meetings to authenticated;
grant select, insert, update, delete on public.meeting_agendas to authenticated;
grant select, insert, update, delete on public.meeting_attendees to authenticated;
grant select, insert, update, delete on public.meeting_attachments to authenticated;
```

- [ ] **Step 4: RLS 정책 작성 (select=is_active_admin, 쓰기=admin_can_edit)**

이어서 작성 — 4개 테이블 각각 select/insert/update/delete 4정책:
```sql
-- meetings
drop policy if exists "active admins read meetings" on public.meetings;
create policy "active admins read meetings" on public.meetings
for select to authenticated using (public.is_active_admin());
drop policy if exists "editors insert meetings" on public.meetings;
create policy "editors insert meetings" on public.meetings
for insert to authenticated with check (public.admin_can_edit());
drop policy if exists "editors update meetings" on public.meetings;
create policy "editors update meetings" on public.meetings
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());
drop policy if exists "editors delete meetings" on public.meetings;
create policy "editors delete meetings" on public.meetings
for delete to authenticated using (public.admin_can_edit());

-- meeting_agendas
drop policy if exists "active admins read agendas" on public.meeting_agendas;
create policy "active admins read agendas" on public.meeting_agendas
for select to authenticated using (public.is_active_admin());
drop policy if exists "editors insert agendas" on public.meeting_agendas;
create policy "editors insert agendas" on public.meeting_agendas
for insert to authenticated with check (public.admin_can_edit());
drop policy if exists "editors update agendas" on public.meeting_agendas;
create policy "editors update agendas" on public.meeting_agendas
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());
drop policy if exists "editors delete agendas" on public.meeting_agendas;
create policy "editors delete agendas" on public.meeting_agendas
for delete to authenticated using (public.admin_can_edit());

-- meeting_attendees
drop policy if exists "active admins read attendees" on public.meeting_attendees;
create policy "active admins read attendees" on public.meeting_attendees
for select to authenticated using (public.is_active_admin());
drop policy if exists "editors insert attendees" on public.meeting_attendees;
create policy "editors insert attendees" on public.meeting_attendees
for insert to authenticated with check (public.admin_can_edit());
drop policy if exists "editors update attendees" on public.meeting_attendees;
create policy "editors update attendees" on public.meeting_attendees
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());
drop policy if exists "editors delete attendees" on public.meeting_attendees;
create policy "editors delete attendees" on public.meeting_attendees
for delete to authenticated using (public.admin_can_edit());

-- meeting_attachments
drop policy if exists "active admins read attachments" on public.meeting_attachments;
create policy "active admins read attachments" on public.meeting_attachments
for select to authenticated using (public.is_active_admin());
drop policy if exists "editors insert attachments" on public.meeting_attachments;
create policy "editors insert attachments" on public.meeting_attachments
for insert to authenticated with check (public.admin_can_edit());
drop policy if exists "editors update attachments" on public.meeting_attachments;
create policy "editors update attachments" on public.meeting_attachments
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());
drop policy if exists "editors delete attachments" on public.meeting_attachments;
create policy "editors delete attachments" on public.meeting_attachments
for delete to authenticated using (public.admin_can_edit());
```

- [ ] **Step 5: updated_at 트리거 (meetings, meeting_agendas)**

이어서 작성 (attendees/attachments는 updated_at 컬럼이 없으므로 트리거 없음):
```sql
drop trigger if exists set_meetings_updated_at on public.meetings;
create trigger set_meetings_updated_at before update on public.meetings
for each row execute function public.set_updated_at();

drop trigger if exists set_meeting_agendas_updated_at on public.meeting_agendas;
create trigger set_meeting_agendas_updated_at before update on public.meeting_agendas
for each row execute function public.set_updated_at();
```

- [ ] **Step 6: 비공개 storage 버킷 + storage.objects 정책**

이어서 작성:
```sql
-- 비공개 버킷 (public=false): 공개 URL 없음, signed URL 또는 admin 세션으로만 접근
insert into storage.buckets (id, name, public) values ('meeting-files', 'meeting-files', false)
on conflict (id) do nothing;

-- 용량 제한 20MB. MIME 화이트리스트는 두지 않는다(문서 유형이 다양하고 hwp 등은 브라우저 MIME가 비어
-- 정상 업로드가 막히므로). 클라이언트가 확장자 화이트리스트로 1차 검증하고, 버킷은 admin 전용 + 용량으로 방어.
update storage.buckets set file_size_limit = 20971520 where id = 'meeting-files';

drop policy if exists "active admins read meeting files" on storage.objects;
create policy "active admins read meeting files" on storage.objects
for select to authenticated using (bucket_id = 'meeting-files' and public.is_active_admin());
drop policy if exists "editors upload meeting files" on storage.objects;
create policy "editors upload meeting files" on storage.objects
for insert to authenticated with check (bucket_id = 'meeting-files' and public.admin_can_edit());
drop policy if exists "editors update meeting files" on storage.objects;
create policy "editors update meeting files" on storage.objects
for update to authenticated
using (bucket_id = 'meeting-files' and public.admin_can_edit())
with check (bucket_id = 'meeting-files' and public.admin_can_edit());
drop policy if exists "editors delete meeting files" on storage.objects;
create policy "editors delete meeting files" on storage.objects
for delete to authenticated using (bucket_id = 'meeting-files' and public.admin_can_edit());
```

- [ ] **Step 7: 원격 적용**

Run:
```bash
supabase db push
```
Expected: 새 마이그레이션이 원격에 적용됨(`Applying migration <timestamp>_meeting_minutes.sql...` → 성공). 에러 없이 완료.

- [ ] **Step 8: 적용 검증**

Run:
```bash
supabase migration list
```
Expected: `<timestamp>_meeting_minutes`가 Local·Remote 양쪽에 표시(동기화됨).

- [ ] **Step 9: 커밋**

```bash
git add supabase/migrations/
git commit -m "feat(meetings): 회의록 테이블·RLS·비공개 버킷 마이그레이션"
```

---

## Task 2: 타입 + 순수 검증 라이브러리 (TDD)

**Files:**
- Create: `src/types/meeting.ts`
- Create: `src/lib/meetingForms.ts`
- Test: `src/lib/meetingForms.test.ts`

**Interfaces:**
- Produces:
  - 타입: `MeetingStatus = 'scheduled' | 'completed'`, `AgendaStatus = 'proposed' | 'discussed' | 'resolved'`, 인터페이스 `Meeting`, `MeetingAgenda`, `MeetingAttendee`, `MeetingAttachment`.
  - 검증 함수(모두 `Ok<T> | Err` 반환, `Ok<T> = {ok:true;value:T}`, `Err = {ok:false;reason:string}`):
    - `validateMeetingTitle(v: string): Ok<string> | Err`
    - `validateMeetingDate(v: string): Ok<string | null> | Err`
    - `validateMeetingTime(v: string): Ok<string> | Err`
    - `validateLocation(v: string): Ok<string> | Err`
    - `validateMinutes(v: string): Ok<string> | Err`
    - `validateAgendaTitle(v: string): Ok<string> | Err`
    - `validateAgendaContent(v: string): Ok<string> | Err`
    - `validateAttendeeName(v: string): Ok<string> | Err`
    - `validateAttendeeNote(v: string): Ok<string> | Err`
  - 상태 유틸: `isMeetingStatus(v: string): boolean`, `isAgendaStatus(v: string): boolean`, 상수 `MEETING_STATUS_LABELS: Record<MeetingStatus, string>`, `AGENDA_STATUS_LABELS: Record<AgendaStatus, string>`.

- [ ] **Step 1: 타입 파일 작성** (테스트 없음 — 순수 타입 선언)

Create `src/types/meeting.ts`:
```ts
export type MeetingStatus = 'scheduled' | 'completed';
export type AgendaStatus = 'proposed' | 'discussed' | 'resolved';

export interface Meeting {
  id: string;
  title: string;
  meeting_date: string | null;
  meeting_time: string;
  location: string;
  status: MeetingStatus;
  minutes_md: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingAgenda {
  id: string;
  meeting_id: string;
  title: string;
  content: string;
  sort_order: number;
  status: AgendaStatus;
  created_at: string;
  updated_at: string;
}

export interface MeetingAttendee {
  id: string;
  meeting_id: string;
  name: string;
  note: string;
  sort_order: number;
  created_at: string;
}

export interface MeetingAttachment {
  id: string;
  meeting_id: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
}
```

- [ ] **Step 2: 실패하는 테스트 작성**

Create `src/lib/meetingForms.test.ts`:
```ts
import {
  validateMeetingTitle,
  validateMeetingDate,
  validateMeetingTime,
  validateLocation,
  validateMinutes,
  validateAgendaTitle,
  validateAgendaContent,
  validateAttendeeName,
  validateAttendeeNote,
  isMeetingStatus,
  isAgendaStatus,
  MEETING_STATUS_LABELS,
  AGENDA_STATUS_LABELS,
} from './meetingForms';

describe('validateMeetingTitle', () => {
  it('trims and accepts 1-200 chars', () => {
    expect(validateMeetingTitle('  6월 정기회의  ')).toEqual({ ok: true, value: '6월 정기회의' });
  });
  it('rejects empty', () => {
    expect(validateMeetingTitle('   ').ok).toBe(false);
  });
  it('rejects >200', () => {
    expect(validateMeetingTitle('a'.repeat(201)).ok).toBe(false);
  });
});

describe('validateMeetingDate', () => {
  it('accepts empty as null', () => {
    expect(validateMeetingDate('')).toEqual({ ok: true, value: null });
    expect(validateMeetingDate('   ')).toEqual({ ok: true, value: null });
  });
  it('accepts YYYY-MM-DD', () => {
    expect(validateMeetingDate('2026-06-20')).toEqual({ ok: true, value: '2026-06-20' });
  });
  it('rejects bad format', () => {
    expect(validateMeetingDate('2026/06/20').ok).toBe(false);
    expect(validateMeetingDate('20-06-2026').ok).toBe(false);
  });
  it('rejects impossible date', () => {
    expect(validateMeetingDate('2026-13-01').ok).toBe(false);
    expect(validateMeetingDate('2026-02-30').ok).toBe(false);
  });
});

describe('validateMeetingTime', () => {
  it('accepts empty', () => {
    expect(validateMeetingTime('')).toEqual({ ok: true, value: '' });
  });
  it('trims and accepts free text up to 20', () => {
    expect(validateMeetingTime('  19:00  ')).toEqual({ ok: true, value: '19:00' });
  });
  it('rejects >20', () => {
    expect(validateMeetingTime('a'.repeat(21)).ok).toBe(false);
  });
});

describe('validateLocation', () => {
  it('accepts empty and trims', () => {
    expect(validateLocation('')).toEqual({ ok: true, value: '' });
    expect(validateLocation('  강정 평화센터  ')).toEqual({ ok: true, value: '강정 평화센터' });
  });
  it('rejects >200', () => {
    expect(validateLocation('a'.repeat(201)).ok).toBe(false);
  });
});

describe('validateMinutes', () => {
  it('accepts empty', () => {
    expect(validateMinutes('')).toEqual({ ok: true, value: '' });
  });
  it('does not trim leading/trailing newlines content but accepts large markdown', () => {
    expect(validateMinutes('# 회의록\n내용').ok).toBe(true);
  });
  it('rejects >100000', () => {
    expect(validateMinutes('a'.repeat(100001)).ok).toBe(false);
  });
});

describe('validateAgendaTitle', () => {
  it('accepts 1-200 trimmed', () => {
    expect(validateAgendaTitle('  예산 승인  ')).toEqual({ ok: true, value: '예산 승인' });
  });
  it('rejects empty and >200', () => {
    expect(validateAgendaTitle('  ').ok).toBe(false);
    expect(validateAgendaTitle('a'.repeat(201)).ok).toBe(false);
  });
});

describe('validateAgendaContent', () => {
  it('accepts empty and trims', () => {
    expect(validateAgendaContent('')).toEqual({ ok: true, value: '' });
  });
  it('rejects >10000', () => {
    expect(validateAgendaContent('a'.repeat(10001)).ok).toBe(false);
  });
});

describe('validateAttendeeName', () => {
  it('accepts 1-50 trimmed', () => {
    expect(validateAttendeeName('  홍길동  ')).toEqual({ ok: true, value: '홍길동' });
  });
  it('rejects empty and >50', () => {
    expect(validateAttendeeName('   ').ok).toBe(false);
    expect(validateAttendeeName('a'.repeat(51)).ok).toBe(false);
  });
});

describe('validateAttendeeNote', () => {
  it('accepts empty and trims', () => {
    expect(validateAttendeeNote('')).toEqual({ ok: true, value: '' });
    expect(validateAttendeeNote('  진행  ')).toEqual({ ok: true, value: '진행' });
  });
  it('rejects >200', () => {
    expect(validateAttendeeNote('a'.repeat(201)).ok).toBe(false);
  });
});

describe('status helpers', () => {
  it('isMeetingStatus', () => {
    expect(isMeetingStatus('scheduled')).toBe(true);
    expect(isMeetingStatus('completed')).toBe(true);
    expect(isMeetingStatus('done')).toBe(false);
  });
  it('isAgendaStatus', () => {
    expect(isAgendaStatus('proposed')).toBe(true);
    expect(isAgendaStatus('resolved')).toBe(true);
    expect(isAgendaStatus('open')).toBe(false);
  });
  it('label maps cover all statuses (Korean)', () => {
    expect(MEETING_STATUS_LABELS.scheduled).toBe('예정');
    expect(MEETING_STATUS_LABELS.completed).toBe('완료');
    expect(AGENDA_STATUS_LABELS.proposed).toBe('제안');
    expect(AGENDA_STATUS_LABELS.discussed).toBe('논의');
    expect(AGENDA_STATUS_LABELS.resolved).toBe('의결');
  });
});
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

Run:
```bash
node node_modules/jest/bin/jest.js src/lib/meetingForms.test.ts
```
Expected: FAIL — `Cannot find module './meetingForms'` (구현 파일 없음).

- [ ] **Step 4: 검증 라이브러리 구현**

Create `src/lib/meetingForms.ts`:
```ts
import type { MeetingStatus, AgendaStatus } from '@/types/meeting';

const trimmed = (v: string) => (v ?? '').trim();

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; reason: string };

const lenInRange = (
  v: string,
  min: number,
  max: number,
  reason: string
): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < min || t.length > max) return { ok: false, reason };
  return { ok: true, value: t };
};

export const validateMeetingTitle = (v: string): Ok<string> | Err =>
  lenInRange(v, 1, 200, '제목은 1~200자여야 합니다.');

export const validateMeetingDate = (v: string): Ok<string | null> | Err => {
  const t = trimmed(v);
  if (t.length === 0) return { ok: true, value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    return { ok: false, reason: '날짜 형식은 YYYY-MM-DD여야 합니다.' };
  }
  const [y, m, d] = t.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return { ok: false, reason: '존재하지 않는 날짜입니다.' };
  }
  return { ok: true, value: t };
};

export const validateMeetingTime = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length > 20) return { ok: false, reason: '시간은 20자 이하여야 합니다.' };
  return { ok: true, value: t };
};

export const validateLocation = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length > 200) return { ok: false, reason: '장소는 200자 이하여야 합니다.' };
  return { ok: true, value: t };
};

export const validateMinutes = (v: string): Ok<string> | Err => {
  const s = v ?? '';
  if (s.length > 100000) return { ok: false, reason: '회의록은 100000자 이하여야 합니다.' };
  return { ok: true, value: s };
};

export const validateAgendaTitle = (v: string): Ok<string> | Err =>
  lenInRange(v, 1, 200, '안건 제목은 1~200자여야 합니다.');

export const validateAgendaContent = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length > 10000) return { ok: false, reason: '안건 내용은 10000자 이하여야 합니다.' };
  return { ok: true, value: t };
};

export const validateAttendeeName = (v: string): Ok<string> | Err =>
  lenInRange(v, 1, 50, '참석자 이름은 1~50자여야 합니다.');

export const validateAttendeeNote = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length > 200) return { ok: false, reason: '비고는 200자 이하여야 합니다.' };
  return { ok: true, value: t };
};

export const MEETING_STATUSES: MeetingStatus[] = ['scheduled', 'completed'];
export const AGENDA_STATUSES: AgendaStatus[] = ['proposed', 'discussed', 'resolved'];

export const isMeetingStatus = (v: string): v is MeetingStatus =>
  (MEETING_STATUSES as string[]).includes(v);
export const isAgendaStatus = (v: string): v is AgendaStatus =>
  (AGENDA_STATUSES as string[]).includes(v);

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: '예정',
  completed: '완료',
};
export const AGENDA_STATUS_LABELS: Record<AgendaStatus, string> = {
  proposed: '제안',
  discussed: '논의',
  resolved: '의결',
};
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

Run:
```bash
node node_modules/jest/bin/jest.js src/lib/meetingForms.test.ts
```
Expected: PASS — 모든 describe 블록 통과.

- [ ] **Step 6: 타입체크**

Run:
```bash
node node_modules/typescript/bin/tsc --noEmit --pretty false
```
Expected: 에러 없음(exit 0).

- [ ] **Step 7: 커밋**

```bash
git add src/types/meeting.ts src/lib/meetingForms.ts src/lib/meetingForms.test.ts
git commit -m "feat(meetings): 회의록 타입 + 순수 검증 라이브러리"
```

---

## Task 3: 회의 핵심 API (생성/수정/삭제)

**Files:**
- Create: `pages/api/admin/meetings.ts`
- Create: `pages/api/admin/meetings/[id].ts`

**Interfaces:**
- Consumes: `requireAdminRole` (`@/lib/adminAuth`), `createSupabaseServerClient` (`@/lib/supabaseServer`), 테이블 `meetings`/`meeting_attachments`(Task 1), 타입 `Meeting`(Task 2).
- Produces:
  - `POST /api/admin/meetings` body `{ title, meeting_date, meeting_time, location }` → 201? 아님 200 `{ meeting: Meeting }` (생성한 회의, id 포함). created_by는 서버가 `session.member.email`로 설정.
  - `PATCH /api/admin/meetings/[id]` body 부분 `{ title?, meeting_date?, meeting_time?, location?, status?, minutes_md? }` → 200 `{ meeting: Meeting }`.
  - `DELETE /api/admin/meetings/[id]` → 첨부 storage 객체 best-effort 정리 후 회의 삭제(cascade) → 200 `{ ok: true }`.

- [ ] **Step 1: `pages/api/admin/meetings.ts` 작성 (POST 생성)**

Create `pages/api/admin/meetings.ts`:
```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const emptyToNull = (v: unknown) =>
  typeof v === 'string' && v.trim() ? v.trim() : null;
const blankToEmpty = (v: unknown) =>
  typeof v === 'string' && v.trim() ? v.trim() : '';

const createSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '제목은 필수입니다.')
    .max(200, '제목은 200자 이하여야 합니다.'),
  meeting_date: z.preprocess(
    emptyToNull,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD여야 합니다.')
      .nullable()
  ),
  meeting_time: z.preprocess(blankToEmpty, z.string().max(20, '시간은 20자 이하여야 합니다.')),
  location: z.preprocess(blankToEmpty, z.string().max(200, '장소는 200자 이하여야 합니다.')),
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          title: body.title,
          meeting_date: body.meeting_date,
          meeting_time: body.meeting_time,
          location: body.location,
          created_by: session.member.email,
        })
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ meeting: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'POST');
  res.status(405).json({ error: 'method_not_allowed' });
}
```

- [ ] **Step 2: `pages/api/admin/meetings/[id].ts` 작성 (PATCH/DELETE)**

Create `pages/api/admin/meetings/[id].ts`:
```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const emptyToNull = (v: unknown) =>
  typeof v === 'string' && v.trim() ? v.trim() : null;
const blankToEmpty = (v: unknown) =>
  typeof v === 'string' && v.trim() ? v.trim() : '';

const updateSchema = z
  .object({
    title: z.string().trim().min(1, '제목은 필수입니다.').max(200, '제목은 200자 이하여야 합니다.').optional(),
    meeting_date: z
      .preprocess(
        emptyToNull,
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD여야 합니다.')
          .nullable()
      )
      .optional(),
    meeting_time: z.preprocess(blankToEmpty, z.string().max(20, '시간은 20자 이하여야 합니다.')).optional(),
    location: z.preprocess(blankToEmpty, z.string().max(200, '장소는 200자 이하여야 합니다.')).optional(),
    status: z.enum(['scheduled', 'completed']).optional(),
    minutes_md: z.string().max(100000, '회의록은 100000자 이하여야 합니다.').optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: '변경할 필드가 하나 이상 필요합니다.',
  });

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsedId = z.string().uuid().safeParse(req.query.id);
  if (!parsedId.success) {
    res.status(400).json({ error: 'invalid_id' });
    return;
  }
  const id = parsedId.data;

  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'PATCH') {
    try {
      const body = updateSchema.parse(req.body);

      const target = await supabase.from('meetings').select('id').eq('id', id).maybeSingle();
      if (target.error) {
        res.status(500).json({ error: target.error.message });
        return;
      }
      if (!target.data) {
        res.status(404).json({ error: '회의를 찾을 수 없습니다.' });
        return;
      }

      const { data, error } = await supabase
        .from('meetings')
        .update(body)
        .eq('id', id)
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ meeting: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'DELETE') {
    const target = await supabase.from('meetings').select('id').eq('id', id).maybeSingle();
    if (target.error) {
      res.status(500).json({ error: target.error.message });
      return;
    }
    if (!target.data) {
      res.status(404).json({ error: '회의를 찾을 수 없습니다.' });
      return;
    }

    // 첨부 storage 객체 best-effort 정리 (DB 행은 cascade 삭제됨)
    const attachments = await supabase
      .from('meeting_attachments')
      .select('file_path')
      .eq('meeting_id', id);
    const paths = (attachments.data ?? [])
      .map((row) => row.file_path as string)
      .filter(Boolean);
    if (paths.length > 0) {
      try {
        await supabase.storage.from('meeting-files').remove(paths);
      } catch {
        // 스토리지 정리는 best-effort — 실패해도 회의 삭제는 진행
      }
    }

    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
```

- [ ] **Step 3: 타입체크**

Run:
```bash
node node_modules/typescript/bin/tsc --noEmit --pretty false
```
Expected: 에러 없음(exit 0).

- [ ] **Step 4: 린트**

Run:
```bash
node node_modules/eslint/bin/eslint.js pages/api/admin/meetings.ts "pages/api/admin/meetings/[id].ts"
```
Expected: 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add pages/api/admin/meetings.ts "pages/api/admin/meetings/[id].ts"
git commit -m "feat(meetings): 회의 생성/수정/삭제 API"
```

---

## Task 4: 안건·참석자·첨부 메타 API

**Files:**
- Create: `pages/api/admin/meeting-agendas.ts`
- Create: `pages/api/admin/meeting-attendees.ts`
- Create: `pages/api/admin/meeting-attachments.ts`

**Interfaces:**
- Consumes: `requireAdminRole`, `createSupabaseServerClient`, 테이블 `meeting_agendas`/`meeting_attendees`/`meeting_attachments`(Task 1).
- Produces:
  - `meeting-agendas`: `POST {meeting_id,title,content}` → `{agenda}`; `PATCH {id,title?,content?,status?,sort_order?}` → `{agenda}`; `DELETE {id}` → `{ok:true}`.
  - `meeting-attendees`: `POST {meeting_id,name,note}` → `{attendee}`; `DELETE {id}` → `{ok:true}`.
  - `meeting-attachments`: `POST {meeting_id,file_path,file_name,file_size?,mime_type?}` → `{attachment}` (uploaded_by는 서버가 email로); `DELETE {id}` → storage 객체 제거 후 `{ok:true}`.

- [ ] **Step 1: `pages/api/admin/meeting-agendas.ts` 작성**

Create `pages/api/admin/meeting-agendas.ts`:
```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const blankToEmpty = (v: unknown) =>
  typeof v === 'string' && v.trim() ? v.trim() : '';

const createSchema = z.object({
  meeting_id: z.string().uuid(),
  title: z.string().trim().min(1, '안건 제목은 필수입니다.').max(200, '안건 제목은 200자 이하여야 합니다.'),
  content: z.preprocess(blankToEmpty, z.string().max(10000, '안건 내용은 10000자 이하여야 합니다.')),
});

const updateSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(200).optional(),
    content: z.preprocess(blankToEmpty, z.string().max(10000)).optional(),
    status: z.enum(['proposed', 'discussed', 'resolved']).optional(),
    sort_order: z.number().int().min(0).optional(),
  })
  .refine(
    (v) =>
      v.title !== undefined ||
      v.content !== undefined ||
      v.status !== undefined ||
      v.sort_order !== undefined,
    { message: '변경할 필드가 하나 이상 필요합니다.' }
  );

const deleteSchema = z.object({ id: z.string().uuid() });

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      const { data, error } = await supabase
        .from('meeting_agendas')
        .insert({ meeting_id: body.meeting_id, title: body.title, content: body.content })
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ agenda: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = updateSchema.parse(req.body);
      const { id, ...fields } = body;

      const target = await supabase.from('meeting_agendas').select('id').eq('id', id).maybeSingle();
      if (target.error) {
        res.status(500).json({ error: target.error.message });
        return;
      }
      if (!target.data) {
        res.status(404).json({ error: '안건을 찾을 수 없습니다.' });
        return;
      }

      const { data, error } = await supabase
        .from('meeting_agendas')
        .update(fields)
        .eq('id', id)
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ agenda: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = deleteSchema.parse(req.body);
      const { error } = await supabase.from('meeting_agendas').delete().eq('id', body.id);
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'POST, PATCH, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
```

- [ ] **Step 2: `pages/api/admin/meeting-attendees.ts` 작성**

Create `pages/api/admin/meeting-attendees.ts`:
```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const blankToEmpty = (v: unknown) =>
  typeof v === 'string' && v.trim() ? v.trim() : '';

const createSchema = z.object({
  meeting_id: z.string().uuid(),
  name: z.string().trim().min(1, '참석자 이름은 필수입니다.').max(50, '이름은 50자 이하여야 합니다.'),
  note: z.preprocess(blankToEmpty, z.string().max(200, '비고는 200자 이하여야 합니다.')),
});

const deleteSchema = z.object({ id: z.string().uuid() });

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      const { data, error } = await supabase
        .from('meeting_attendees')
        .insert({ meeting_id: body.meeting_id, name: body.name, note: body.note })
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ attendee: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = deleteSchema.parse(req.body);
      const { error } = await supabase.from('meeting_attendees').delete().eq('id', body.id);
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'POST, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
```

- [ ] **Step 3: `pages/api/admin/meeting-attachments.ts` 작성**

Create `pages/api/admin/meeting-attachments.ts`:
```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodError } from 'zod';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const createSchema = z
  .object({
    meeting_id: z.string().uuid(),
    file_path: z.string().min(1).max(400),
    file_name: z.string().min(1).max(255),
    file_size: z.number().int().min(0).optional(),
    mime_type: z.string().max(150).optional(),
  })
  .refine((v) => v.file_path.startsWith(`${v.meeting_id}/`), {
    message: 'file_path가 회의 폴더와 일치하지 않습니다.',
    path: ['file_path'],
  });

const deleteSchema = z.object({ id: z.string().uuid() });

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? error.message : String(error);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'POST') {
    try {
      const body = createSchema.parse(req.body);
      const { data, error } = await supabase
        .from('meeting_attachments')
        .insert({
          meeting_id: body.meeting_id,
          file_path: body.file_path,
          file_name: body.file_name,
          file_size: body.file_size ?? null,
          mime_type: body.mime_type ?? null,
          uploaded_by: session.member.email,
        })
        .select('*')
        .single();
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(200).json({ attachment: data });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = deleteSchema.parse(req.body);

      const target = await supabase
        .from('meeting_attachments')
        .select('id, file_path')
        .eq('id', body.id)
        .maybeSingle();
      if (target.error) {
        res.status(500).json({ error: target.error.message });
        return;
      }
      if (!target.data) {
        res.status(404).json({ error: '첨부 파일을 찾을 수 없습니다.' });
        return;
      }

      const { error } = await supabase.from('meeting_attachments').delete().eq('id', body.id);
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      const filePath = target.data.file_path as string;
      if (filePath) {
        try {
          await supabase.storage.from('meeting-files').remove([filePath]);
        } catch {
          // 스토리지 정리는 best-effort
        }
      }

      res.status(200).json({ ok: true });
      return;
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error) });
      return;
    }
  }

  res.setHeader('Allow', 'POST, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
```

- [ ] **Step 4: 타입체크 + 린트**

Run:
```bash
node node_modules/typescript/bin/tsc --noEmit --pretty false
node node_modules/eslint/bin/eslint.js pages/api/admin/meeting-agendas.ts pages/api/admin/meeting-attendees.ts pages/api/admin/meeting-attachments.ts
```
Expected: 둘 다 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add pages/api/admin/meeting-agendas.ts pages/api/admin/meeting-attendees.ts pages/api/admin/meeting-attachments.ts
git commit -m "feat(meetings): 안건·참석자·첨부 메타 API"
```

---

## Task 5: NAV 메뉴 + 회의 목록 페이지 + 새 회의 페이지

**Files:**
- Modify: `src/components/admin/AdminLayout.tsx` (NAV_ITEMS 배열)
- Create: `pages/admin/meetings/index.tsx`
- Create: `pages/admin/meetings/new.tsx`

**Interfaces:**
- Consumes: `getAdminSession`/`canEditContent`/`redirectToAdminLogin` (`@/lib/adminAuth`), `createSupabaseServerClient`, `AdminLayout`, 타입 `Meeting`(Task 2), 상수 `MEETING_STATUS_LABELS`(Task 2), API `POST /api/admin/meetings`(Task 3).
- Produces: `/admin/meetings`(목록), `/admin/meetings/new`(생성 폼). NAV에 `회의록` 표시.

- [ ] **Step 1: AdminLayout NAV에 회의록 추가**

`src/components/admin/AdminLayout.tsx`의 `NAV_ITEMS` 배열에서 `{ href: '/admin/whitepaper', label: '운영 백서' },` 줄 바로 다음에 한 줄 추가:
```tsx
  { href: '/admin/whitepaper', label: '운영 백서' },
  { href: '/admin/meetings', label: '회의록' },
  { href: '/admin/boards', label: '게시판' },
```
(기존 `'운영 백서'`와 `'게시판'` 사이에 삽입. 다른 항목은 그대로.)

- [ ] **Step 2: 회의 목록 페이지 작성**

Create `pages/admin/meetings/index.tsx`:
```tsx
import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { MEETING_STATUS_LABELS } from '@/lib/meetingForms';
import type { Meeting } from '@/types/meeting';
import type { AdminMember } from '@/types/cms';

interface AdminMeetingsPageProps {
  meetings: Meeting[];
  member: AdminMember;
  initialError?: string;
}

const dateFmt = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' });

const formatMeetingDate = (m: Meeting): string => {
  if (!m.meeting_date) return '일시 미정';
  const base = dateFmt.format(new Date(m.meeting_date));
  return m.meeting_time ? `${base} ${m.meeting_time}` : base;
};

const groupByYear = (meetings: Meeting[]): [string, Meeting[]][] => {
  const groups = new Map<string, Meeting[]>();
  for (const m of meetings) {
    const year = m.meeting_date ? m.meeting_date.slice(0, 4) + '년' : '일시 미정';
    const list = groups.get(year) ?? [];
    list.push(m);
    groups.set(year, list);
  }
  return Array.from(groups.entries());
};

export default function AdminMeetingsPage({
  meetings,
  member,
  initialError = '',
}: AdminMeetingsPageProps) {
  const canEdit = canEditContent(member);
  const groups = groupByYear(meetings);

  return (
    <AdminLayout title="회의록" member={member}>
      {initialError && (
        <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {initialError}
        </p>
      )}

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-deep-ocean/70">기획단 회의 {meetings.length}건</p>
        {canEdit && (
          <Link
            href="/admin/meetings/new"
            className="rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            새 회의
          </Link>
        )}
      </div>

      {meetings.length === 0 ? (
        <p className="rounded border border-deep-ocean/10 bg-white px-4 py-10 text-center text-sm text-deep-ocean/60">
          등록된 회의가 없습니다.
          {canEdit ? ' 상단의 “새 회의”로 추가하세요.' : ' 편집 권한이 있는 관리자에게 등록을 요청하세요.'}
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map(([year, list]) => (
            <section key={year}>
              <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">{year}</h2>
              <ul className="space-y-2">
                {list.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/admin/meetings/${m.id}`}
                      className="flex items-center justify-between gap-3 rounded border border-deep-ocean/10 bg-white px-4 py-3 transition hover:border-jeju-ocean/40 hover:bg-jeju-ocean/5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-deep-ocean">{m.title}</span>
                        <span className="block text-sm text-deep-ocean/60">
                          {formatMeetingDate(m)}
                          {m.location ? ` · ${m.location}` : ''}
                        </span>
                      </span>
                      <span
                        className={
                          'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ' +
                          (m.status === 'completed'
                            ? 'bg-jeju-ocean/10 text-jeju-ocean'
                            : 'bg-ocean-sand text-deep-ocean/70')
                        }
                      >
                        {MEETING_STATUS_LABELS[m.status]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  const supabase = createSupabaseServerClient(context.req, context.res);
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('meeting_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  return {
    props: {
      meetings: data ?? [],
      member: session.member,
      initialError: error?.message ?? '',
    },
  };
};
```

- [ ] **Step 3: 새 회의 페이지 작성**

Create `pages/admin/meetings/new.tsx`:
```tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { GetServerSidePropsContext } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import {
  validateMeetingTitle,
  validateMeetingDate,
  validateMeetingTime,
  validateLocation,
} from '@/lib/meetingForms';
import type { AdminMember } from '@/types/cms';

interface NewMeetingPageProps {
  member: AdminMember;
}

const inputClass =
  'w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';
const labelClass = 'mb-1 block text-sm font-semibold text-deep-ocean';

export default function NewMeetingPage({ member }: NewMeetingPageProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const titleResult = validateMeetingTitle(title);
    if (!titleResult.ok) {
      setError(titleResult.reason);
      return;
    }
    const dateResult = validateMeetingDate(meetingDate);
    if (!dateResult.ok) {
      setError(dateResult.reason);
      return;
    }
    const timeResult = validateMeetingTime(meetingTime);
    if (!timeResult.ok) {
      setError(timeResult.reason);
      return;
    }
    const locationResult = validateLocation(location);
    if (!locationResult.ok) {
      setError(locationResult.reason);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleResult.value,
          meeting_date: dateResult.value ?? '',
          meeting_time: timeResult.value,
          location: locationResult.value,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.meeting) {
        setError(payload.error || '회의 생성에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }
      router.push(`/admin/meetings/${payload.meeting.id}`);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="새 회의" member={member}>
      <Link href="/admin/meetings" className="mb-4 inline-block text-sm text-jeju-ocean hover:text-deep-ocean">
        ← 회의 목록
      </Link>

      {error && (
        <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className={labelClass} htmlFor="title">제목 *</label>
          <input
            id="title"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 6월 정기 기획회의"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="meeting_date">회의 날짜</label>
          <input
            id="meeting_date"
            type="date"
            className={inputClass}
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="meeting_time">시간</label>
          <input
            id="meeting_time"
            className={inputClass}
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            placeholder="예: 19:00"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="location">장소</label>
          <input
            id="location"
            className={inputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 강정 평화센터"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
        >
          {isSubmitting ? '생성 중…' : '회의 만들기'}
        </button>
      </form>
    </AdminLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);
  if (!canEditContent(session.member)) {
    return { redirect: { destination: '/admin/meetings', permanent: false } };
  }
  return { props: { member: session.member } };
};
```

- [ ] **Step 4: 타입체크 + 린트 + 빌드**

Run:
```bash
node node_modules/typescript/bin/tsc --noEmit --pretty false
node node_modules/eslint/bin/eslint.js src/components/admin/AdminLayout.tsx pages/admin/meetings/index.tsx pages/admin/meetings/new.tsx
node node_modules/next/dist/bin/next build
```
Expected: 타입체크/린트 에러 없음. 빌드 성공(`/admin/meetings`, `/admin/meetings/new` 라우트가 빌드 산출물에 포함).

- [ ] **Step 5: 커밋**

```bash
git add src/components/admin/AdminLayout.tsx pages/admin/meetings/index.tsx pages/admin/meetings/new.tsx
git commit -m "feat(meetings): 회의록 NAV + 목록/생성 페이지"
```

---

## Task 6: 회의 상세 페이지 + 회의록 본문 에디터

**Files:**
- Create: `pages/admin/meetings/[id].tsx`
- Create: `src/components/admin/meeting/MeetingMinutesEditor.tsx`

**Interfaces:**
- Consumes: `getAdminSession`/`canEditContent`/`redirectToAdminLogin`, `createSupabaseServerClient`, `AdminLayout`, `MarkdownView`(`@/components/admin/MarkdownView`), 타입 `Meeting`/`MeetingAgenda`/`MeetingAttendee`/`MeetingAttachment`(Task 2), `MEETING_STATUS_LABELS`/`validateMinutes`(Task 2), API `PATCH`/`DELETE /api/admin/meetings/[id]`(Task 3).
- Produces:
  - `pages/admin/meetings/[id].tsx`: SSR로 meeting + agendas + attendees + attachments 로드. 정보 표시, 상태 토글, 회의 삭제, 회의록 에디터 자리. (안건/참석자/첨부 섹션은 Task 7/8에서 채움 — 이 Task에서는 placeholder import 없이 minutes만.)
  - `MeetingMinutesEditor({ meetingId, initialMd, canEdit })`: 보기(MarkdownView)/편집(textarea) 토글, 저장 시 `PATCH /api/admin/meetings/[id]` `{minutes_md}` 후 `router.replace`.

- [ ] **Step 1: MeetingMinutesEditor 컴포넌트 작성**

Create `src/components/admin/meeting/MeetingMinutesEditor.tsx`:
```tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import MarkdownView from '@/components/admin/MarkdownView';
import { validateMinutes } from '@/lib/meetingForms';

interface MeetingMinutesEditorProps {
  meetingId: string;
  initialMd: string;
  canEdit: boolean;
}

export default function MeetingMinutesEditor({
  meetingId,
  initialMd,
  canEdit,
}: MeetingMinutesEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialMd);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError('');
    const result = validateMinutes(draft);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes_md: result.value }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.meeting) {
        setError(payload.error || '회의록 저장에 실패했습니다.');
        setIsSaving(false);
        return;
      }
      setIsEditing(false);
      setIsSaving(false);
      router.replace(router.asPath);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded border border-deep-ocean/10 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-deep-ocean">회의록</h2>
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={() => {
              setDraft(initialMd);
              setIsEditing(true);
            }}
            className="rounded bg-jeju-ocean px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-deep-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            {initialMd.trim() ? '편집' : '작성'}
          </button>
        )}
      </div>

      {error && (
        <p className="mb-3 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            className="h-96 w-full rounded border border-deep-ocean/15 px-3 py-2 font-mono text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="마크다운으로 회의록을 작성하세요."
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
            >
              {isSaving ? '저장 중…' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError('');
              }}
              disabled={isSaving}
              className="rounded border border-deep-ocean/20 px-4 py-2 font-semibold text-deep-ocean transition hover:bg-deep-ocean/5 disabled:opacity-60"
            >
              취소
            </button>
          </div>
        </div>
      ) : initialMd.trim() ? (
        <MarkdownView content={initialMd} />
      ) : (
        <p className="text-sm text-deep-ocean/50">아직 작성된 회의록이 없습니다.</p>
      )}
    </section>
  );
}
```

- [ ] **Step 2: 상세 페이지 작성 (정보 + 상태 토글 + 삭제 + 회의록)**

Create `pages/admin/meetings/[id].tsx`:
```tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { GetServerSidePropsContext } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import MeetingMinutesEditor from '@/components/admin/meeting/MeetingMinutesEditor';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { MEETING_STATUS_LABELS } from '@/lib/meetingForms';
import type {
  Meeting,
  MeetingAgenda,
  MeetingAttendee,
  MeetingAttachment,
} from '@/types/meeting';
import type { AdminMember } from '@/types/cms';

interface MeetingDetailPageProps {
  meeting: Meeting;
  agendas: MeetingAgenda[];
  attendees: MeetingAttendee[];
  attachments: MeetingAttachment[];
  member: AdminMember;
}

const dateFmt = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' });

const formatMeetingDate = (m: Meeting): string => {
  if (!m.meeting_date) return '일시 미정';
  const base = dateFmt.format(new Date(m.meeting_date));
  return m.meeting_time ? `${base} ${m.meeting_time}` : base;
};

export default function MeetingDetailPage({
  meeting,
  agendas,
  attendees,
  attachments,
  member,
}: MeetingDetailPageProps) {
  const router = useRouter();
  const canEdit = canEditContent(member);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const refresh = () => router.replace(router.asPath);

  const toggleStatus = async () => {
    setError('');
    setIsBusy(true);
    const next = meeting.status === 'scheduled' ? 'completed' : 'scheduled';
    try {
      const response = await fetch(`/api/admin/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.meeting) {
        setError(payload.error || '상태 변경에 실패했습니다.');
        setIsBusy(false);
        return;
      }
      setIsBusy(false);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsBusy(false);
    }
  };

  const deleteMeeting = async () => {
    if (!window.confirm('이 회의를 삭제하면 안건·참석자·첨부도 모두 삭제됩니다. 계속할까요?')) {
      return;
    }
    setError('');
    setIsBusy(true);
    try {
      const response = await fetch(`/api/admin/meetings/${meeting.id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.error || '삭제에 실패했습니다.');
        setIsBusy(false);
        return;
      }
      router.push('/admin/meetings');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsBusy(false);
    }
  };

  return (
    <AdminLayout title="회의 상세" member={member}>
      <Link href="/admin/meetings" className="mb-4 inline-block text-sm text-jeju-ocean hover:text-deep-ocean">
        ← 회의 목록
      </Link>

      {error && (
        <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      <header className="mb-6 rounded border border-deep-ocean/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-deep-ocean">{meeting.title}</h1>
            <p className="mt-1 text-sm text-deep-ocean/70">
              {formatMeetingDate(meeting)}
              {meeting.location ? ` · ${meeting.location}` : ''}
            </p>
          </div>
          <span
            className={
              'shrink-0 rounded-full px-3 py-1 text-sm font-semibold ' +
              (meeting.status === 'completed'
                ? 'bg-jeju-ocean/10 text-jeju-ocean'
                : 'bg-ocean-sand text-deep-ocean/70')
            }
          >
            {MEETING_STATUS_LABELS[meeting.status]}
          </span>
        </div>

        {canEdit && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleStatus}
              disabled={isBusy}
              className="rounded border border-jeju-ocean/40 px-3 py-1.5 text-sm font-semibold text-jeju-ocean transition hover:bg-jeju-ocean/10 disabled:opacity-60"
            >
              {meeting.status === 'scheduled' ? '완료로 표시' : '예정으로 되돌리기'}
            </button>
            <button
              type="button"
              onClick={deleteMeeting}
              disabled={isBusy}
              className="rounded border border-sunset-coral/50 bg-white px-3 py-1.5 text-sm font-semibold text-sunset-coral transition hover:bg-sunset-coral/10 disabled:opacity-60"
            >
              회의 삭제
            </button>
          </div>
        )}
      </header>

      <div className="space-y-6">
        {/* Task 7: <AgendaSection ... /> <AttendeeSection ... /> */}
        {/* Task 8: <AttachmentSection ... /> */}
        <MeetingMinutesEditor meetingId={meeting.id} initialMd={meeting.minutes_md} canEdit={canEdit} />
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  const id = context.params?.id;
  if (typeof id !== 'string') return { notFound: true };

  const supabase = createSupabaseServerClient(context.req, context.res);
  const [meetingRes, agendasRes, attendeesRes, attachmentsRes] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('meeting_agendas')
      .select('*')
      .eq('meeting_id', id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('meeting_attendees')
      .select('*')
      .eq('meeting_id', id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('meeting_attachments')
      .select('*')
      .eq('meeting_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (!meetingRes.data) return { notFound: true };

  return {
    props: {
      meeting: meetingRes.data,
      agendas: agendasRes.data ?? [],
      attendees: attendeesRes.data ?? [],
      attachments: attachmentsRes.data ?? [],
      member: session.member,
    },
  };
};
```

- [ ] **Step 3: 타입체크 + 린트 + 빌드**

Run:
```bash
node node_modules/typescript/bin/tsc --noEmit --pretty false
node node_modules/eslint/bin/eslint.js "pages/admin/meetings/[id].tsx" src/components/admin/meeting/MeetingMinutesEditor.tsx
node node_modules/next/dist/bin/next build
```
Expected: 에러 없음. `/admin/meetings/[id]` 라우트 빌드 포함.

- [ ] **Step 4: 커밋**

```bash
git add "pages/admin/meetings/[id].tsx" src/components/admin/meeting/MeetingMinutesEditor.tsx
git commit -m "feat(meetings): 회의 상세 페이지 + 회의록 마크다운 에디터"
```

---

## Task 7: 안건 섹션 + 참석자 섹션

**Files:**
- Create: `src/components/admin/meeting/AgendaSection.tsx`
- Create: `src/components/admin/meeting/AttendeeSection.tsx`
- Modify: `pages/admin/meetings/[id].tsx` (두 섹션을 상세 페이지에 조립)

**Interfaces:**
- Consumes: 타입 `MeetingAgenda`/`MeetingAttendee`(Task 2), `AGENDA_STATUS_LABELS`/`AGENDA_STATUSES`/`validateAgendaTitle`/`validateAgendaContent`/`validateAttendeeName`/`validateAttendeeNote`(Task 2), API `/api/admin/meeting-agendas`·`/api/admin/meeting-attendees`(Task 4).
- Produces:
  - `AgendaSection({ meetingId, agendas, canEdit })`: 안건 목록(상태 라벨), 추가 폼, 상태 select(PATCH), 삭제. 변경 후 `router.replace`.
  - `AttendeeSection({ meetingId, attendees, canEdit })`: 참석자 목록(이름·비고), 추가 폼, 삭제. 변경 후 `router.replace`.

- [ ] **Step 1: AgendaSection 작성**

Create `src/components/admin/meeting/AgendaSection.tsx`:
```tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { AGENDA_STATUSES, AGENDA_STATUS_LABELS, validateAgendaTitle, validateAgendaContent } from '@/lib/meetingForms';
import type { MeetingAgenda, AgendaStatus } from '@/types/meeting';

interface AgendaSectionProps {
  meetingId: string;
  agendas: MeetingAgenda[];
  canEdit: boolean;
}

export default function AgendaSection({ meetingId, agendas, canEdit }: AgendaSectionProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = () => router.replace(router.asPath);

  const addAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const titleResult = validateAgendaTitle(title);
    if (!titleResult.ok) {
      setError(titleResult.reason);
      return;
    }
    const contentResult = validateAgendaContent(content);
    if (!contentResult.ok) {
      setError(contentResult.reason);
      return;
    }
    setIsBusy(true);
    try {
      const response = await fetch('/api/admin/meeting-agendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_id: meetingId, title: titleResult.value, content: contentResult.value }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.agenda) {
        setError(payload.error || '안건 추가에 실패했습니다.');
        setIsBusy(false);
        return;
      }
      setTitle('');
      setContent('');
      setIsBusy(false);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsBusy(false);
    }
  };

  const changeStatus = async (id: string, status: AgendaStatus) => {
    setError('');
    setBusyId(id);
    try {
      const response = await fetch('/api/admin/meeting-agendas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.agenda) {
        setError(payload.error || '상태 변경에 실패했습니다.');
        setBusyId(null);
        return;
      }
      setBusyId(null);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setBusyId(null);
    }
  };

  const deleteAgenda = async (id: string) => {
    if (!window.confirm('이 안건을 삭제할까요?')) return;
    setError('');
    setBusyId(id);
    try {
      const response = await fetch('/api/admin/meeting-agendas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.error || '삭제에 실패했습니다.');
        setBusyId(null);
        return;
      }
      setBusyId(null);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setBusyId(null);
    }
  };

  return (
    <section className="rounded border border-deep-ocean/10 bg-white p-5">
      <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">안건 ({agendas.length})</h2>

      {error && (
        <p className="mb-3 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      {agendas.length === 0 ? (
        <p className="mb-4 text-sm text-deep-ocean/50">등록된 안건이 없습니다.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {agendas.map((a) => (
            <li key={a.id} className="rounded border border-deep-ocean/10 px-3 py-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-deep-ocean">{a.title}</p>
                  {a.content && <p className="mt-1 whitespace-pre-wrap text-sm text-deep-ocean/70">{a.content}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {canEdit ? (
                    <select
                      value={a.status}
                      disabled={busyId === a.id}
                      onChange={(e) => changeStatus(a.id, e.target.value as AgendaStatus)}
                      className="rounded border border-deep-ocean/15 px-2 py-1 text-xs focus:border-jeju-ocean focus:outline-none"
                    >
                      {AGENDA_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {AGENDA_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="rounded-full bg-ocean-sand px-2.5 py-1 text-xs font-semibold text-deep-ocean/70">
                      {AGENDA_STATUS_LABELS[a.status]}
                    </span>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => deleteAgenda(a.id)}
                      disabled={busyId === a.id}
                      className="text-xs font-semibold text-sunset-coral hover:underline disabled:opacity-60"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <form onSubmit={addAgenda} className="space-y-2 border-t border-deep-ocean/10 pt-4">
          <input
            className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="안건 제목"
          />
          <textarea
            className="w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="안건 내용(선택)"
            rows={2}
          />
          <button
            type="submit"
            disabled={isBusy}
            className="rounded bg-deep-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            {isBusy ? '추가 중…' : '안건 추가'}
          </button>
        </form>
      )}
    </section>
  );
}
```

- [ ] **Step 2: AttendeeSection 작성**

Create `src/components/admin/meeting/AttendeeSection.tsx`:
```tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { validateAttendeeName, validateAttendeeNote } from '@/lib/meetingForms';
import type { MeetingAttendee } from '@/types/meeting';

interface AttendeeSectionProps {
  meetingId: string;
  attendees: MeetingAttendee[];
  canEdit: boolean;
}

export default function AttendeeSection({ meetingId, attendees, canEdit }: AttendeeSectionProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = () => router.replace(router.asPath);

  const addAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const nameResult = validateAttendeeName(name);
    if (!nameResult.ok) {
      setError(nameResult.reason);
      return;
    }
    const noteResult = validateAttendeeNote(note);
    if (!noteResult.ok) {
      setError(noteResult.reason);
      return;
    }
    setIsBusy(true);
    try {
      const response = await fetch('/api/admin/meeting-attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_id: meetingId, name: nameResult.value, note: noteResult.value }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.attendee) {
        setError(payload.error || '참석자 추가에 실패했습니다.');
        setIsBusy(false);
        return;
      }
      setName('');
      setNote('');
      setIsBusy(false);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsBusy(false);
    }
  };

  const deleteAttendee = async (id: string) => {
    if (!window.confirm('이 참석자를 삭제할까요?')) return;
    setError('');
    setBusyId(id);
    try {
      const response = await fetch('/api/admin/meeting-attendees', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.error || '삭제에 실패했습니다.');
        setBusyId(null);
        return;
      }
      setBusyId(null);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setBusyId(null);
    }
  };

  return (
    <section className="rounded border border-deep-ocean/10 bg-white p-5">
      <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">참석자 ({attendees.length})</h2>

      {error && (
        <p className="mb-3 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      {attendees.length === 0 ? (
        <p className="mb-4 text-sm text-deep-ocean/50">등록된 참석자가 없습니다.</p>
      ) : (
        <ul className="mb-4 flex flex-wrap gap-2">
          {attendees.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-full border border-deep-ocean/15 bg-ocean-sand/50 px-3 py-1 text-sm text-deep-ocean"
            >
              <span className="font-semibold">{p.name}</span>
              {p.note && <span className="text-deep-ocean/60">· {p.note}</span>}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => deleteAttendee(p.id)}
                  disabled={busyId === p.id}
                  className="text-sunset-coral hover:text-sunset-coral/70 disabled:opacity-60"
                  aria-label={`${p.name} 삭제`}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <form onSubmit={addAttendee} className="flex flex-wrap gap-2 border-t border-deep-ocean/10 pt-4">
          <input
            className="min-w-[8rem] flex-1 rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
          />
          <input
            className="min-w-[8rem] flex-1 rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="비고(선택, 예: 진행)"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="rounded bg-deep-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            {isBusy ? '추가 중…' : '참석자 추가'}
          </button>
        </form>
      )}
    </section>
  );
}
```

- [ ] **Step 3: 상세 페이지에 두 섹션 조립**

`pages/admin/meetings/[id].tsx` 수정:

(a) import 추가 — `MeetingMinutesEditor` import 아래에:
```tsx
import MeetingMinutesEditor from '@/components/admin/meeting/MeetingMinutesEditor';
import AgendaSection from '@/components/admin/meeting/AgendaSection';
import AttendeeSection from '@/components/admin/meeting/AttendeeSection';
```

(b) 본문의 `<div className="space-y-6">` 내부 주석을 실제 컴포넌트로 교체:
```tsx
      <div className="space-y-6">
        <AgendaSection meetingId={meeting.id} agendas={agendas} canEdit={canEdit} />
        <AttendeeSection meetingId={meeting.id} attendees={attendees} canEdit={canEdit} />
        {/* Task 8: <AttachmentSection ... /> */}
        <MeetingMinutesEditor meetingId={meeting.id} initialMd={meeting.minutes_md} canEdit={canEdit} />
      </div>
```

- [ ] **Step 4: 타입체크 + 린트 + 빌드**

Run:
```bash
node node_modules/typescript/bin/tsc --noEmit --pretty false
node node_modules/eslint/bin/eslint.js src/components/admin/meeting/AgendaSection.tsx src/components/admin/meeting/AttendeeSection.tsx "pages/admin/meetings/[id].tsx"
node node_modules/next/dist/bin/next build
```
Expected: 에러 없음. 빌드 성공.

- [ ] **Step 5: 커밋**

```bash
git add src/components/admin/meeting/AgendaSection.tsx src/components/admin/meeting/AttendeeSection.tsx "pages/admin/meetings/[id].tsx"
git commit -m "feat(meetings): 안건·참석자 섹션"
```

---

## Task 8: 첨부 파일 섹션 (비공개 버킷 업로드/다운로드/삭제)

**Files:**
- Create: `src/components/admin/meeting/AttachmentSection.tsx`
- Modify: `pages/admin/meetings/[id].tsx` (섹션 조립)

**Interfaces:**
- Consumes: 타입 `MeetingAttachment`(Task 2), `createSupabaseBrowserClient`(`@/lib/supabaseBrowser`), API `/api/admin/meeting-attachments`(Task 4), 버킷 `meeting-files`(Task 1).
- Produces: `AttachmentSection({ meetingId, attachments, canEdit })`: 파일 선택→확장자/용량 검증→비공개 버킷 업로드(`${meetingId}/<slug>.<ext>`)→메타 POST; 다운로드는 `createSignedUrl`로 새 탭; 삭제는 메타 DELETE(서버가 storage 객체도 제거).

- [ ] **Step 1: AttachmentSection 작성**

Create `src/components/admin/meeting/AttachmentSection.tsx`:
```tsx
import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import type { MeetingAttachment } from '@/types/meeting';

interface AttachmentSectionProps {
  meetingId: string;
  attachments: MeetingAttachment[];
  canEdit: boolean;
}

const ALLOWED_EXT = [
  'pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif',
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'hwp', 'hwpx', 'txt', 'md',
];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

const makeRandomSlug = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const formatSize = (bytes: number | null): string => {
  if (bytes === null || bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AttachmentSection({ meetingId, attachments, canEdit }: AttachmentSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = () => router.replace(router.asPath);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
    if (!ALLOWED_EXT.includes(ext)) {
      setError(`허용되지 않는 형식입니다. (${ALLOWED_EXT.join(', ')})`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('파일 크기는 20MB 이하여야 합니다.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    const path = `${meetingId}/${makeRandomSlug()}.${ext}`;
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from('meeting-files')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) {
        setError(`업로드 실패: ${uploadError.message}`);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const response = await fetch('/api/admin/meeting-attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_id: meetingId,
          file_path: path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.attachment) {
        // 메타 등록 실패 → 업로드한 객체 best-effort 정리
        try {
          await supabase.storage.from('meeting-files').remove([path]);
        } catch {
          // 무시
        }
        setError(payload.error || '첨부 등록에 실패했습니다.');
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const download = async (att: MeetingAttachment) => {
    setError('');
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signError } = await supabase.storage
        .from('meeting-files')
        .createSignedUrl(att.file_path, 60);
      if (signError || !data?.signedUrl) {
        setError('다운로드 링크 생성에 실패했습니다.');
        return;
      }
      window.open(data.signedUrl, '_blank', 'noopener');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const deleteAttachment = async (id: string) => {
    if (!window.confirm('이 첨부 파일을 삭제할까요?')) return;
    setError('');
    setBusyId(id);
    try {
      const response = await fetch('/api/admin/meeting-attachments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.error || '삭제에 실패했습니다.');
        setBusyId(null);
        return;
      }
      setBusyId(null);
      refresh();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setBusyId(null);
    }
  };

  return (
    <section className="rounded border border-deep-ocean/10 bg-white p-5">
      <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">첨부 파일 ({attachments.length})</h2>

      {error && (
        <p className="mb-3 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      {attachments.length === 0 ? (
        <p className="mb-4 text-sm text-deep-ocean/50">등록된 첨부 파일이 없습니다.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center justify-between gap-3 rounded border border-deep-ocean/10 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => download(att)}
                className="min-w-0 truncate text-left text-sm font-semibold text-jeju-ocean hover:underline"
              >
                {att.file_name}
              </button>
              <div className="flex shrink-0 items-center gap-3">
                {att.file_size !== null && (
                  <span className="text-xs text-deep-ocean/50">{formatSize(att.file_size)}</span>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => deleteAttachment(att.id)}
                    disabled={busyId === att.id}
                    className="text-xs font-semibold text-sunset-coral hover:underline disabled:opacity-60"
                  >
                    삭제
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="border-t border-deep-ocean/10 pt-4">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            disabled={isUploading}
            className="block w-full text-sm text-deep-ocean/70 file:mr-3 file:rounded file:border-0 file:bg-deep-ocean file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-jeju-ocean disabled:opacity-60"
          />
          <p className="mt-2 text-xs text-deep-ocean/50">
            {isUploading ? '업로드 중…' : `최대 20MB · ${ALLOWED_EXT.join(', ')}`}
          </p>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: 상세 페이지에 첨부 섹션 조립**

`pages/admin/meetings/[id].tsx` 수정:

(a) import 추가:
```tsx
import AttendeeSection from '@/components/admin/meeting/AttendeeSection';
import AttachmentSection from '@/components/admin/meeting/AttachmentSection';
```

(b) `<div className="space-y-6">` 내부 Task 8 주석을 컴포넌트로 교체:
```tsx
      <div className="space-y-6">
        <AgendaSection meetingId={meeting.id} agendas={agendas} canEdit={canEdit} />
        <AttendeeSection meetingId={meeting.id} attendees={attendees} canEdit={canEdit} />
        <AttachmentSection meetingId={meeting.id} attachments={attachments} canEdit={canEdit} />
        <MeetingMinutesEditor meetingId={meeting.id} initialMd={meeting.minutes_md} canEdit={canEdit} />
      </div>
```

- [ ] **Step 3: 타입체크 + 린트 + 빌드**

Run:
```bash
node node_modules/typescript/bin/tsc --noEmit --pretty false
node node_modules/eslint/bin/eslint.js src/components/admin/meeting/AttachmentSection.tsx "pages/admin/meetings/[id].tsx"
node node_modules/next/dist/bin/next build
```
Expected: 에러 없음. 빌드 성공.

- [ ] **Step 4: 전체 테스트 회귀**

Run:
```bash
node node_modules/jest/bin/jest.js
```
Expected: 전체 스위트 PASS(meetingForms 포함, 기존 테스트 회귀 없음).

- [ ] **Step 5: 커밋**

```bash
git add src/components/admin/meeting/AttachmentSection.tsx "pages/admin/meetings/[id].tsx"
git commit -m "feat(meetings): 첨부 파일 섹션 (비공개 버킷)"
```

---

## 수동 검증 (전체 완료 후)

`pnpm dev`로 띄운 뒤 editor 이상 계정으로:
1. `/admin` 네비에 `회의록` 표시 확인 → 클릭 → `/admin/meetings`.
2. `새 회의` → 제목/날짜/시간/장소 입력 → 생성 → 상세로 이동.
3. 안건 추가 → 상태 select 변경(제안→논의→의결) → 삭제.
4. 참석자 추가(이름/비고) → 삭제.
5. 첨부 업로드(PDF/이미지) → 파일명 클릭 시 새 탭 다운로드(signed URL) → 삭제.
6. 회의록 본문 `작성` → 마크다운 입력 → `저장` → MarkdownView 렌더 확인.
7. `완료로 표시` ↔ `예정으로 되돌리기` 토글 → 목록에서 배지 변동 확인.
8. `회의 삭제` → confirm → 목록으로 복귀, 항목 사라짐.
9. viewer 계정으로 재로그인 → `/admin/meetings` 열람 가능하지만 `새 회의`/추가 폼/편집·삭제 버튼이 보이지 않음 확인. `/admin/meetings/new` 직접 접근 시 목록으로 redirect.
10. (보안) 비로그인 상태로 `/admin/meetings` 접근 → admin 로그인으로 redirect.

---

## Self-Review (작성자 체크)

**1. Spec coverage:**
- 회의 목록/상세 → Task 5(목록), Task 6(상세). ✅
- 회의록 본문(마크다운) → Task 6 MeetingMinutesEditor + MarkdownView. ✅
- 일시·장소 → Task 1 컬럼 + Task 5 폼 + Task 6 표시/수정(PATCH). ✅
- 안건 관리(status) → Task 1 테이블 + Task 4 API + Task 7 AgendaSection. ✅
- 참석자 기록(자유 텍스트) → Task 1 테이블 + Task 4 API + Task 7 AttendeeSection. ✅
- 첨부파일(비공개 버킷) → Task 1 버킷/정책 + Task 4 메타 API + Task 8 AttachmentSection(signed URL). ✅
- 권한(viewer 열람 / editor+ 변경) → 모든 API `requireAdminRole('editor')`, 페이지 `getAdminSession` + `canEditContent` UI 게이트, RLS is_active_admin/admin_can_edit. ✅
- 위치 `/admin/meetings` + NAV → Task 5. ✅
- 범위 밖(날짜투표/정족수/총회/알림) → 미포함. ✅

**2. Placeholder scan:** 모든 코드 단계에 완전한 코드 포함. `<timestamp>`는 `supabase migration new`가 생성하는 실제 파일명 자리이며 Step 1에서 명령으로 생성. TODO/TBD 없음. ✅

**3. Type consistency:** `Meeting`/`MeetingAgenda`/`MeetingAttendee`/`MeetingAttachment` 필드명이 Task 1 DDL ↔ Task 2 타입 ↔ Task 3/4 API insert ↔ Task 5~8 컴포넌트에서 일관. 검증 함수명(`validateMeetingTitle` 등)·상수명(`MEETING_STATUS_LABELS`, `AGENDA_STATUSES`)이 Task 2 정의와 Task 5~7 사용처에서 일치. API 응답 키(`meeting`/`agenda`/`attendee`/`attachment`/`ok`)가 핸들러 ↔ 컴포넌트 fetch 처리에서 일치. ✅
