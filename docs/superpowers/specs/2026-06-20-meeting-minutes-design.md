# 기획단 회의록 시스템 설계 (peace)

작성일: 2026-06-20
대상 저장소: `hwangtab/peace` (PUBLIC), Next.js pages router, Supabase
참조: ggac 프로젝트의 `board-room`(이사회 회의록) 시스템 — 개념·데이터 모델 차용, 단 peace는
"기획단 캠프 준비 회의" 맥락이라 정족수·날짜투표·감사/이사 역할·총회 구분은 제외하고 단순화.

## 1. 목적과 범위

기획단이 캠프를 준비하며 자주 여는 회의의 일정·안건·회의록·참석자·자료를 한 곳에서 관리한다.
관리자(기획단) 전용 비공개 기능으로, 기존 admin 시스템(owner/editor/viewer) 위에 올린다.

### 확정된 결정 사항
- **대상/권한**: 관리자 전용. **viewer = 열람, editor+ = 작성·편집·삭제** (API `requireAdminRole` + RLS). anon 접근 0(공개 노출 없음).
- **기능**: 회의 목록/상세, 회의록 본문(마크다운), 일시·장소, **안건 관리**, **참석자 기록(자유 텍스트)**, **첨부파일(비공개)**.
- **위치**: `/admin/meetings` 영역, AdminLayout NAV에 "회의록" 추가.
- **회의록 본문 렌더**: 백서에서 만든 `src/components/admin/MarkdownView.tsx`(react-markdown) 재사용.
- **범위 밖(YAGNI)**: 날짜 투표 조율, 정족수, 감사/이사 역할, 총회 구분, 알림.

## 2. 데이터 모델 (신규)

### 2.1 `public.meetings`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid PK default gen_random_uuid() | |
| `title` | text not null | 1~200자 check |
| `meeting_date` | date | nullable(미정 허용) |
| `meeting_time` | text | nullable, 예 "19:00" (자유 표기) |
| `location` | text not null default '' | |
| `status` | text not null default 'scheduled' | check in ('scheduled','completed') |
| `minutes_md` | text not null default '' | 회의록 본문(마크다운), 1:1이라 별도 테이블 없이 통합 |
| `created_by` | uuid | references admin_members(id) on delete set null |
| `created_at`/`updated_at` | timestamptz default now() | `set_updated_at` 트리거 |
- 인덱스: `(status, meeting_date desc)`, `(meeting_date desc)`.

### 2.2 `public.meeting_agendas`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid PK | |
| `meeting_id` | uuid not null → meetings(id) on delete cascade | |
| `title` | text not null | 1~200자 |
| `content` | text not null default '' | 상세(선택) |
| `sort_order` | int not null default 0 | |
| `status` | text not null default 'proposed' | check in ('proposed','discussed','resolved') |
| `created_at`/`updated_at` | timestamptz | |
- 인덱스: `(meeting_id, sort_order)`.

### 2.3 `public.meeting_attendees`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid PK | |
| `meeting_id` | uuid not null → meetings(id) on delete cascade | |
| `name` | text not null | 1~50자, 자유 입력(기획단원이 모두 admin 계정은 아님) |
| `note` | text not null default '' | 역할/비고(선택) |
| `sort_order` | int not null default 0 | |
- 인덱스: `(meeting_id, sort_order)`.

### 2.4 `public.meeting_attachments`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid PK | |
| `meeting_id` | uuid not null → meetings(id) on delete cascade | |
| `file_path` | text not null | storage 경로 |
| `file_name` | text not null | 원본 파일명 |
| `file_size` | bigint | |
| `mime_type` | text | |
| `uploaded_by` | uuid → admin_members(id) on delete set null | |
| `created_at` | timestamptz default now() | |

### 2.5 `meeting-files` 스토리지 버킷 (비공개)
- `public = false`. 공개 URL 없음.
- storage.objects 정책(meeting-files): select = `is_active_admin()`, insert/update/delete = `admin_can_edit()`.
- 업로드 경로: `<meeting_id>/<timestamp>-<rand>.<ext>`.
- 다운로드: admin 세션 클라이언트로 `supabase.storage.from('meeting-files').download(path)` 또는 `createSignedUrl` (공개 URL 미사용).

## 3. 보안 (RLS)

헬퍼 재사용: `is_active_admin()`, `admin_can_edit()`, `set_updated_at()`.
모든 표는 RLS 활성, anon 권한 없음(grant 안 함).

- 4개 테이블 공통:
  - `grant select, insert, update, delete on <t> to authenticated;` (anon 제외)
  - select 정책: `to authenticated using (is_active_admin())`
  - insert/update/delete 정책: `to authenticated using/with check (admin_can_edit())`
- 회의는 전부 admin 영역이므로 작성자 자기-소유 구분이나 enforce 트리거는 불필요(editor+ 전원이 관리).

## 4. 페이지 (`/admin/*`, 한국어, admin 전용)

| 경로 | 동작 |
|---|---|
| `/admin/meetings` | 회의 목록 — 연/월 그룹, 상태 배지(예정/완료), "새 회의" |
| `/admin/meetings/new` | 새 회의 생성(제목·날짜·시간·장소) → 상세로 이동 |
| `/admin/meetings/[id]` | 상세 — 회의 정보 편집, 회의록 본문(마크다운 보기/편집 토글), 안건(추가·상태 토글·삭제·정렬), 참석자(추가·삭제), 첨부(업로드·다운로드·삭제), 상태 전환(예정↔완료), 회의 삭제 |
- 게이트: `getServerSideProps`에서 `getAdminSession` → 없으면 admin 로그인 리다이렉트. 편집 UI는 `canEditContent(member)`(editor+)일 때만 노출(viewer는 읽기 전용). 데이터는 admin 세션 서버 클라이언트로 SSR 로드.
- 회의록 본문: 보기 = `MarkdownView`, 편집 = textarea(마크다운). admin 페이지는 i18n 없이 한국어(기존 admin 관례).

## 5. API (`/api/admin/...`, 전부 requireAdminRole)

- `pages/api/admin/meetings.ts` — GET(목록), POST(생성). 변경은 editor+.
- `pages/api/admin/meetings/[id].ts` — GET(상세: 회의+안건+참석자+첨부), PATCH(회의/회의록 수정·상태), DELETE.
- `pages/api/admin/meeting-agendas.ts` — POST/PATCH/DELETE(안건).
- `pages/api/admin/meeting-attendees.ts` — POST/DELETE(참석자).
- `pages/api/admin/meeting-attachments.ts` — POST(메타 등록; 실제 파일은 클라가 세션 클라로 버킷 업로드 후 경로 전달), DELETE(메타 + 스토리지 객체 정리).
- 검증: Zod(제목/상태 enum/uuid). GET=viewer+, 변경=editor+. 잘못된 UUID→400, 없음→404, 충돌→409(기존 패턴 일치).

## 6. 단위 설계 / 파일

- `supabase/migrations/<ts>_meeting_minutes.sql` — 4 테이블 + RLS + 버킷/정책 + 트리거
- `src/types/meeting.ts` — `Meeting`, `MeetingAgenda`, `MeetingAttendee`, `MeetingAttachment`, `MeetingDetail`
- `src/lib/meetingForms.ts` (+테스트) — 제목/안건/참석자 검증, 상태 enum 헬퍼 (순수)
- `pages/admin/meetings/index.tsx`, `new.tsx`, `[id].tsx`
- `src/components/admin/meeting/*` — AgendaSection, AttendeeSection, AttachmentSection, MeetingMinutesEditor
- API 라우트(§5)
- `src/components/admin/AdminLayout.tsx` — NAV에 "회의록" 추가(전체 admin 노출)

## 7. 에러 처리
- 미인증 → admin 로그인. 권한 부족 변경 시도 → 403(API)/버튼 숨김(UI).
- 첨부 업로드 실패(타입/용량) → 폼 메시지. 메타 등록 실패 시 업로드된 스토리지 객체 best-effort 정리.
- 잘못된 입력 → Zod 400. UUID 미검증 회피(전부 safeParse).

## 8. 테스트
- `meetingForms` 순수 검증 단위 테스트.
- 기존 테스트 회귀 + typecheck/lint + `next build`(admin 동적 라우트).
- 수동: 회의 생성 → 안건 추가/상태 → 참석자 → 첨부 업/다운로드 → 회의록 작성 → 상태 완료 → viewer 읽기전용 확인.

## 9. 운영 메모
- `meeting-files` 버킷은 마이그레이션 SQL로 생성(비공개). 레포 PUBLIC이므로 첨부·회의록 본문은 DB/비공개 버킷에만 존재(공개 노출 없음).
- 마이그레이션 `supabase db push`로 원격 적용.

## 10. ggac 대비 의도적 차이(요약)
- 제외: `board_meeting_date_options`/`date_votes`(날짜 투표), 정족수(이사만 카운트), 감사/이사 역할, 총회(`board_documents` category='총회'), 알림.
- 단순화: minutes를 별도 테이블 대신 `meetings.minutes_md` 컬럼; 참석자를 멤버 FK 대신 자유 텍스트; 권한을 ggac의 is_director/is_admin/is_auditor 대신 peace의 owner/editor/viewer로 매핑.
