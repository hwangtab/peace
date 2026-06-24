# 회의록·운영백서 캠프 회차별 분류 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 회의록과 운영 백서를 "캠프 회차(연도)"로 묶어 분류·관리하게 한다.

**Architecture:** 공유 상수 `CAMP_EDITIONS`(연도↔제N회)와 라벨 헬퍼를 한 모듈에 두고, 회의록은 `meetings.event_year`(회의 날짜와 별개) 컬럼으로 회차를 부여해 그 기준으로 그룹·필터한다. 백서는 slug `camp-{연도}-whitepaper`별 다중 문서로, 페이지에서 회차를 선택·생성한다(저장 API는 이미 slug 파라미터화돼 있음).

**Tech Stack:** Next.js (pages router), TypeScript, Supabase(Postgres), zod, jest, Tailwind.

## Global Constraints

- 의존성 pnpm. 커밋 전 prettier(`npx prettier --write <files>`). CI: format:check·lint·typecheck·test·i18n:check.
- 테스트 러너 jest(`npx jest <pattern>`). 관리자 API는 `requireAdminRole`/`getAdminSession` 게이트, RLS 기존대로.
- Supabase는 CLI 마이그레이션. **DB push는 사용자 승인 후 컨트롤러가 수행**(서브에이전트는 마이그레이션 파일 작성까지만, push는 하지 말 것).
- 범위: 관리자 페이지만(회의록·백서). 공개 사이트 무관.
- 회차 라벨: `제{N}회 강정피스앤뮤직캠프 ({연도})`, 매핑 없으면 `{연도} 캠프`. 회차 매핑: 2023=1, 2025=2, 2026=3.
- `noUncheckedIndexedAccess` 켜짐 — 인덱싱 가드.
- 작업 완료 후 `git push origin main`.

---

### Task 1: 캠프 회차 공유 모듈 (TDD)

**Files:**
- Create: `src/lib/campEditions.ts`
- Create: `src/lib/campEditions.test.ts`

**Interfaces:**
- Produces:
  - `CAMP_EDITIONS: Record<number, number>` — 연도→회차번호
  - `CAMP_EDITION_YEARS: number[]` — 회차 연도 내림차순
  - `campEditionLabel(year: number | null): string`
  - `whitepaperSlug(year: number): string` → `camp-{year}-whitepaper`
  - `parseWhitepaperYear(slug: string): number | null`

- [ ] **Step 1: 실패 테스트 작성**

`src/lib/campEditions.test.ts`:
```typescript
import {
  CAMP_EDITION_YEARS,
  campEditionLabel,
  whitepaperSlug,
  parseWhitepaperYear,
} from './campEditions';

test('CAMP_EDITION_YEARS는 회차 연도를 내림차순으로 준다', () => {
  expect(CAMP_EDITION_YEARS).toEqual([2026, 2025, 2023]);
});

test('campEditionLabel은 매핑된 회차는 제N회로, 없으면 연도 폴백', () => {
  expect(campEditionLabel(2026)).toBe('제3회 강정피스앤뮤직캠프 (2026)');
  expect(campEditionLabel(2023)).toBe('제1회 강정피스앤뮤직캠프 (2023)');
  expect(campEditionLabel(2030)).toBe('2030 캠프');
  expect(campEditionLabel(null)).toBe('회차 미지정');
});

test('whitepaperSlug / parseWhitepaperYear 왕복', () => {
  expect(whitepaperSlug(2026)).toBe('camp-2026-whitepaper');
  expect(parseWhitepaperYear('camp-2026-whitepaper')).toBe(2026);
  expect(parseWhitepaperYear('camp-2025-whitepaper')).toBe(2025);
  expect(parseWhitepaperYear('other-doc')).toBeNull();
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx jest campEditions`
Expected: FAIL ("Cannot find module './campEditions'")

- [ ] **Step 3: 구현**

`src/lib/campEditions.ts`:
```typescript
// 캠프 회차(연도 ↔ 제N회) 단일 정의. 새 회차가 생기면 여기 한 줄만 추가한다.
// (2024는 앨범이라 캠프 회차가 아님 → 제외.)
export const CAMP_EDITIONS: Record<number, number> = {
  2023: 1,
  2025: 2,
  2026: 3,
};

export const CAMP_EDITION_YEARS: number[] = Object.keys(CAMP_EDITIONS)
  .map(Number)
  .sort((a, b) => b - a);

export const campEditionLabel = (year: number | null): string => {
  if (year == null) return '회차 미지정';
  const no = CAMP_EDITIONS[year];
  return no ? `제${no}회 강정피스앤뮤직캠프 (${year})` : `${year} 캠프`;
};

export const whitepaperSlug = (year: number): string => `camp-${year}-whitepaper`;

export const parseWhitepaperYear = (slug: string): number | null => {
  const m = slug.match(/^camp-(\d{4})-whitepaper$/);
  return m ? Number(m[1]) : null;
};
```

- [ ] **Step 4: 통과 확인**

Run: `npx jest campEditions`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
npx prettier --write src/lib/campEditions.ts src/lib/campEditions.test.ts
git add src/lib/campEditions.ts src/lib/campEditions.test.ts
git commit -m "feat(admin): 캠프 회차 공유 상수·라벨 헬퍼 + 테스트"
```

---

### Task 2: meetings.event_year 마이그레이션 + 타입

**Files:**
- Create: `supabase/migrations/<timestamp>_meetings_event_year.sql`
- Modify: `src/types/meeting.ts`

**Interfaces:**
- Produces: `meetings.event_year integer` 컬럼(기존 행 2026 백필); `Meeting.event_year: number | null`

- [ ] **Step 1: 마이그레이션 파일 생성**

Run: `supabase migration new meetings_event_year`
Expected: 빈 파일 생성

- [ ] **Step 2: SQL 작성**

생성된 파일에:
```sql
-- 회의록에 캠프 회차(연도) 부여. meeting_date(회의 날짜)와 별개 — 제3회 캠프 준비 회의는
-- 2025-11~2026-06에 걸쳐 있어 회의 날짜로 묶으면 회차가 쪼개진다.
alter table public.meetings add column if not exists event_year integer;
-- 기존 14건은 전부 제3회(2026) 자료.
update public.meetings set event_year = 2026 where event_year is null;
create index if not exists meetings_event_year_idx on public.meetings (event_year);
```

- [ ] **Step 3: 타입 갱신**

`src/types/meeting.ts`의 `Meeting` 인터페이스에 `meeting_date` 아래 추가:
```typescript
  event_year: number | null;
```

- [ ] **Step 4: 타입 확인 (마이그레이션 적용은 컨트롤러가 별도 수행)**

Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: 타입 에러 0(컬럼은 select '*'로 들어오므로 타입만 맞으면 됨). **`supabase db push`는 실행하지 말 것 — 컨트롤러가 사용자 승인 후 적용.**

- [ ] **Step 5: Commit**

```bash
npx prettier --write src/types/meeting.ts
git add supabase/migrations/ src/types/meeting.ts
git commit -m "feat(admin): meetings.event_year(캠프 회차) 컬럼 + 타입"
```

---

### Task 3: 회의록 API — event_year 처리

**Files:**
- Modify: `pages/api/admin/meetings.ts` (생성)
- Modify: `pages/api/admin/meetings/[id].ts` (수정)

**Interfaces:**
- Consumes: 없음(zod 직접)
- Produces: 생성/수정 API가 `event_year`(정수) 수용·저장

- [ ] **Step 1: 생성 스키마·insert에 event_year 추가**

`pages/api/admin/meetings.ts`의 `createSchema`에 `location` 줄 다음에 추가:
```typescript
  event_year: z.coerce.number().int().min(2000).max(2100),
```
그리고 insert 객체에 `location: body.location,` 다음에 추가:
```typescript
          event_year: body.event_year,
```

- [ ] **Step 2: 수정 스키마에 event_year(선택) 추가**

`pages/api/admin/meetings/[id].ts`의 `updateSchema`에 `status` 줄 근처(객체 내)에 추가:
```typescript
    event_year: z.coerce.number().int().min(2000).max(2100).optional(),
```
(업데이트는 `body`를 그대로 `.update(body)`에 넘기므로 별도 처리 불필요.)

- [ ] **Step 3: 타입·lint 확인**

Run: `npx tsc --noEmit && npx eslint pages/api/admin/meetings.ts "pages/api/admin/meetings/[id].ts"`
Expected: 에러 0

- [ ] **Step 4: Commit**

```bash
npx prettier --write pages/api/admin/meetings.ts "pages/api/admin/meetings/[id].ts"
git add pages/api/admin/meetings.ts "pages/api/admin/meetings/[id].ts"
git commit -m "feat(admin): 회의록 생성/수정 API에 event_year 처리"
```

---

### Task 4: 새 회의 작성 화면 — 캠프 회차 선택

**Files:**
- Modify: `pages/admin/meetings/new.tsx`

**Interfaces:**
- Consumes: `CAMP_EDITION_YEARS`, `campEditionLabel` (Task 1)
- Produces: 작성 폼이 `event_year`를 함께 전송

- [ ] **Step 1: import + 상태 추가**

상단 import에 추가:
```typescript
import { CAMP_EDITION_YEARS, campEditionLabel } from '@/lib/campEditions';
```
`const [location, setLocation] = useState('');` 다음에 추가:
```typescript
  const [eventYear, setEventYear] = useState<number>(CAMP_EDITION_YEARS[0] ?? 2026);
```

- [ ] **Step 2: fetch body에 event_year 추가**

`fetch('/api/admin/meetings', ...)`의 `body: JSON.stringify({ ... })`에서 `location: locationResult.value,` 다음에 추가:
```typescript
          event_year: eventYear,
```

- [ ] **Step 3: 폼에 캠프 회차 select 추가**

제목(title) `<input>` 블록 위(폼 최상단)에 회차 선택을 추가. 기존 라벨/인풋 클래스(`labelClass`)를 재사용:
```tsx
        <div>
          <label className={labelClass} htmlFor="event_year">
            캠프 회차
          </label>
          <select
            id="event_year"
            value={eventYear}
            onChange={(e) => setEventYear(Number(e.target.value))}
            className="w-full rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
          >
            {CAMP_EDITION_YEARS.map((year) => (
              <option key={year} value={year}>
                {campEditionLabel(year)}
              </option>
            ))}
          </select>
        </div>
```
(실제 인풋 래퍼 마크업이 다르면 기존 필드 패턴에 맞춰 배치하되 select 자체는 위와 동일.)

- [ ] **Step 4: 타입·lint·빌드**

Run: `npx tsc --noEmit && npx eslint pages/admin/meetings/new.tsx && npx next build 2>&1 | grep -iE "compiled|failed"`
Expected: 에러 0, Compiled successfully

- [ ] **Step 5: Commit**

```bash
npx prettier --write pages/admin/meetings/new.tsx
git add pages/admin/meetings/new.tsx
git commit -m "feat(admin): 새 회의 작성에 캠프 회차 선택"
```

---

### Task 5: 회의록 목록 — 회차 그룹 + 필터

**Files:**
- Modify: `pages/admin/meetings/index.tsx`

**Interfaces:**
- Consumes: `CAMP_EDITION_YEARS`, `campEditionLabel` (Task 1), `Meeting.event_year` (Task 2)
- Produces: 목록이 `event_year` 기준 그룹 + 회차 드롭다운 필터

- [ ] **Step 1: import + 그룹 함수 교체**

상단 import에 추가:
```typescript
import { CAMP_EDITION_YEARS, campEditionLabel } from '@/lib/campEditions';
```
`groupByYear`를 `event_year` 기준으로 교체(회차 내림차순, 미지정은 끝):
```typescript
const groupByEdition = (meetings: Meeting[]): [number | null, Meeting[]][] => {
  const groups = new Map<number | null, Meeting[]>();
  for (const m of meetings) {
    const key = m.event_year ?? null;
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }
  return Array.from(groups.entries()).sort((a, b) => {
    if (a[0] == null) return 1;
    if (b[0] == null) return -1;
    return b[0] - a[0];
  });
};
```

- [ ] **Step 2: props에 selectedYear 추가 + 그룹 렌더 교체**

`AdminMeetingsPageProps`에 추가:
```typescript
  selectedYear: string;
```
컴포넌트 인자 구조분해에 `selectedYear,` 추가. 본문에서 `const groups = groupByYear(meetings);` → `const groups = groupByEdition(meetings);`. 그룹 헤더 렌더에서:
```tsx
          {groups.map(([year, list]) => (
            <section key={year ?? 'none'}>
              <h2 className="mb-3 font-display text-lg font-bold text-deep-ocean">
                {campEditionLabel(year)}
              </h2>
```

- [ ] **Step 3: 회차 필터 드롭다운 추가**

"기획단 회의 N건" 줄이 있는 `<div className="mb-6 flex items-center justify-between">` 안, 좌측 `<p>` 다음에 회차 select를 추가(라우터 쿼리로 필터):
```tsx
        <select
          value={selectedYear}
          onChange={(e) => {
            const v = e.target.value;
            window.location.href = v ? `/admin/meetings?year=${v}` : '/admin/meetings';
          }}
          className="rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
        >
          <option value="">전체 회차</option>
          {CAMP_EDITION_YEARS.map((year) => (
            <option key={year} value={year}>
              {campEditionLabel(year)}
            </option>
          ))}
        </select>
```
(기존 레이아웃이 `justify-between`이면 select+새회의 버튼을 우측 묶음으로 `flex gap-2`로 감싸도 됨. 동작은 위 select가 핵심.)

- [ ] **Step 4: getServerSideProps — year 필터 + selectedYear 전달**

```typescript
export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  const selectedYear =
    typeof context.query.year === 'string' && /^\d{4}$/.test(context.query.year)
      ? context.query.year
      : '';

  const supabase = createSupabaseServerClient(context.req, context.res);
  let query = supabase
    .from('meetings')
    .select('*')
    .order('meeting_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (selectedYear) query = query.eq('event_year', Number(selectedYear));
  const { data, error } = await query;

  return {
    props: {
      meetings: data ?? [],
      member: session.member,
      selectedYear,
      initialError: error?.message ?? '',
    },
  };
};
```

- [ ] **Step 5: 타입·lint·빌드**

Run: `npx tsc --noEmit && npx eslint pages/admin/meetings/index.tsx && npx next build 2>&1 | grep -iE "compiled|failed"`
Expected: 에러 0, Compiled successfully

- [ ] **Step 6: Commit**

```bash
npx prettier --write pages/admin/meetings/index.tsx
git add pages/admin/meetings/index.tsx
git commit -m "feat(admin): 회의록을 캠프 회차 기준으로 그룹 + 회차 필터"
```

---

### Task 6: 운영 백서 — 회차 선택·생성

**Files:**
- Modify: `pages/admin/whitepaper.tsx`

**Interfaces:**
- Consumes: `CAMP_EDITION_YEARS`, `campEditionLabel`, `whitepaperSlug`, `parseWhitepaperYear` (Task 1); 기존 저장 API `PUT /api/admin/documents/[slug]`(이미 slug별 upsert)
- Produces: 회차 선택 + 회차별 백서 표시/편집/생성

- [ ] **Step 1: getServerSideProps — 모든 회차 백서 로드 + 선택 회차**

기존 `WHITEPAPER_SLUG` 단일 조회를 교체. 파일 상단 import에 추가:
```typescript
import {
  CAMP_EDITION_YEARS,
  campEditionLabel,
  whitepaperSlug,
  parseWhitepaperYear,
} from '@/lib/campEditions';
```
`getServerSideProps`를 교체:
```typescript
export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  const supabase = createSupabaseServerClient(context.req, context.res);
  // 존재하는 모든 회차 백서(camp-*-whitepaper)를 한 번에 로드.
  const { data, error } = await supabase
    .from('admin_documents')
    .select('*')
    .like('slug', 'camp-%-whitepaper');

  const docs = (data as AdminDocument[] | null) ?? [];
  const docByYear: Record<number, AdminDocument> = {};
  for (const d of docs) {
    const y = parseWhitepaperYear(d.slug);
    if (y != null) docByYear[y] = d;
  }
  // 회차 목록 = 상수 회차 ∪ 백서가 존재하는 연도, 내림차순.
  const years = Array.from(
    new Set<number>([...CAMP_EDITION_YEARS, ...Object.keys(docByYear).map(Number)])
  ).sort((a, b) => b - a);

  const requestedYear =
    typeof context.query.year === 'string' && /^\d{4}$/.test(context.query.year)
      ? Number(context.query.year)
      : null;
  const selectedYear = requestedYear ?? years[0] ?? 2026;

  return {
    props: {
      years,
      selectedYear,
      document: docByYear[selectedYear] ?? null,
      member: session.member,
      initialError: error?.message ?? '',
    },
  };
};
```

- [ ] **Step 2: Props·상태 교체**

`WhitepaperPageProps`를 교체:
```typescript
interface WhitepaperPageProps {
  years: number[];
  selectedYear: number;
  document: AdminDocument | null;
  member: AdminMember;
  initialError?: string;
}
```
컴포넌트 시그니처에 `years`, `selectedYear` 추가. `DEFAULT_TITLE` 상수는 제거하고, 제목 기본값을 회차 기반으로:
```typescript
  const defaultTitle = `${campEditionLabel(selectedYear)} 운영 백서`;
```
`useState` 초기값에서 `DEFAULT_TITLE` → `defaultTitle`로, 저장 슬러그는 `whitepaperSlug(selectedYear)` 사용. 저장 fetch의 URL을 `/api/admin/documents/${whitepaperSlug(selectedYear)}`로 변경.

- [ ] **Step 3: 회차 선택 UI + 없는 회차 생성 안내**

페이지 상단(제목 위)에 회차 드롭다운 추가:
```tsx
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="wp-year" className="text-sm font-semibold text-deep-ocean">
          회차
        </label>
        <select
          id="wp-year"
          value={selectedYear}
          onChange={(e) => {
            window.location.href = `/admin/whitepaper?year=${e.target.value}`;
          }}
          className="rounded border border-deep-ocean/15 bg-white px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {campEditionLabel(year)}
            </option>
          ))}
        </select>
      </div>
```
문서가 없는 회차(`document === null`)일 때, 기존 "없음/편집 시작" 빈 상태 UI가 그대로 동작하면 됨(편집 후 저장하면 `whitepaperSlug(selectedYear)`로 upsert 생성). 빈 상태 문구에 회차를 반영: `"{campEditionLabel(selectedYear)} 백서가 아직 없습니다. ‘편집’으로 작성하세요."`

- [ ] **Step 4: 회차 전환 시 상태 재초기화**

페이지 컴포넌트가 회차 전환 시 새 props로 다시 마운트되도록, 페이지 export를 key로 감싸거나(권장) 또는 selectedYear를 의존하는 상태 초기화. 가장 단순하게 `_app`이 아니라 이 페이지에서: 최상위 반환 컴포넌트를 분리하고 `key={selectedYear}`로 감싼다. 예 — 기본 export를 래퍼로:
```tsx
export default function AdminWhitepaperPage(props: WhitepaperPageProps) {
  return <WhitepaperEditor key={props.selectedYear} {...props} />;
}
```
그리고 기존 컴포넌트 본문을 `function WhitepaperEditor({...}: WhitepaperPageProps) { ... }`로 이름 변경(상태 hooks 그대로). 회차 select의 `window.location.href` 이동은 SSR 재조회 + key 변경으로 상태가 깨끗이 초기화된다.

- [ ] **Step 5: 타입·lint·빌드**

Run: `npx tsc --noEmit && npx eslint pages/admin/whitepaper.tsx && npx next build 2>&1 | grep -iE "compiled|failed"`
Expected: 에러 0, Compiled successfully

- [ ] **Step 6: Commit**

```bash
npx prettier --write pages/admin/whitepaper.tsx
git add pages/admin/whitepaper.tsx
git commit -m "feat(admin): 운영 백서 회차 선택·회차별 표시/생성"
```

---

### Task 7: 마이그레이션 적용 + 전체 검증 + 푸시

(이 태스크는 컨트롤러가 직접 수행 — DB 적용 승인 필요)

- [ ] **Step 1: 마이그레이션 적용 (사용자 승인 후)**

Run: `supabase db push --linked --include-all`
Expected: `meetings_event_year` 적용. 이어서 검증:
```bash
export KEY=$(supabase projects api-keys --project-ref jmelvfcluezlhdxewger 2>/dev/null | grep -i "service_role" | grep -oE 'eyJ[A-Za-z0-9._-]+')
KEY="$KEY" node -e 'const{createClient}=require("@supabase/supabase-js");const s=createClient("https://jmelvfcluezlhdxewger.supabase.co",process.env.KEY);s.from("meetings").select("event_year").then(r=>console.log("event_year 분포:",[...new Set((r.data||[]).map(x=>x.event_year))],"null:",(r.data||[]).filter(x=>x.event_year==null).length))'
```
Expected: `event_year 분포: [2026] null: 0`

- [ ] **Step 2: 전체 게이트**

Run: `npx prettier --check "src/**/*.{ts,tsx}" "pages/**/*.{ts,tsx}" && npx eslint src pages && npx tsc --noEmit && npx jest campEditions`
Expected: 모두 통과

- [ ] **Step 3: 푸시**

```bash
git push origin main
```

---

## 비고
- 백서 저장 API(`/api/admin/documents/[slug].ts`)는 이미 slug별 upsert라 신규 회차 백서 생성에 추가 작업 불필요.
- 회의 상세([id].tsx)는 메타데이터를 작성 시에만 설정하는 기존 UX라 event_year 편집 UI는 추가하지 않음(수정 API는 future-proof로 받아만 둠). 기존 14건은 마이그레이션으로 2026 백필.
- `window.location.href` 이동은 기존 회의록/관리 페이지의 단순 내비 패턴과 일관(필요 시 router.push로 교체 가능하나 이 화면들은 전체 새로고침이 안전).
