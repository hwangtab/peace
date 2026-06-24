# 회의록·운영백서 캠프 회차별 분류 설계

작성일: 2026-06-24
상태: 승인됨 (구현 계획 대기)

## 배경 / 목적

아카이브(비디오·갤러리·언론보도)를 유형·연도 2축으로 분류한 데 이어, **회의록과 운영 백서도 어느 캠프 회차 자료인지로 분류**해야 한다.

핵심 문제: 회의록은 현재 `meeting_date`(회의 날짜) 연도로 그룹되는데, **제3회 캠프(2026 행사) 준비 회의가 2025-11~2026-06에 걸쳐** 있어 "2025년 6건 / 2026년 8건"으로 쪼개진다. 회의 날짜 ≠ 캠프 회차. 백서는 slug `camp-2026-whitepaper` 하드코딩 단일 문서라 회차 개념 자체가 없다.

### 범위
- **관리자(기획단) 페이지만.** 공개 사이트 무관.
- **회의록 + 운영 백서** 두 영역.
- 미래 회차(제4회 등) 확장을 감안한 구조.

### 현황
- `meetings`: `meeting_date`, `status`, `minutes_md` 등. 캠프 회차 필드 없음. 14건 전부 제3회(2026) 자료, meeting_date는 2025-11-06~2026-06.
- 인덱스([pages/admin/meetings/index.tsx](../../../pages/admin/meetings/index.tsx))는 `meeting_date.slice(0,4)+'년'`로 그룹.
- 백서([pages/admin/whitepaper.tsx](../../../pages/admin/whitepaper.tsx)): `WHITEPAPER_SLUG='camp-2026-whitepaper'` 하드코딩. `admin_documents`(slug unique) 테이블.

## 설계

### 1. 공유 개념 — 캠프 회차 상수

새 모듈(예: `src/lib/campEditions.ts`)에 단일 정의:

- `CAMP_EDITIONS`: 연도 → 회차 번호 매핑. 현재 `{ 2023: 1, 2025: 2, 2026: 3 }`. (2024는 앨범이라 캠프 회차 아님 → 제외.)
- `campEditionLabel(year: number): string` — 매핑 있으면 `"제3회 강정피스앤뮤직캠프 (2026)"`, 없으면 `"{year} 캠프"` 폴백.
- `CAMP_EDITION_YEARS: number[]` — 내림차순 연도 목록(드롭다운·탭 옵션용).
- **미래 제4회**: 이 상수에 한 줄 추가하면 회의록 회차 선택·백서 회차 목록·라벨에 자동 반영.

회의록·백서가 이 모듈을 공유한다.

### 2. 회의록 — 캠프 회차 필드

- **마이그레이션**: `meetings`에 `event_year integer` 추가(캠프 회차 연도, `meeting_date`와 별개). 기존 14건 전부 `2026`으로 백필. (nullable 허용하되 신규는 입력 유도.)
- **작성/수정 화면**([pages/admin/meetings/new.tsx](../../../pages/admin/meetings/new.tsx), [\[id\].tsx](../../../pages/admin/meetings/[id].tsx)): "캠프 회차" 드롭다운 추가(`CAMP_EDITION_YEARS`, 라벨은 `campEditionLabel`). 기본값 최신 회차(2026).
- **회의록 API**([pages/api/admin/meetings.ts](../../../pages/api/admin/meetings.ts), `[id].ts`): `event_year` 받기/검증(정수, 선택).
- **인덱스 그룹**: `meeting_date` 연도 대신 **`event_year` 기준 그룹**. 헤더는 `campEditionLabel(event_year)`. `event_year` null인 행은 "회차 미지정" 그룹.
- **회차 필터**: 상단에 회차 드롭다운(전체 + `CAMP_EDITION_YEARS`). 선택 시 해당 회차만. (SSR 쿼리 `eq('event_year', year)`.)

### 3. 백서 — 회차별 다중 문서

- slug 규칙 `camp-{year}-whitepaper`. 기존 `camp-2026-whitepaper` 그대로 호환.
- **백서 페이지 개편**: 단일 하드코딩 → 회차 선택 UI.
  - 상단에 회차 선택(탭 또는 드롭다운): **존재하는 백서 문서의 회차** + (선택) 상수의 회차.
  - 선택 회차 백서를 표시·편집(기존 편집 로직 재사용).
  - 문서 없는 회차 선택 시 "이 회차 백서 만들기" → 빈 문서 생성 후 편집.
- **회차 목록 출처**: 존재하는 `camp-%-whitepaper` 문서들에서 연도 추출 + `CAMP_EDITION_YEARS` 합집합(백서 없는 회차도 생성 가능하게). 라벨은 `campEditionLabel`.
- **API**: 백서 조회/저장이 slug를 파라미터로 받도록(현 하드코딩 제거). 생성은 기존 upsert 흐름 재사용.
- title 기본값도 `campEditionLabel(year) + ' 운영 백서'`로 회차 반영.

### 4. 데이터/마이그레이션

- 마이그레이션 1개: `meetings.event_year` 추가 + `update meetings set event_year = 2026`(기존 백필). 인덱스 `(event_year)` 추가.
- 백서: 스키마 변경 없음(admin_documents 그대로). 2026 백서 데이터 유지.

## 영향 받는 파일 (개략)
- `src/lib/campEditions.ts` (신규) — 상수·라벨 헬퍼
- `supabase/migrations/<ts>_meetings_event_year.sql` (신규)
- `pages/admin/meetings/index.tsx` — event_year 그룹 + 회차 필터
- `pages/admin/meetings/new.tsx`, `[id].tsx` — 캠프 회차 입력
- `pages/api/admin/meetings.ts`, `[id].ts` — event_year 처리
- `src/types/cms.ts`(또는 회의 타입) — Meeting에 event_year
- `pages/admin/whitepaper.tsx` — 회차 선택·생성 개편
- 백서 저장 API(있으면) — slug 파라미터화

## 테스트
- `campEditionLabel`/`CAMP_EDITION_YEARS` 단위 테스트(매핑·폴백·정렬)
- 회의록 event_year 그룹·필터 로직 단위 테스트(있는 그룹화 헬퍼 분리 시)
- 백서 slug 파싱(`camp-{year}-whitepaper` ↔ year) 단위 테스트

## YAGNI / 범위 밖
- 공개 사이트 회차 구성
- 회차 정보를 DB 테이블로 두는 것(상수로 충분, 회차는 연 1회 추가)
- 아카이브와 회의록·백서의 필터 UI 완전 통합(개념은 공유하되 각 화면 특성 유지)
- 회의록에 event_type(캠프/앨범) 축 — 회의록·백서는 캠프 운영 문서뿐이라 연도(회차) 단일 축
