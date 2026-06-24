# 관리자 아카이브 연도·유형 2축 필터 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 비디오·갤러리·언론보도 관리 목록을 유형(탭)+연도(드롭다운) 2축으로 필터링하게 한다.

**Architecture:** 갤러리 전용 결합형 `AdminFacet`(`cat=camp:2026`)을 제거하고, `event_type`/`event_year`를 받는 2축 독립 필터(`type`/`year` 쿼리 파라미터)로 일반화한다. 필터 옵션은 SSR에서 테이블의 `event_type,event_year` 두 컬럼을 읽어 실제 존재하는 값만 동적 생성한다. AdminCollectionPage 상단에 유형 탭 + 연도 드롭다운(`AdminArchiveFilterBar`)을 렌더한다.

**Tech Stack:** Next.js (pages router), TypeScript, Supabase(PostgREST), jest, Tailwind.

## Global Constraints

- 의존성은 **pnpm**, `package.json` 변경 시 `pnpm-lock.yaml` 함께 커밋(이 작업은 의존성 추가 없음).
- 커밋 전 **prettier**(`npx prettier --write <files>`). CI: `format:check`·`lint`·`typecheck`·`test`·`i18n:check`.
- 테스트 러너는 **jest**(`npx jest <pattern>`). vitest 아님.
- 관리자 API는 `requireAdminRole`/`getAdminSession` 게이트 유지. RLS는 기존대로.
- 범위: **비디오·갤러리·언론보도** 3개 컬렉션만. 회의록·백서 건드리지 않음.
- 유형 라벨: 캠프/앨범/라이브/뮤직비디오/인터뷰 (`EVENT_TYPE_OPTIONS` 기존 값 그대로).
- 응답·UI 문구 한국어. 작업 완료 후 `git push origin main`.
- `noUncheckedIndexedAccess`가 켜져 있으니 배열 인덱싱 시 가드.

---

### Task 1: adminArchive.ts — 2축 필터 모델로 교체 (TDD)

**Files:**
- Modify: `src/lib/adminArchive.ts`
- Test: `src/lib/adminArchive.test.ts`

**Interfaces:**
- Consumes: `EVENT_TYPE_OPTIONS` (기존), `EventType`
- Produces:
  - `interface ArchiveFilterOption { label: string; value: string }`
  - `buildArchiveFilters(input: { type?: string; year?: string }): Record<string, string>` — 값 있는 것만 `event_type`/`event_year` 키로
  - `buildArchiveFacetOptions(rows: { event_type: string | null; event_year: number | null }[]): { typeOptions: ArchiveFilterOption[]; yearOptions: ArchiveFilterOption[] }` — distinct·정렬·라벨, 맨 앞 `{label:'전체', value:''}`
  - `AdminCollectionConfig`에 `yearTypeFilter?: boolean` 추가
  - 제거: `AdminFacet` 인터페이스, `parseAdminFacetValue`, config의 `facet` 필드

- [ ] **Step 1: 실패하는 테스트 작성**

`src/lib/adminArchive.test.ts` 파일 끝에 추가:
```typescript
import { buildArchiveFilters, buildArchiveFacetOptions } from './adminArchive';

test('buildArchiveFilters는 값이 있는 축만 eq 필터로 만든다', () => {
  expect(buildArchiveFilters({ type: 'camp', year: '2026' })).toEqual({
    event_type: 'camp',
    event_year: '2026',
  });
  expect(buildArchiveFilters({ type: 'live' })).toEqual({ event_type: 'live' });
  expect(buildArchiveFilters({ year: '2024' })).toEqual({ event_year: '2024' });
  expect(buildArchiveFilters({})).toEqual({});
  expect(buildArchiveFilters({ type: '', year: '' })).toEqual({});
});

test('buildArchiveFacetOptions는 존재하는 유형·연도만 라벨·정렬해 전체 선두로 만든다', () => {
  const rows = [
    { event_type: 'camp', event_year: 2026 },
    { event_type: 'camp', event_year: 2023 },
    { event_type: 'live', event_year: 2024 },
    { event_type: 'camp', event_year: 2026 },
    { event_type: null, event_year: null },
  ];
  const { typeOptions, yearOptions } = buildArchiveFacetOptions(rows);
  // 유형: EVENT_TYPE_OPTIONS 순서(camp, album, live, ...) 중 존재하는 것만 + 전체 선두
  expect(typeOptions).toEqual([
    { label: '전체', value: '' },
    { label: '캠프', value: 'camp' },
    { label: '라이브', value: 'live' },
  ]);
  // 연도: 내림차순 + 전체 선두
  expect(yearOptions).toEqual([
    { label: '전체', value: '' },
    { label: '2026', value: '2026' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
  ]);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx jest adminArchive`
Expected: FAIL ("buildArchiveFilters is not a function" 등)

- [ ] **Step 3: 헬퍼 구현 + facet 제거**

`src/lib/adminArchive.ts`에서:

(a) `AdminFacet` 인터페이스(58~66행 주석 포함)와 `parseAdminFacetValue` 함수(82~98행)를 삭제.

(b) `AdminCollectionConfig`에서 `facet?: AdminFacet;` 줄을 `yearTypeFilter?: boolean;`로 교체(주석도 갱신):
```typescript
  // 연도/유형 2축 서버측 필터 사용 여부(아카이브 컬렉션).
  yearTypeFilter?: boolean;
```

(c) `EVENT_TYPE_OPTIONS` 정의 아래에 헬퍼 추가:
```typescript
export interface ArchiveFilterOption {
  label: string;
  value: string;
}

// 유형/연도 선택값을 event_type/event_year eq 필터(Record)로 변환. 빈 값은 제외.
export const buildArchiveFilters = (input: { type?: string; year?: string }): Record<
  string,
  string
> => {
  const filters: Record<string, string> = {};
  if (input.type) filters.event_type = input.type;
  if (input.year) filters.event_year = input.year;
  return filters;
};

const EVENT_TYPE_LABEL = new Map<string, string>(
  EVENT_TYPE_OPTIONS.map((o) => [o.value, o.label])
);
const EVENT_TYPE_ORDER = new Map<string, number>(
  EVENT_TYPE_OPTIONS.map((o, i) => [o.value, i])
);

// 테이블 행에서 실제 존재하는 유형·연도만 추출해 필터 옵션 생성('전체' 선두).
export const buildArchiveFacetOptions = (
  rows: { event_type: string | null; event_year: number | null }[]
): { typeOptions: ArchiveFilterOption[]; yearOptions: ArchiveFilterOption[] } => {
  const types = new Set<string>();
  const years = new Set<number>();
  for (const r of rows) {
    if (r.event_type) types.add(r.event_type);
    if (typeof r.event_year === 'number') years.add(r.event_year);
  }
  const typeOptions: ArchiveFilterOption[] = [
    { label: '전체', value: '' },
    ...[...types]
      .sort((a, b) => (EVENT_TYPE_ORDER.get(a) ?? 999) - (EVENT_TYPE_ORDER.get(b) ?? 999))
      .map((t) => ({ label: EVENT_TYPE_LABEL.get(t) ?? t, value: t })),
  ];
  const yearOptions: ArchiveFilterOption[] = [
    { label: '전체', value: '' },
    ...[...years].sort((a, b) => b - a).map((y) => ({ label: String(y), value: String(y) })),
  ];
  return { typeOptions, yearOptions };
};
```

(d) videos·gallery·press config에서 `facet: {...}` 블록(갤러리)을 삭제하고 세 곳 모두에 `yearTypeFilter: true,`를 추가(예: `table` 줄 아래 또는 `imageField` 근처, config 객체 최상위 속성으로).

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx jest adminArchive`
Expected: PASS

- [ ] **Step 5: 타입 확인 (참조 깨짐 노출)**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: `parseAdminFacetValue`/`facet`/`AdminFacet` 참조하던 `adminPageData.ts`·`archive/[collection].ts`·`AdminCollectionPage.tsx`에서 에러가 남(다음 태스크에서 해결). 이 태스크 파일(adminArchive.ts) 자체 에러는 0이어야 함.

- [ ] **Step 6: Commit**

```bash
npx prettier --write src/lib/adminArchive.ts src/lib/adminArchive.test.ts
git add src/lib/adminArchive.ts src/lib/adminArchive.test.ts
git commit -m "feat(admin): 아카이브 2축 필터 헬퍼(buildArchiveFilters/FacetOptions) + facet 제거"
```

---

### Task 2: SSR + 목록 API — type/year + 동적 옵션

**Files:**
- Modify: `src/lib/adminPageData.ts`
- Modify: `pages/api/admin/archive/[collection].ts`

**Interfaces:**
- Consumes: `buildArchiveFilters`, `buildArchiveFacetOptions` (Task 1)
- Produces: `loadAdminCollectionPageProps`가 props로 `selectedType: string`, `selectedYear: string`, `typeOptions: ArchiveFilterOption[]`, `yearOptions: ArchiveFilterOption[]` 전달(기존 `selectedFacet` 제거). 목록 API가 `?type=&year=` 적용.

- [ ] **Step 1: adminPageData.ts 교체**

`parseAdminFacetValue` import를 `buildArchiveFilters, buildArchiveFacetOptions, type ArchiveFilterOption`로 교체. facet 관련 블록을 다음으로 교체:
```typescript
  const readParam = (key: string) =>
    typeof context.query[key] === 'string' ? (context.query[key] as string) : '';
  const selectedType = config.yearTypeFilter ? readParam('type') : '';
  const selectedYear = config.yearTypeFilter ? readParam('year') : '';
  const filters = config.yearTypeFilter
    ? buildArchiveFilters({ type: selectedType, year: selectedYear })
    : {};

  const supabase = createSupabaseServerClient(context.req, context.res);

  // 필터 옵션(유형·연도)을 실제 데이터에서 동적 생성 — locale 무관 전체 기준.
  let typeOptions: ArchiveFilterOption[] = [];
  let yearOptions: ArchiveFilterOption[] = [];
  if (config.yearTypeFilter) {
    const { data: facetRows } = await supabase.from(config.table).select('event_type, event_year');
    const opts = buildArchiveFacetOptions(facetRows ?? []);
    typeOptions = opts.typeOptions;
    yearOptions = opts.yearOptions;
  }
```
그리고 query 빌드에서 `if (filters)` → `if (Object.keys(filters).length > 0)`로, 두 return의 props에서 `selectedFacet` 제거하고 `selectedType, selectedYear, typeOptions, yearOptions` 추가.

전체 교체본(함수 전체):
```typescript
import type { GetServerSidePropsContext } from 'next';
import { getAdminSession, redirectToAdminLogin } from './adminAuth';
import {
  ADMIN_COLLECTION_PAGE_SIZE,
  getAdminCollectionConfig,
  getAdminPaginationRange,
  buildArchiveFilters,
  buildArchiveFacetOptions,
  type ArchiveFilterOption,
  type AdminCollection,
} from './adminArchive';
import { createSupabaseServerClient } from './supabaseServer';
import { isSupportedLocale } from '@/constants/locales';

export const loadAdminCollectionPageProps = async (
  context: GetServerSidePropsContext,
  collection: AdminCollection
) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  const config = getAdminCollectionConfig(collection);
  if (!config) return { notFound: true };
  const selectedLocale =
    typeof context.query.locale === 'string' && isSupportedLocale(context.query.locale)
      ? context.query.locale
      : 'ko';

  const readParam = (key: string) =>
    typeof context.query[key] === 'string' ? (context.query[key] as string) : '';
  const selectedType = config.yearTypeFilter ? readParam('type') : '';
  const selectedYear = config.yearTypeFilter ? readParam('year') : '';
  const filters = config.yearTypeFilter
    ? buildArchiveFilters({ type: selectedType, year: selectedYear })
    : {};

  const supabase = createSupabaseServerClient(context.req, context.res);

  let typeOptions: ArchiveFilterOption[] = [];
  let yearOptions: ArchiveFilterOption[] = [];
  if (config.yearTypeFilter) {
    const { data: facetRows } = await supabase.from(config.table).select('event_type, event_year');
    const opts = buildArchiveFacetOptions(
      (facetRows as { event_type: string | null; event_year: number | null }[] | null) ?? []
    );
    typeOptions = opts.typeOptions;
    yearOptions = opts.yearOptions;
  }

  const range = getAdminPaginationRange({ offset: 0, limit: ADMIN_COLLECTION_PAGE_SIZE });
  let query = supabase
    .from(config.table)
    .select('*', { count: 'exact' })
    .eq('locale', selectedLocale);
  for (const [field, value] of Object.entries(filters)) {
    query = query.eq(field, value);
  }
  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(range.from, range.to);

  const baseProps = {
    config,
    member: session.member,
    selectedLocale,
    selectedType,
    selectedYear,
    typeOptions,
    yearOptions,
  };

  if (error) {
    return {
      props: {
        ...baseProps,
        initialItems: [],
        initialTotalCount: 0,
        initialNextOffset: 0,
        initialHasMore: false,
        initialError: error.message,
      },
    };
  }

  return {
    props: {
      ...baseProps,
      initialItems: data ?? [],
      initialTotalCount: count ?? data?.length ?? 0,
      initialNextOffset: data?.length ?? 0,
      initialHasMore: (data?.length ?? 0) < (count ?? 0),
    },
  };
};
```

- [ ] **Step 2: 목록 API 교체**

`pages/api/admin/archive/[collection].ts`에서 `parseAdminFacetValue` import를 `buildArchiveFilters`로 교체. list 핸들러의 facet 블록(70~76행 근처)을 교체:
```typescript
    const offset = Number(req.query.offset ?? 0);
    const limit = Number(req.query.limit ?? ADMIN_COLLECTION_PAGE_SIZE);
    const readParam = (key: string) =>
      typeof req.query[key] === 'string' ? (req.query[key] as string) : '';
    const filters = config.yearTypeFilter
      ? buildArchiveFilters({ type: readParam('type'), year: readParam('year') })
      : {};
```
그리고 `listAdminArchiveRows({ ... filters: filters ?? undefined })`를 `filters: Object.keys(filters).length > 0 ? filters : undefined`로 변경.

- [ ] **Step 3: 타입·lint 확인**

Run: `npx tsc --noEmit 2>&1 | head -20 && npx eslint src/lib/adminPageData.ts "pages/api/admin/archive/[collection].ts"`
Expected: adminPageData.ts·archive API 에러 0. (AdminCollectionPage.tsx는 아직 selectedFacet 참조로 에러 — Task 4에서 해결)

- [ ] **Step 4: Commit**

```bash
npx prettier --write src/lib/adminPageData.ts "pages/api/admin/archive/[collection].ts"
git add src/lib/adminPageData.ts "pages/api/admin/archive/[collection].ts"
git commit -m "feat(admin): 아카이브 목록 SSR/API에 type/year 필터 + 동적 옵션"
```

---

### Task 3: AdminArchiveFilterBar 컴포넌트

**Files:**
- Create: `src/components/admin/AdminArchiveFilterBar.tsx`

**Interfaces:**
- Consumes: `ArchiveFilterOption` (Task 1)
- Produces: 기본 export 컴포넌트
  ```typescript
  interface AdminArchiveFilterBarProps {
    typeOptions: ArchiveFilterOption[];
    yearOptions: ArchiveFilterOption[];
    selectedType: string;
    selectedYear: string;
    onChangeType: (value: string) => void;
    onChangeYear: (value: string) => void;
  }
  ```

- [ ] **Step 1: 컴포넌트 작성**

`src/components/admin/AdminArchiveFilterBar.tsx`:
```typescript
import type { ArchiveFilterOption } from '@/lib/adminArchive';

interface AdminArchiveFilterBarProps {
  typeOptions: ArchiveFilterOption[];
  yearOptions: ArchiveFilterOption[];
  selectedType: string;
  selectedYear: string;
  onChangeType: (value: string) => void;
  onChangeYear: (value: string) => void;
}

// 아카이브 목록 상단 필터: 유형 탭(pill) + 연도 드롭다운.
export default function AdminArchiveFilterBar({
  typeOptions,
  yearOptions,
  selectedType,
  selectedYear,
  onChangeType,
  onChangeYear,
}: AdminArchiveFilterBarProps) {
  return (
    <div className="space-y-2">
      {typeOptions.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-coastal-gray">유형</span>
          {typeOptions.map((opt) => {
            const active = selectedType === opt.value;
            return (
              <button
                key={opt.value || 'all'}
                type="button"
                onClick={() => onChangeType(opt.value)}
                className={`rounded-full px-3 py-1 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean ${
                  active
                    ? 'bg-jeju-ocean font-semibold text-white'
                    : 'bg-white text-deep-ocean ring-1 ring-deep-ocean/15 hover:bg-ocean-sand/40'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
      {yearOptions.length > 1 && (
        <label className="flex items-center gap-2 text-xs font-semibold text-coastal-gray">
          연도
          <select
            value={selectedYear}
            onChange={(e) => onChangeYear(e.target.value)}
            className="rounded border border-deep-ocean/15 bg-white px-3 py-1.5 text-sm font-normal text-deep-ocean focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20"
          >
            {yearOptions.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 타입·lint 확인**

Run: `npx tsc --noEmit 2>&1 | grep AdminArchiveFilterBar; npx eslint src/components/admin/AdminArchiveFilterBar.tsx`
Expected: 이 파일 관련 에러 0.

- [ ] **Step 3: Commit**

```bash
npx prettier --write src/components/admin/AdminArchiveFilterBar.tsx
git add src/components/admin/AdminArchiveFilterBar.tsx
git commit -m "feat(admin): 아카이브 필터 바(유형 탭 + 연도 드롭다운) 컴포넌트"
```

---

### Task 4: AdminCollectionPage 연결 + 기존 facet 제거

**Files:**
- Modify: `src/components/admin/AdminCollectionPage.tsx`

**Interfaces:**
- Consumes: `AdminArchiveFilterBar` (Task 3), props `selectedType/selectedYear/typeOptions/yearOptions` (Task 2)
- Produces: 동작하는 2축 필터 UI

- [ ] **Step 1: Props 인터페이스·구조분해 교체**

`AdminCollectionPageProps`에서 `selectedFacet?: string;`를 제거하고 추가:
```typescript
  selectedType: string;
  selectedYear: string;
  typeOptions: ArchiveFilterOption[];
  yearOptions: ArchiveFilterOption[];
```
import에 `import AdminArchiveFilterBar from './AdminArchiveFilterBar';` 추가, `adminArchive` import 타입에 `type ArchiveFilterOption` 추가. 컴포넌트 구조분해 인자에서 `selectedFacet = ''` 제거하고 `selectedType, selectedYear, typeOptions, yearOptions` 추가.

- [ ] **Step 2: 파라미터 빌더·핸들러 교체**

`const facetParam = config.facet?.param;` 줄 삭제. `buildListParams`의 facet 줄을 교체:
```typescript
  const buildListParams = (offset: number, limit: number) => {
    const params = new URLSearchParams({
      locale: selectedLocale,
      offset: String(offset),
      limit: String(limit),
    });
    if (selectedType) params.set('type', selectedType);
    if (selectedYear) params.set('year', selectedYear);
    return params;
  };
```
`changeFacet` 함수를 다음 두 핸들러로 교체:
```typescript
  const changeFilter = async (next: { type?: string; year?: string }) => {
    const params = new URLSearchParams({ locale: selectedLocale });
    const type = next.type ?? selectedType;
    const year = next.year ?? selectedYear;
    if (type) params.set('type', type);
    if (year) params.set('year', year);
    await router.push(`${config.listPath}?${params.toString()}`);
  };
```
(기존 `changeLocale`에도 facet 유지 로직이 있으면 type/year로 교체: locale 변경 시 현재 type/year 유지)
```typescript
  const changeLocale = async (nextLocale: string) => {
    const params = new URLSearchParams({ locale: nextLocale });
    if (selectedType) params.set('type', selectedType);
    if (selectedYear) params.set('year', selectedYear);
    await router.push(`${config.listPath}?${params.toString()}`);
  };
```

- [ ] **Step 3: 렌더 교체 (facet select → 필터 바)**

기존 `{config.facet && ( <label>...<select>... )}` 블록(548~560행 근처)을 교체:
```tsx
        {config.yearTypeFilter && (
          <AdminArchiveFilterBar
            typeOptions={typeOptions}
            yearOptions={yearOptions}
            selectedType={selectedType}
            selectedYear={selectedYear}
            onChangeType={(value) => void changeFilter({ type: value })}
            onChangeYear={(value) => void changeFilter({ year: value })}
          />
        )}
```

- [ ] **Step 4: 타입·lint·빌드 확인**

Run: `npx tsc --noEmit && npx eslint src pages 2>&1 | tail -5 && npx next build 2>&1 | grep -iE "compiled|failed"`
Expected: tsc 0, eslint 0 errors(기존 set-state-in-effect warning 허용), build Compiled successfully.

- [ ] **Step 5: Commit**

```bash
npx prettier --write src/components/admin/AdminCollectionPage.tsx
git add src/components/admin/AdminCollectionPage.tsx
git commit -m "feat(admin): 아카이브 목록에 유형/연도 2축 필터 바 연결(facet 제거)"
```

---

### Task 5: 전체 검증 + 푸시

- [ ] **Step 1: 전체 게이트**

Run: `npx prettier --check "src/**/*.{ts,tsx}" "pages/**/*.{ts,tsx}" && npx eslint src pages && npx tsc --noEmit && npx jest adminArchive`
Expected: 모두 통과(jest adminArchive 신규 2 테스트 포함).

- [ ] **Step 2: 런타임 확인 (수동, 선택)**

dev에서 `/admin/videos` 진입 → 유형 탭(캠프·앨범·라이브·뮤비·인터뷰) + 연도 드롭다운 노출, 탭/연도 변경 시 목록 갱신, URL에 `?type=&year=` 반영 확인. 갤러리·언론보도도 동일.

- [ ] **Step 3: 푸시**

```bash
git push origin main
```
Expected: 푸시 성공, Vercel 빌드 통과.

---

## 비고

- `listAdminArchiveRows`는 `filters?: Record<string,string>`를 그대로 받으므로 시그니처 변경 없음.
- 갤러리 16K행의 `event_type,event_year` 2컬럼 SSR 조회는 1회·경량. 추후 성능 이슈 시 distinct RPC로 교체(범위 밖).
- 기존 테스트는 facet를 참조하지 않으므로 회귀 없음. 신규 테스트만 추가.
- 공개 사이트·회의록·백서는 건드리지 않음.
