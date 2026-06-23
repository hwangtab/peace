# 관리자 메일함 확장 — 그룹 단체 발송 설계

작성일: 2026-06-23
상태: 승인됨 (구현 계획 대기)

## 배경 / 목적

현재 [/admin/mailbox](../../../pages/admin/mailbox/index.tsx)는 인바운드 수신 메일 열람과 개별 답장만 지원한다. 발송 인프라(Resend `sendEmail()`, 발신 `admin@peaceandmusic.net`, outbound 기록 패턴)는 이미 [reply.ts](../../../pages/api/admin/mailbox/reply.ts)에 구현돼 있다.

기획단이 **회차별로 뮤지션 / 기획단 / 후원단체에게 골라서 단체 메일을 보낼 수 있어야** 한다.

### 핵심 제약 — 수신자 명단 데이터

"회차별 그룹 발송"의 전제인 `이름 + 이메일 + 그룹 + 회차` 명단이 현재 코드/DB에 없다.

- 뮤지션(`public/data/musicians.json`): **이메일 없음**, 회차 구분 없음 (로컬 SMS 명단은 전화번호)
- 기획단(`admin_members`): 이메일은 있으나 회차 개념 없음 (현재 활동 관리자만)
- 후원단체: 이메일 명단이 코드/DB에 없음 — 단, `docs/2026캠프 운영/준비문서/…공동주최…제주단체.csv`에 제주 공동주최 ~14곳 이메일 존재

방침: **docs에서 발견되는 이메일만 시드하고, 없으면 비워 둔 채 관리 UI로 이후 채운다.**

## 데이터 모델

### 새 테이블 `mail_contacts`

관리자 전용. RLS: 열람 = `is_active_admin()`, 쓰기 = `admin_can_edit()` (기존 mailbox/meetings 패턴 동일). anon 접근 0.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid PK | |
| `name` | text not null | 이름/단체명, 개인화 `{이름}` 치환에 사용 |
| `email` | text not null | 소문자 정규화, unique 권장 |
| `group_type` | text not null | `musician` / `planning` / `sponsor` (check 제약) |
| `cohorts` | text[] not null default '{}' | 회차 태그 배열, 예 `{'2026'}` (다중 가능) |
| `note` | text not null default '' | 비고 (역할·단체 성격 등) |
| `is_active` | boolean not null default true | 발송 대상 포함 여부 (수신거부/소프트 삭제) |
| `created_by` | text not null default '' | 등록 관리자 이메일 |
| `created_at` / `updated_at` | timestamptz | |

인덱스: `(group_type)`, `cohorts` GIN, `lower(email)` unique.

### `mailbox_messages` 확장

단체 발송 추적용 컬럼 추가:

- `campaign_id` uuid null — 같은 단체발송 묶음 식별
- `send_error` text null — 수신자별 발송 실패 사유(성공 시 null)

발송은 **수신자별 outbound 1행씩** 기록하고 같은 `campaign_id`로 묶는다. (누구에게 갔는지·실패 추적 목적)

### 시드 데이터 ("있으면 넣고 없으면 말아")

- 후원단체: 제주 공동주최 ~14곳 → `group_type=sponsor, cohorts={'2026'}`
- 기획단: `admin_members` 현재 이메일 → `group_type=planning, cohorts={'2026'}`
- 뮤지션: 빈 명단 (이메일 부재) — 이후 관리 UI/CSV 임포트로 채움

시드는 마이그레이션이 아니라 일회성 service-role 스크립트로 처리(레포 밖 실행, 회의록 적재와 동일 방식) — 이메일이 공개 레포에 박히지 않게.

## 화면 구조

[/admin/mailbox](../../../pages/admin/mailbox/index.tsx)를 **상단 탭 3개**로 확장. 별도 페이지 분리 대신 한 화면 탭(명단 보며 발송).

```
[ 받은 메일함 ] [ 보내기 ] [ 연락처 ]
```

### ① 받은 메일함 (기존 유지)
인바운드 목록 + 개별 답장.

### ② 보내기 (Compose) — 단체 발송
- 수신자 선택: `그룹` + `회차` 필터 → 해당 연락처 체크박스 목록 → 전체선택/개별선택
- 선택 수신자 수 실시간 표시 ("23명에게 발송")
- 제목 / 본문 입력. 본문 `{이름}` 머지 태그 안내 + 1명 샘플 미리보기
- "발송" → 확인 모달(수신자 수·발신주소) → 전송
- 발송 후 결과 요약: 성공 N / 실패 M (실패 목록)

### ③ 연락처 (Contacts) — 명단 관리
- 그룹·회차 필터 + 검색
- 행 인라인: 이름·이메일·그룹·회차태그·활성토글
- 추가 / 수정 / 삭제(소프트: `is_active=false`)
- CSV 붙여넣기 임포트: `이름,이메일,그룹,회차` → 미리보기 → 일괄 추가(중복 이메일 skip)

권한: 열람 = active admin 전원, 발송·연락처 편집 = editor+. viewer는 열람만.

## API 라우트

모두 editor+ 게이트(`requireAdminRole(req,res,'editor')`), 기존 패턴.

- `GET/POST /api/admin/mail-contacts` — 목록(그룹·회차 필터) / 추가
- `PATCH/DELETE /api/admin/mail-contacts/[id]` — 수정 / 비활성화
- `POST /api/admin/mail-contacts/import` — CSV 일괄 추가(중복 skip)
- `POST /api/admin/mailbox/send` — 단체 발송 (신규)

### 발송 동작 (`send`)

1. 입력: `contactIds[]` 또는 `(group + cohort)` 필터, `subject`, `text`
2. 서버에서 대상 연락처 조회(`is_active=true`) → 이메일 유효성 검사 (클라가 보낸 id도 서버에서 active 재확인)
3. `campaign_id` 1개 생성, 각 수신자마다:
   - `{이름}` → 연락처 `name` 치환
   - `sendEmail()` (발신 `강정 피스앤뮤직캠프 <admin@peaceandmusic.net>`)
   - 성공/실패 무관하게 `mailbox_messages` outbound 1행 기록(`campaign_id`, `to_email`, 실패 시 `send_error`)
4. 순차 + 약한 throttle(Resend rate limit 대비). 현재 규모(수십 명) 단건 반복으로 충분.
5. 응답: `{ campaign_id, sent: N, failed: [{email, error}] }`

## 안전장치 / 에러 처리

- 발송 전 확인 모달(수신자 수·발신주소)
- 빈 수신자 / 빈 본문 차단
- 부분 실패해도 성공분은 기록·보고. 메일은 회수 불가하므로 멱등하지 않음 — 대신 실패 목록을 반환해 실패분만 재시도 가능
- 발송 대상은 서버에서 재조회(active 재확인)

## 테스트 (jest, 기존 `*.test.ts` 패턴)

- `mailContactsForms` 단위: CSV 파싱, 이메일 검증, `{이름}` 머지 치환, 그룹·회차 필터 로직
- 발송 핸들러: 일부 실패 시 성공분 기록 + 실패 목록 반환 (Resend·supabase mock)

## YAGNI / 범위 밖

- 예약 발송, 발송 통계 대시보드, 오픈/클릭 추적
- 첨부파일 발송
- 수신거부 자동 처리(링크) — `is_active` 수동 토글로 갈음
- 뮤지션 이메일 수집 자동화 (데이터 확보는 운영 영역)
