# 2026 캠프 타임테이블 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2026 캠프 페이지에 3일간 54팀의 공연 일정을 탭 기반 세로 타임라인으로 표시한다.

**Architecture:** 엑셀(`timetable_v5.xlsx`)을 빌드 타임에 TypeScript 모듈로 변환하는 스크립트를 도입하고, 기존 뮤지션 매핑(`src/data/camps.ts` camp-2026 participants)을 활용해 이름↔ID 연결을 수행한다. 기존 `Lineup` 섹션의 본문을 `CampTimetable` 컴포넌트로 교체한다.

**Tech Stack:** Next.js 14 Pages Router · React 18 · TypeScript · Tailwind CSS · framer-motion · next-i18next · Jest + React Testing Library

**Spec:** [docs/superpowers/specs/2026-04-22-camp2026-timetable-design.md](../specs/2026-04-22-camp2026-timetable-design.md)

---

## 파일 구조

### 신규 생성

| 파일 | 책임 |
|------|------|
| `scripts/convert-timetable.ts` | 엑셀 → TS 모듈 변환 CLI |
| `scripts/__tests__/convert-timetable.test.ts` | 변환 로직 단위 테스트 |
| `src/components/camp/timetable/types.ts` | 타입 정의 |
| `src/components/camp/timetable/ScaleBadge.tsx` | 규모 배지 |
| `src/components/camp/timetable/__tests__/ScaleBadge.test.tsx` | 배지 테스트 |
| `src/components/camp/timetable/TimetableActCard.tsx` | 공연 카드 1개 |
| `src/components/camp/timetable/__tests__/TimetableActCard.test.tsx` | 카드 테스트 |
| `src/components/camp/timetable/TimetableTransition.tsx` | 전환 구간 구분자 |
| `src/components/camp/timetable/TimetableDayView.tsx` | 단일 날짜 타임라인 |
| `src/components/camp/timetable/CampTimetable.tsx` | 탭 + 패널 |
| `src/components/camp/timetable/__tests__/CampTimetable.test.tsx` | 탭 통합 테스트 |
| `src/components/camp/timetable/index.ts` | 배럴 export |
| `src/data/timetable-2026.ts` | 변환 결과 (스크립트 출력) |

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `package.json` | `xlsx` 의존성 추가, `build:timetable` 스크립트 추가 |
| `src/pages/Camp2026Page.tsx:230-256` | Lineup 섹션 본문을 `<CampTimetable />`로 교체 |
| `src/utils/structuredData.ts` | `getEventSchema`에 `subEvents` 파라미터 추가 |
| `public/locales/ko/translation.json` | `timetable.*` 키 추가 |
| `public/locales/en/translation.json` | `timetable.*` 키 추가 |
| `public/locales/{es,fr,de,pt,ru,ar,ja,zh-Hans,zh-Hant,hi,id}/translation.json` | `timetable.*` 키 추가 |
| `src/components/camp/index.ts` | 타임테이블 배럴 export 추가 |

---

## Task 1: xlsx 의존성 추가

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 의존성 설치**

```bash
npm install --save-dev xlsx@^0.18.5
```

Expected: `xlsx`가 devDependencies에 추가되고 `package-lock.json`이 갱신됨.

- [ ] **Step 2: 스크립트 엔트리 추가**

`package.json`의 `scripts` 객체에 한 줄 추가:

```json
"build:timetable": "ts-node scripts/convert-timetable.ts"
```

- [ ] **Step 3: 설치 확인**

```bash
node -e "console.log(require('xlsx').version)"
```

Expected: 버전 문자열 출력 (예: `0.18.5`)

- [ ] **Step 4: 커밋**

```bash
git add package.json package-lock.json
git commit -m "chore: add xlsx dependency for timetable conversion"
```

---

## Task 2: 타입 정의

**Files:**
- Create: `src/components/camp/timetable/types.ts`

- [ ] **Step 1: 타입 파일 작성**

```ts
export type ActType = 'performance' | 'transition';
export type Scale = 'solo' | 'band' | 'big-band' | 'ensemble';

export interface TimetableAct {
  order: number | null;
  start: string;
  end: string;
  type: ActType;
  name: string;
  scale?: Scale;
  musicianIds?: number[];
  transitionMinutes?: number;
  nextActName?: string;
}

export type Weekday = 'fri' | 'sat' | 'sun';

export interface TimetableDay {
  date: string;
  dayLabel: string;
  weekday: Weekday;
  teamCount: number;
  startTime: string;
  endTime: string;
  acts: TimetableAct[];
}

export interface Timetable {
  year: number;
  days: TimetableDay[];
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/components/camp/timetable/types.ts
git commit -m "feat(timetable): add type definitions"
```

---

## Task 3: 변환 스크립트의 순수 함수 단위 테스트 (TDD)

**Files:**
- Create: `scripts/__tests__/convert-timetable.test.ts`

이 Task에서는 변환 스크립트의 핵심 유틸 3개를 TDD로 만든다: 규모 매핑, 이름 정규화, 행 파싱.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import {
  mapScale,
  normalizeName,
  parseTransitionMinutes,
  parseRow,
} from '../convert-timetable';

describe('mapScale', () => {
  test.each([
    ['솔로/듀오', 'solo'],
    ['밴드(1인)', 'solo'],
    ['밴드(2인)', 'solo'],
    ['밴드(3-4인)', 'band'],
    ['밴드(5인+)', 'big-band'],
    ['밴드(다수)', 'ensemble'],
  ])('maps %s to %s', (input, expected) => {
    expect(mapScale(input)).toBe(expected);
  });

  test('returns undefined for unknown', () => {
    expect(mapScale('모름')).toBeUndefined();
  });
});

describe('normalizeName', () => {
  test('trims and removes extra spaces', () => {
    expect(normalizeName('  윤선애  ')).toBe('윤선애');
    expect(normalizeName('블로꾸  자파리')).toBe('블로꾸 자파리');
  });

  test('preserves unicode', () => {
    expect(normalizeName('최상돈 × 김강곤')).toBe('최상돈 × 김강곤');
  });
});

describe('parseTransitionMinutes', () => {
  test('extracts minutes from transition label', () => {
    expect(parseTransitionMinutes('⟶ 5분 (다음: ...)')).toBe(5);
    expect(parseTransitionMinutes('⟶ 10분 (다음: ...)')).toBe(10);
  });

  test('returns null when no pattern', () => {
    expect(parseTransitionMinutes('something else')).toBeNull();
  });
});

describe('parseRow', () => {
  const lookup = new Map<string, number>([
    ['윤선애', 40],
    ['최상돈 × 김강곤', 48],
  ]);

  test('parses a performance row', () => {
    const row = ['6/5(금)', 3, '18:00', '18:25', '공연', '윤선애', 'rider', '솔로/듀오', 1, 'note'];
    expect(parseRow(row, lookup)).toEqual({
      order: 3,
      start: '18:00',
      end: '18:25',
      type: 'performance',
      name: '윤선애',
      scale: 'solo',
      musicianIds: [40],
    });
  });

  test('parses a transition row', () => {
    const row = ['6/5(금)', null, '18:25', '18:30', '전환', '⟶ 5분 (다음: HANASH - 솔로/듀오)', null, null, null, null];
    expect(parseRow(row, lookup)).toEqual({
      order: null,
      start: '18:25',
      end: '18:30',
      type: 'transition',
      name: '⟶ 5분 (다음: HANASH - 솔로/듀오)',
      transitionMinutes: 5,
      nextActName: 'HANASH',
    });
  });

  test('returns null for empty rows', () => {
    expect(parseRow([null, null, null, null, null, null, null, null, null, null], lookup)).toBeNull();
  });

  test('performance row with unknown name has no musicianIds', () => {
    const row = ['6/5(금)', 5, '13:00', '13:25', '공연', '불가사리 즉흥세션', 'X', '솔로/듀오', 0, ''];
    const result = parseRow(row, lookup);
    expect(result?.musicianIds).toBeUndefined();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx jest scripts/__tests__/convert-timetable.test.ts
```

Expected: 모든 테스트가 "Cannot find module" 또는 "is not a function"으로 실패.

- [ ] **Step 3: 최소 구현 작성**

`scripts/convert-timetable.ts`를 새로 만들되, 이번 Task에서는 export된 순수 함수만 구현한다. 파일 파싱은 Task 4에서 추가.

```ts
#!/usr/bin/env ts-node
import { Scale, TimetableAct } from '../src/components/camp/timetable/types';

const SCALE_MAP: Record<string, Scale> = {
  '솔로/듀오': 'solo',
  '밴드(1인)': 'solo',
  '밴드(2인)': 'solo',
  '밴드(3-4인)': 'band',
  '밴드(5인+)': 'big-band',
  '밴드(다수)': 'ensemble',
};

export function mapScale(raw: string): Scale | undefined {
  return SCALE_MAP[raw.trim()];
}

export function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function parseTransitionMinutes(raw: string): number | null {
  const match = raw.match(/⟶\s*(\d+)\s*분/);
  return match ? Number(match[1]) : null;
}

function parseNextActName(raw: string): string | undefined {
  const match = raw.match(/다음:\s*([^-()]+)\s*-/);
  return match ? match[1].trim() : undefined;
}

type RawRow = (string | number | null | undefined)[];

export function parseRow(row: RawRow, nameToId: Map<string, number>): TimetableAct | null {
  const [, orderRaw, start, end, kind, name, , scaleRaw] = row;

  if (!start || !end || !kind || !name) return null;

  if (kind === '전환') {
    return {
      order: null,
      start: String(start),
      end: String(end),
      type: 'transition',
      name: String(name),
      transitionMinutes: parseTransitionMinutes(String(name)) ?? undefined,
      nextActName: parseNextActName(String(name)),
    };
  }

  if (kind === '공연') {
    const normalized = normalizeName(String(name));
    const id = nameToId.get(normalized);
    const scale = scaleRaw ? mapScale(String(scaleRaw)) : undefined;

    const act: TimetableAct = {
      order: typeof orderRaw === 'number' ? orderRaw : Number(orderRaw),
      start: String(start),
      end: String(end),
      type: 'performance',
      name: normalized,
    };

    if (scale) act.scale = scale;
    if (id !== undefined) act.musicianIds = [id];

    return act;
  }

  return null;
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx jest scripts/__tests__/convert-timetable.test.ts
```

Expected: 모든 테스트 PASS.

- [ ] **Step 5: 커밋**

```bash
git add scripts/convert-timetable.ts scripts/__tests__/convert-timetable.test.ts
git commit -m "feat(timetable): add pure conversion helpers with tests"
```

---

## Task 4: 엑셀 파싱 및 변환 로직 완성

**Files:**
- Modify: `scripts/convert-timetable.ts`

- [ ] **Step 1: override 맵 및 메인 변환 함수 추가**

`scripts/convert-timetable.ts`의 기존 함수 아래에 다음을 추가:

```ts
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { Timetable, TimetableDay, Weekday } from '../src/components/camp/timetable/types';
// camps.ts의 2026 참가자 목록을 import해서 매핑 테이블 구성
import { campsStructural } from '../src/data/camps';

// 엑셀 표기와 camps.ts(ko) 표기가 다른 경우의 수동 매핑
// key: 엑셀의 원본 이름, value: camps.ts(ko)의 canonical 이름
const NAME_OVERRIDES: Record<string, string> = {
  '블로꾸자파리/뽈레뽈레/북짝북짝': '블로꾸 자파리 X 뽈레뽈레 X 북짝북짝',
  '머티리얼즈 파운드': 'Materials Pound',
  '사바하': 'Sabbaha',
  '메리디에스': 'Meridies',
  '도그라스트페이지': 'Dog Last Page',
  '허니위스키': 'Honey Whiskey',
  'Dear arcadian': 'Dear Arcadian',
  '레인보우99': 'Rainbow99',
  '사이트 with 제트싸이져': 'Sight X Zsthyger',
  '지누콘다': 'Jinu Konda',
};

const DAY_META: Record<string, { date: string; weekday: Weekday; dayLabel: string }> = {
  '6월5일(금)': { date: '2026-06-05', weekday: 'fri', dayLabel: '6/5 (금)' },
  '6월6일(토)': { date: '2026-06-06', weekday: 'sat', dayLabel: '6/6 (토)' },
  '6월7일(일)': { date: '2026-06-07', weekday: 'sun', dayLabel: '6/7 (일)' },
};

function buildNameToIdMap(): Map<string, number> {
  // 이 함수는 Task 4.2에서 구현
  // 임시로 빈 Map 반환
  return new Map();
}

function parseSheet(sheet: XLSX.WorkSheet, nameToId: Map<string, number>): Array<ReturnType<typeof parseRow>> {
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { header: 1, defval: null });
  // 첫 줄은 헤더, 나머지만 파싱
  return rows.slice(1).map((row) => parseRow(row, nameToId)).filter(Boolean);
}

function convertTimetable(xlsxPath: string): Timetable {
  const workbook = XLSX.readFile(xlsxPath);
  const nameToId = buildNameToIdMap();

  const days: TimetableDay[] = [];

  for (const sheetName of workbook.SheetNames) {
    const meta = DAY_META[sheetName];
    if (!meta) continue;

    const acts = parseSheet(workbook.Sheets[sheetName], nameToId);
    const performances = acts.filter((a): a is NonNullable<typeof a> => a !== null && a.type === 'performance');

    days.push({
      date: meta.date,
      dayLabel: meta.dayLabel,
      weekday: meta.weekday,
      teamCount: performances.length,
      startTime: acts[0]?.start ?? '',
      endTime: acts[acts.length - 1]?.end ?? '',
      acts: acts.filter((a): a is NonNullable<typeof a> => a !== null),
    });
  }

  return { year: 2026, days };
}

function writeOutput(data: Timetable, outPath: string): void {
  const header = `// AUTO-GENERATED by scripts/convert-timetable.ts — do not edit manually\n`;
  const body = `import type { Timetable } from '../components/camp/timetable/types';\n\nexport const timetable2026: Timetable = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(outPath, header + body, 'utf-8');
}

// Entry point
if (require.main === module) {
  const xlsxPath = path.resolve(__dirname, '../docs/2026캠프 운영/timetable_v5.xlsx');
  const outPath = path.resolve(__dirname, '../src/data/timetable-2026.ts');

  if (!fs.existsSync(xlsxPath)) {
    console.error(`❌ Excel not found: ${xlsxPath}`);
    process.exit(1);
  }

  const data = convertTimetable(xlsxPath);
  writeOutput(data, outPath);

  const totalTeams = data.days.reduce((n, d) => n + d.teamCount, 0);
  console.log(`✅ Converted: ${data.days.length} days, ${totalTeams} teams`);
}
```

- [ ] **Step 2: camps.ts에서 참가자 리스트를 export하도록 수정**

`src/data/camps.ts`는 내부 변수 `localizedData`가 비공개(module-local)임을 확인하고, 2026 참가자만 외부에서 읽을 수 있게 셀렉터 함수를 추가:

먼저 `src/data/camps.ts` 맨 아래에 다음 export 추가 (기존 내용은 유지):

```ts
// Exposed for build scripts: 2026 한국어 참가자 이름 ↔ musicianId 매핑
export function getCamp2026ParticipantsKo(): Array<{ name: string; musicianId?: number }> {
  const entries = localizedData.ko['camp-2026'].participants ?? [];
  return entries.map((p) => {
    if (typeof p === 'string') return { name: p };
    return { name: p.name, musicianId: p.musicianId };
  });
}
```

- [ ] **Step 3: buildNameToIdMap 구현**

`scripts/convert-timetable.ts`의 기존 `buildNameToIdMap`를 교체:

```ts
import { getCamp2026ParticipantsKo } from '../src/data/camps';

function buildNameToIdMap(): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of getCamp2026ParticipantsKo()) {
    if (p.musicianId !== undefined) {
      map.set(normalizeName(p.name), p.musicianId);
    }
  }
  // override 적용: 엑셀 이름 → camps.ts 이름 → id
  for (const [xlsxName, campsName] of Object.entries(NAME_OVERRIDES)) {
    const id = map.get(normalizeName(campsName));
    if (id !== undefined) {
      map.set(normalizeName(xlsxName), id);
    }
  }
  return map;
}
```

- [ ] **Step 4: import/type 정리**

`scripts/convert-timetable.ts` 상단 import 정리:

```ts
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import {
  Timetable,
  TimetableAct,
  TimetableDay,
  Scale,
  Weekday,
} from '../src/components/camp/timetable/types';
import { getCamp2026ParticipantsKo } from '../src/data/camps';

type RawRow = (string | number | null | undefined)[];
```

Task 3에서 작성한 순수 함수들은 그대로 유지하고, `RawRow` 타입도 export되어 있지 않다면 export로 변경.

- [ ] **Step 5: 스크립트 실행**

```bash
npm run build:timetable
```

Expected 출력:
```
✅ Converted: 3 days, 54 teams
```

생성된 파일 확인:
```bash
ls -la src/data/timetable-2026.ts
```

- [ ] **Step 6: 생성된 JSON을 시각적 검증**

```bash
node -e "const t = require('./src/data/timetable-2026'); console.log(JSON.stringify(t.timetable2026.days[0].acts.slice(0, 3), null, 2))"
```

Expected: 첫날의 처음 3개 액트가 구조대로 출력되고, 첫 공연(`블로꾸자파리/뽈레뽈레/북짝북짝`)의 `musicianIds`가 `[13]`인지 확인.

- [ ] **Step 7: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 8: 커밋**

```bash
git add scripts/convert-timetable.ts src/data/camps.ts src/data/timetable-2026.ts
git commit -m "feat(timetable): generate timetable-2026.ts from xlsx"
```

---

## Task 5: ScaleBadge 컴포넌트 (TDD)

**Files:**
- Create: `src/components/camp/timetable/ScaleBadge.tsx`
- Create: `src/components/camp/timetable/__tests__/ScaleBadge.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
import { render, screen } from '@testing-library/react';
import ScaleBadge from '../ScaleBadge';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'timetable.scale.solo': 'SOLO',
        'timetable.scale.band': 'BAND',
        'timetable.scale.big_band': 'BIG BAND',
        'timetable.scale.ensemble': 'ENSEMBLE',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('ScaleBadge', () => {
  test('renders SOLO badge with correct label', () => {
    render(<ScaleBadge scale="solo" />);
    expect(screen.getByText('SOLO')).toBeInTheDocument();
  });

  test('renders BAND badge', () => {
    render(<ScaleBadge scale="band" />);
    expect(screen.getByText('BAND')).toBeInTheDocument();
  });

  test('renders BIG BAND badge', () => {
    render(<ScaleBadge scale="big-band" />);
    expect(screen.getByText('BIG BAND')).toBeInTheDocument();
  });

  test('renders ENSEMBLE badge', () => {
    render(<ScaleBadge scale="ensemble" />);
    expect(screen.getByText('ENSEMBLE')).toBeInTheDocument();
  });

  test('applies distinct classes per scale', () => {
    const { rerender, container } = render(<ScaleBadge scale="solo" />);
    const soloClass = container.firstChild!.className;

    rerender(<ScaleBadge scale="big-band" />);
    const bigClass = container.firstChild!.className;

    expect(soloClass).not.toBe(bigClass);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx jest src/components/camp/timetable/__tests__/ScaleBadge.test.tsx
```

Expected: `Cannot find module '../ScaleBadge'` 류의 실패.

- [ ] **Step 3: 최소 구현 작성**

`src/components/camp/timetable/ScaleBadge.tsx`:

```tsx
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Scale } from './types';

interface ScaleBadgeProps {
  scale: Scale;
  className?: string;
}

const STYLE_MAP: Record<Scale, string> = {
  'solo': 'bg-seafoam text-jeju-ocean',
  'band': 'bg-ocean-mist text-white',
  'big-band': 'bg-jeju-ocean text-white',
  'ensemble': 'bg-sunset-gradient text-white',
};

const I18N_KEY: Record<Scale, string> = {
  'solo': 'timetable.scale.solo',
  'band': 'timetable.scale.band',
  'big-band': 'timetable.scale.big_band',
  'ensemble': 'timetable.scale.ensemble',
};

const ScaleBadge: React.FC<ScaleBadgeProps> = ({ scale, className = '' }) => {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold tracking-wide ${STYLE_MAP[scale]} ${className}`}
    >
      {t(I18N_KEY[scale])}
    </span>
  );
};

export default ScaleBadge;
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx jest src/components/camp/timetable/__tests__/ScaleBadge.test.tsx
```

Expected: 모든 테스트 PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/components/camp/timetable/ScaleBadge.tsx src/components/camp/timetable/__tests__/ScaleBadge.test.tsx
git commit -m "feat(timetable): add ScaleBadge component"
```

---

## Task 6: TimetableTransition 컴포넌트

**Files:**
- Create: `src/components/camp/timetable/TimetableTransition.tsx`

이 컴포넌트는 전환 구간의 얇은 구분자로, 로직이 거의 없어 테스트를 별도로 두지 않는다(렌더링만).

- [ ] **Step 1: 컴포넌트 작성**

```tsx
import React from 'react';
import { useTranslation } from 'next-i18next';

interface TimetableTransitionProps {
  minutes: number;
}

const TimetableTransition: React.FC<TimetableTransitionProps> = ({ minutes }) => {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center gap-2 py-2 pl-4 text-xs text-coastal-gray/70"
      role="presentation"
      aria-hidden="true"
    >
      <span className="flex-1 border-t border-dashed border-coastal-gray/30" />
      <span className="whitespace-nowrap">{t('timetable.transition', { minutes })}</span>
      <span className="flex-1 border-t border-dashed border-coastal-gray/30" />
    </div>
  );
};

export default TimetableTransition;
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/components/camp/timetable/TimetableTransition.tsx
git commit -m "feat(timetable): add TimetableTransition divider"
```

---

## Task 7: TimetableActCard 컴포넌트 (TDD)

**Files:**
- Create: `src/components/camp/timetable/TimetableActCard.tsx`
- Create: `src/components/camp/timetable/__tests__/TimetableActCard.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
import { render, screen } from '@testing-library/react';
import TimetableActCard from '../TimetableActCard';
import { Musician } from '@/types/musician';
import { TimetableAct } from '../types';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('next/image', () => {
  const Image = ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />;
  return { __esModule: true, default: Image };
});

const musicianById = new Map<number, Musician>([
  [40, {
    id: 40,
    name: '윤선애',
    shortDescription: '',
    description: '',
    genre: [],
    trackTitle: '',
    imageUrl: '/images-webp/musicians/40.webp',
    instagramUrls: [],
  }],
  [48, {
    id: 48,
    name: '최상돈 × 김강곤',
    shortDescription: '',
    description: '',
    genre: [],
    trackTitle: '',
    imageUrl: '/images-webp/musicians/48.webp',
    instagramUrls: [],
  }],
]);

describe('TimetableActCard', () => {
  test('renders name, time range, and scale badge for linked musician', () => {
    const act: TimetableAct = {
      order: 3,
      start: '18:00',
      end: '18:25',
      type: 'performance',
      name: '윤선애',
      scale: 'solo',
      musicianIds: [40],
    };
    render(<TimetableActCard act={act} musicianById={musicianById} campYear={2026} />);
    expect(screen.getByText('윤선애')).toBeInTheDocument();
    expect(screen.getByText('18:00 – 18:25')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/camps/2026/musicians/40');
  });

  test('renders non-clickable card when musicianIds missing', () => {
    const act: TimetableAct = {
      order: 5,
      start: '13:00',
      end: '13:25',
      type: 'performance',
      name: '불가사리 즉흥세션',
      scale: 'solo',
    };
    render(<TimetableActCard act={act} musicianById={musicianById} campYear={2026} />);
    expect(screen.getByText('불가사리 즉흥세션')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  test('initial fallback shows first 2 chars when no image', () => {
    const act: TimetableAct = {
      order: 5,
      start: '13:00',
      end: '13:25',
      type: 'performance',
      name: '불가사리 즉흥세션',
      scale: 'solo',
    };
    render(<TimetableActCard act={act} musicianById={musicianById} campYear={2026} />);
    expect(screen.getByText('불가')).toBeInTheDocument();
  });

  test('wraps time in semantic <time> tag', () => {
    const act: TimetableAct = {
      order: 3,
      start: '18:00',
      end: '18:25',
      type: 'performance',
      name: '윤선애',
      scale: 'solo',
      musicianIds: [40],
    };
    const { container } = render(<TimetableActCard act={act} musicianById={musicianById} campYear={2026} />);
    const time = container.querySelector('time');
    expect(time).toHaveAttribute('dateTime', '18:00');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx jest src/components/camp/timetable/__tests__/TimetableActCard.test.tsx
```

Expected: `Cannot find module '../TimetableActCard'` 실패.

- [ ] **Step 3: 구현 작성**

`src/components/camp/timetable/TimetableActCard.tsx`:

```tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Musician } from '@/types/musician';
import { TimetableAct } from './types';
import ScaleBadge from './ScaleBadge';

interface TimetableActCardProps {
  act: TimetableAct;
  musicianById: Map<number, Musician>;
  campYear: number;
  index?: number;
}

function getInitials(name: string): string {
  return name.slice(0, 2);
}

function resolveMusicians(ids: number[] | undefined, lookup: Map<number, Musician>): Musician[] {
  if (!ids) return [];
  return ids.map((id) => lookup.get(id)).filter((m): m is Musician => m !== undefined);
}

const TimetableActCard: React.FC<TimetableActCardProps> = ({ act, musicianById, campYear, index = 0 }) => {
  const musicians = resolveMusicians(act.musicianIds, musicianById);
  const primary = musicians[0];
  const isLinkable = musicians.length === 1 && primary !== undefined;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative flex-shrink-0">
        {musicians.length > 0 ? (
          <div className="flex">
            {musicians.map((m, i) => (
              <div
                key={m.id}
                className={`h-16 w-16 overflow-hidden rounded-full border-2 border-white sm:h-20 sm:w-20 ${i > 0 ? '-ml-4' : ''}`}
                style={{ zIndex: musicians.length - i }}
              >
                <Image
                  src={m.imageUrl}
                  alt={m.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-jeju-ocean text-lg font-bold text-white sm:h-20 sm:w-20"
            aria-hidden="true"
          >
            {getInitials(act.name)}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-lg font-bold text-deep-ocean">{act.name}</p>
        <p className="text-sm text-coastal-gray">
          <time dateTime={act.start}>{act.start}</time>
          {' – '}
          <time dateTime={act.end}>{act.end}</time>
        </p>
        {act.scale && (
          <div>
            <ScaleBadge scale={act.scale} />
          </div>
        )}
      </div>
    </motion.div>
  );

  if (isLinkable) {
    return (
      <Link
        href={`/camps/${campYear}/musicians/${primary.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
        aria-label={`${act.start} ${act.name}`}
      >
        {content}
      </Link>
    );
  }

  return <div aria-label={`${act.start} ${act.name}`}>{content}</div>;
};

export default TimetableActCard;
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx jest src/components/camp/timetable/__tests__/TimetableActCard.test.tsx
```

Expected: 모든 테스트 PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/components/camp/timetable/TimetableActCard.tsx src/components/camp/timetable/__tests__/TimetableActCard.test.tsx
git commit -m "feat(timetable): add TimetableActCard component"
```

---

## Task 8: TimetableDayView 컴포넌트

**Files:**
- Create: `src/components/camp/timetable/TimetableDayView.tsx`

- [ ] **Step 1: 컴포넌트 작성**

```tsx
import React from 'react';
import { Musician } from '@/types/musician';
import { TimetableDay } from './types';
import TimetableActCard from './TimetableActCard';
import TimetableTransition from './TimetableTransition';

interface TimetableDayViewProps {
  day: TimetableDay;
  musicianById: Map<number, Musician>;
  campYear: number;
}

const TimetableDayView: React.FC<TimetableDayViewProps> = ({ day, musicianById, campYear }) => {
  let perfIndex = 0;
  return (
    <div className="relative flex flex-col gap-3 pl-0 sm:pl-16 lg:pl-20">
      <div
        className="pointer-events-none absolute left-6 top-0 hidden h-full w-1 rounded-full bg-ocean-gradient sm:block lg:left-8"
        aria-hidden="true"
      />
      {day.acts.map((act, i) => {
        if (act.type === 'transition') {
          return (
            <TimetableTransition
              key={`t-${i}`}
              minutes={act.transitionMinutes ?? 5}
            />
          );
        }
        const idx = perfIndex++;
        return (
          <TimetableActCard
            key={`p-${i}`}
            act={act}
            musicianById={musicianById}
            campYear={campYear}
            index={idx}
          />
        );
      })}
    </div>
  );
};

export default TimetableDayView;
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/components/camp/timetable/TimetableDayView.tsx
git commit -m "feat(timetable): add TimetableDayView"
```

---

## Task 9: CampTimetable (탭 + 해시 딥링크) with 통합 테스트

**Files:**
- Create: `src/components/camp/timetable/CampTimetable.tsx`
- Create: `src/components/camp/timetable/__tests__/CampTimetable.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import CampTimetable from '../CampTimetable';
import { Timetable } from '../types';
import { Musician } from '@/types/musician';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts === 'object') {
        let out = key;
        for (const [k, v] of Object.entries(opts)) out = out.replace(`{{${k}}}`, String(v));
        return out;
      }
      return key;
    },
  }),
}));

jest.mock('next/image', () => ({ __esModule: true, default: ({ alt }: { alt: string }) => <img alt={alt} /> }));

const musicians: Musician[] = [];
const data: Timetable = {
  year: 2026,
  days: [
    {
      date: '2026-06-05', weekday: 'fri', dayLabel: '6/5 (금)',
      teamCount: 1, startTime: '18:00', endTime: '18:25',
      acts: [{ order: 1, start: '18:00', end: '18:25', type: 'performance', name: '윤선애', scale: 'solo' }],
    },
    {
      date: '2026-06-06', weekday: 'sat', dayLabel: '6/6 (토)',
      teamCount: 1, startTime: '12:00', endTime: '12:25',
      acts: [{ order: 1, start: '12:00', end: '12:25', type: 'performance', name: '하주원', scale: 'solo' }],
    },
    {
      date: '2026-06-07', weekday: 'sun', dayLabel: '6/7 (일)',
      teamCount: 1, startTime: '11:00', endTime: '11:25',
      acts: [{ order: 1, start: '11:00', end: '11:25', type: 'performance', name: '선경', scale: 'solo' }],
    },
  ],
};

describe('CampTimetable', () => {
  test('renders three tabs', () => {
    render(<CampTimetable data={data} musicians={musicians} campYear={2026} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  test('shows first day content by default', () => {
    render(<CampTimetable data={data} musicians={musicians} campYear={2026} />);
    expect(screen.getByText('윤선애')).toBeInTheDocument();
    expect(screen.queryByText('하주원')).toBeNull();
  });

  test('switches content on tab click', () => {
    render(<CampTimetable data={data} musicians={musicians} campYear={2026} />);
    fireEvent.click(screen.getAllByRole('tab')[1]);
    expect(screen.getByText('하주원')).toBeInTheDocument();
  });

  test('initial tab respects URL hash', () => {
    window.history.replaceState({}, '', '#timetable-day-2026-06-07');
    render(<CampTimetable data={data} musicians={musicians} campYear={2026} />);
    expect(screen.getByText('선경')).toBeInTheDocument();
    window.history.replaceState({}, '', window.location.pathname);
  });

  test('tab has aria-selected on active', () => {
    render(<CampTimetable data={data} musicians={musicians} campYear={2026} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx jest src/components/camp/timetable/__tests__/CampTimetable.test.tsx
```

Expected: `Cannot find module '../CampTimetable'` 실패.

- [ ] **Step 3: 구현 작성**

`src/components/camp/timetable/CampTimetable.tsx`:

```tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { Musician } from '@/types/musician';
import { Timetable } from './types';
import TimetableDayView from './TimetableDayView';

interface CampTimetableProps {
  data: Timetable;
  musicians: Musician[];
  campYear: number;
}

function hashForDate(date: string): string {
  return `timetable-day-${date}`;
}

function readHashIndex(dates: string[]): number {
  if (typeof window === 'undefined') return 0;
  const hash = window.location.hash.replace(/^#/, '');
  const idx = dates.findIndex((d) => hashForDate(d) === hash);
  return idx >= 0 ? idx : 0;
}

const CampTimetable: React.FC<CampTimetableProps> = ({ data, musicians, campYear }) => {
  const { t } = useTranslation();
  const dates = useMemo(() => data.days.map((d) => d.date), [data.days]);
  const [activeIndex, setActiveIndex] = useState<number>(() => readHashIndex(dates));

  const musicianById = useMemo(() => {
    const m = new Map<number, Musician>();
    for (const mus of musicians) m.set(mus.id, mus);
    return m;
  }, [musicians]);

  const selectTab = useCallback((i: number) => {
    setActiveIndex(i);
    const date = dates[i];
    if (date && typeof window !== 'undefined') {
      window.history.replaceState({}, '', `#${hashForDate(date)}`);
    }
  }, [dates]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const next = (i + delta + dates.length) % dates.length;
      selectTab(next);
      const el = document.getElementById(`timetable-tab-${next}`);
      el?.focus();
    }
  }, [dates.length, selectTab]);

  useEffect(() => {
    const onHashChange = () => setActiveIndex(readHashIndex(dates));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [dates]);

  const activeDay = data.days[activeIndex];

  return (
    <div>
      <div role="tablist" aria-label={t('timetable.title')} className="mb-6 grid grid-cols-3 overflow-hidden rounded-xl border border-seafoam bg-white">
        {data.days.map((day, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={day.date}
              id={`timetable-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`timetable-panel-${i}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectTab(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative px-2 py-3 text-center text-xs sm:text-sm transition-colors ${
                isActive
                  ? 'bg-jeju-ocean text-white'
                  : 'bg-white text-coastal-gray hover:bg-ocean-sand'
              }`}
            >
              <span className="block font-bold">
                {t('timetable.tab_day_label', {
                  date: day.dayLabel.split(' ')[0],
                  weekday: t(`timetable.weekday.${day.weekday}`),
                  count: day.teamCount,
                })}
              </span>
              <span className="mt-0.5 block text-[10px] opacity-80 sm:text-xs">
                {t('timetable.tab_day_time', { start: day.startTime, end: day.endTime })}
              </span>
              {isActive && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-golden-sun" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay.date}
          id={`timetable-panel-${activeIndex}`}
          role="tabpanel"
          aria-labelledby={`timetable-tab-${activeIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <TimetableDayView day={activeDay} musicianById={musicianById} campYear={campYear} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CampTimetable;
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx jest src/components/camp/timetable/__tests__/CampTimetable.test.tsx
```

Expected: 모든 테스트 PASS.

- [ ] **Step 5: 배럴 export 추가**

`src/components/camp/timetable/index.ts`:

```ts
export { default as CampTimetable } from './CampTimetable';
export { default as TimetableActCard } from './TimetableActCard';
export { default as TimetableDayView } from './TimetableDayView';
export { default as TimetableTransition } from './TimetableTransition';
export { default as ScaleBadge } from './ScaleBadge';
export type * from './types';
```

- [ ] **Step 6: 커밋**

```bash
git add src/components/camp/timetable/CampTimetable.tsx src/components/camp/timetable/__tests__/CampTimetable.test.tsx src/components/camp/timetable/index.ts
git commit -m "feat(timetable): add CampTimetable with tab + hash deep-link"
```

---

## Task 10: i18n 키 추가 (ko/en)

**Files:**
- Modify: `public/locales/ko/translation.json`
- Modify: `public/locales/en/translation.json`

- [ ] **Step 1: 현재 키 위치 확인**

```bash
grep -n '"timeline"' public/locales/ko/translation.json | head -1
```

`timeline` 객체 직전에 `timetable` 객체를 추가한다.

- [ ] **Step 2: 한국어 키 추가**

`public/locales/ko/translation.json`의 `"timeline":` 객체 직전에 다음을 삽입 (마지막 콤마 주의):

```json
"timetable": {
  "title": "공연 일정",
  "subtitle_count": "{{count}}팀 · 3일",
  "tab_day_label": "{{date}} {{weekday}} · {{count}}팀",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}}분 전환",
  "scale": {
    "solo": "SOLO",
    "band": "BAND",
    "big_band": "BIG BAND",
    "ensemble": "ENSEMBLE"
  },
  "weekday": {
    "fri": "금",
    "sat": "토",
    "sun": "일"
  }
},
```

- [ ] **Step 3: 영어 키 추가**

`public/locales/en/translation.json`의 동일 위치에:

```json
"timetable": {
  "title": "Timetable",
  "subtitle_count": "{{count}} acts · 3 days",
  "tab_day_label": "{{date}} {{weekday}} · {{count}} acts",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}} min transition",
  "scale": {
    "solo": "SOLO",
    "band": "BAND",
    "big_band": "BIG BAND",
    "ensemble": "ENSEMBLE"
  },
  "weekday": {
    "fri": "Fri",
    "sat": "Sat",
    "sun": "Sun"
  }
},
```

- [ ] **Step 4: JSON 유효성 확인**

```bash
node -e "JSON.parse(require('fs').readFileSync('public/locales/ko/translation.json'))" && node -e "JSON.parse(require('fs').readFileSync('public/locales/en/translation.json'))"
```

Expected: 출력 없음(= 유효). 에러 나면 콤마 누락/잉여 수정.

- [ ] **Step 5: 커밋**

```bash
git add public/locales/ko/translation.json public/locales/en/translation.json
git commit -m "i18n(timetable): add timetable keys for ko/en"
```

---

## Task 11: Camp2026Page 통합

**Files:**
- Modify: `src/pages/Camp2026Page.tsx:229-256`

- [ ] **Step 1: import 추가**

`src/pages/Camp2026Page.tsx` 상단 import 블록에 추가:

```tsx
import { CampTimetable } from '@/components/camp/timetable';
import { timetable2026 } from '@/data/timetable-2026';
```

- [ ] **Step 2: Lineup 섹션 본문 교체**

기존 코드([src/pages/Camp2026Page.tsx:229-256](src/pages/Camp2026Page.tsx#L229-L256)):

```tsx
{camp2026.participants && camp2026.participants.length > 0 && (
  <Section background="white" id="lineup">
    <div className="container mx-auto px-4">
      <SectionHeader
        title={t('camp.section_musicians')}
        subtitle={t('camp.lineup_count', { count: participantCount })}
      />
      <div className="max-w-6xl mx-auto">
        {musiciansResource.isLoading ? (
          <p className="text-center text-gray-500 py-10" role="status">
            {t('common.loading')}
          </p>
        ) : musiciansResource.error ? (
          <p className="text-center text-gray-500 py-10" role="alert">
            {t('common.no_results')}
          </p>
        ) : (
          <CampLineup
            participants={camp2026.participants}
            musicians={musicians}
            campYear={2026}
          />
        )}
      </div>
    </div>
  </Section>
)}
```

을 다음으로 교체:

```tsx
{camp2026.participants && camp2026.participants.length > 0 && (
  <Section background="white" id="lineup">
    <div className="container mx-auto px-4">
      <SectionHeader
        title={t('camp.section_musicians')}
        subtitle={t('camp.lineup_count', { count: participantCount })}
      />
      <div className="max-w-5xl mx-auto">
        {musiciansResource.isLoading ? (
          <p className="text-center text-gray-500 py-10" role="status">
            {t('common.loading')}
          </p>
        ) : musiciansResource.error ? (
          <p className="text-center text-gray-500 py-10" role="alert">
            {t('common.no_results')}
          </p>
        ) : (
          <CampTimetable
            data={timetable2026}
            musicians={musicians}
            campYear={2026}
          />
        )}
      </div>
    </div>
  </Section>
)}
```

(`CampLineup` import는 파일 내 다른 곳에서 쓰이지 않으면 제거. grep으로 확인.)

- [ ] **Step 3: CampLineup import 정리**

```bash
grep -n "CampLineup" src/pages/Camp2026Page.tsx
```

이 파일에서만 쓰였으면 import 라인 삭제:

```tsx
// 삭제할 줄:
import CampLineup from '@/components/camp/CampLineup';
```

- [ ] **Step 4: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 5: 개발 서버 띄우고 수동 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000/camps/2026`로 이동:
- 탭 3개(금/토/일)가 표시되는지
- 기본 탭(금)이 열려 있고 윤선애 등 뮤지션이 보이는지
- 탭 클릭 시 내용 교체되는지
- `#timetable-day-2026-06-07` 해시로 재진입 시 일요일 탭이 열리는지
- 뮤지션 카드 클릭 시 `/camps/2026/musicians/{id}`로 이동되는지

서버 종료 후:

- [ ] **Step 6: 커밋**

```bash
git add src/pages/Camp2026Page.tsx
git commit -m "feat(camp-2026): replace Lineup with CampTimetable"
```

---

## Task 12: SEO - Event.subEvent 스키마 확장

**Files:**
- Modify: `src/utils/structuredData.ts`
- Modify: `src/pages/Camp2026Page.tsx`

- [ ] **Step 1: 현재 getEventSchema 시그니처 확인**

```bash
grep -n "getEventSchema" src/utils/structuredData.ts
```

- [ ] **Step 2: subEvents 파라미터 추가**

`src/utils/structuredData.ts`의 `getEventSchema` 함수를 수정하여 `subEvents?: SubEventInput[]`를 받도록 확장. 기존 구조를 깨지 않도록 optional로.

실제 시그니처는 파일을 열어 확인 후, 다음 타입을 추가:

```ts
interface SubEventInput {
  name: string;
  startDate: string; // ISO 8601
  endDate: string;
  performerUrl?: string;
  performerName: string;
}
```

`getEventSchema`가 반환하는 객체에 조건부로 `subEvent` 필드 추가:

```ts
if (input.subEvents && input.subEvents.length > 0) {
  schema.subEvent = input.subEvents.map((se) => ({
    '@type': 'Event',
    name: se.name,
    startDate: se.startDate,
    endDate: se.endDate,
    location: schema.location,
    performer: {
      '@type': 'MusicGroup',
      name: se.performerName,
      ...(se.performerUrl ? { url: se.performerUrl } : {}),
    },
  }));
}
```

- [ ] **Step 3: Camp2026Page에서 subEvents 생성 및 전달**

`src/pages/Camp2026Page.tsx`의 `getEventSchema` 호출부 근처에 subEvents 변환 로직 추가:

```tsx
import { timetable2026 } from '@/data/timetable-2026';
import { getFullUrl } from '@/config/env';

const subEvents = timetable2026.days.flatMap((day) =>
  day.acts
    .filter((a) => a.type === 'performance')
    .map((a) => ({
      name: a.name,
      startDate: `${day.date}T${a.start}:00+09:00`,
      endDate: `${day.date}T${a.end}:00+09:00`,
      performerName: a.name,
      performerUrl:
        a.musicianIds && a.musicianIds.length === 1
          ? getFullUrl(`/camps/2026/musicians/${a.musicianIds[0]}`)
          : undefined,
    }))
);
```

그리고 기존 `getEventSchema({...}, i18n.language, t)` 호출에서 입력 객체에 `subEvents` 필드 추가:

```tsx
const eventSchema = getEventSchema(
  {
    name: translatedTitle,
    // ... 기존 필드 ...
    subEvents,
  },
  i18n.language,
  t
);
```

- [ ] **Step 4: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 5: 렌더된 JSON-LD 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000/camps/2026` 페이지 소스 보기 → `<script type="application/ld+json">` 내부에 `"subEvent": [...]` 배열이 54개 원소로 포함되었는지 확인.

- [ ] **Step 6: 커밋**

```bash
git add src/utils/structuredData.ts src/pages/Camp2026Page.tsx
git commit -m "seo(camp-2026): add subEvent schema for each performance"
```

---

## Task 13: 나머지 11개 로케일 번역

**Files:**
- Modify: `public/locales/{es,fr,de,pt,ru,ar,ja,zh-Hans,zh-Hant,hi,id}/translation.json`

각 언어별 `timetable` 블록을 Task 10의 ko/en과 같은 위치에 추가한다. 배지 라벨(SOLO/BAND/BIG BAND/ENSEMBLE)은 국제 페스티벌 관용으로 영문 그대로 둔다. 주 텍스트(제목, 전환, 요일)만 현지화.

- [ ] **Step 1: 각 언어 파일에 timetable 블록 추가**

**es (스페인어):**
```json
"timetable": {
  "title": "Programa",
  "subtitle_count": "{{count}} actos · 3 días",
  "tab_day_label": "{{date}} {{weekday}} · {{count}} actos",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}} min de transición",
  "scale": { "solo": "SOLO", "band": "BAND", "big_band": "BIG BAND", "ensemble": "ENSEMBLE" },
  "weekday": { "fri": "Vie", "sat": "Sáb", "sun": "Dom" }
},
```

**fr (프랑스어):**
```json
"timetable": {
  "title": "Programme",
  "subtitle_count": "{{count}} groupes · 3 jours",
  "tab_day_label": "{{date}} {{weekday}} · {{count}} groupes",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}} min de transition",
  "scale": { "solo": "SOLO", "band": "BAND", "big_band": "BIG BAND", "ensemble": "ENSEMBLE" },
  "weekday": { "fri": "Ven", "sat": "Sam", "sun": "Dim" }
},
```

**de (독일어):**
```json
"timetable": {
  "title": "Zeitplan",
  "subtitle_count": "{{count}} Acts · 3 Tage",
  "tab_day_label": "{{date}} {{weekday}} · {{count}} Acts",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}} Min Umbau",
  "scale": { "solo": "SOLO", "band": "BAND", "big_band": "BIG BAND", "ensemble": "ENSEMBLE" },
  "weekday": { "fri": "Fr", "sat": "Sa", "sun": "So" }
},
```

**pt (포르투갈어):**
```json
"timetable": {
  "title": "Programação",
  "subtitle_count": "{{count}} atos · 3 dias",
  "tab_day_label": "{{date}} {{weekday}} · {{count}} atos",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}} min de transição",
  "scale": { "solo": "SOLO", "band": "BAND", "big_band": "BIG BAND", "ensemble": "ENSEMBLE" },
  "weekday": { "fri": "Sex", "sat": "Sáb", "sun": "Dom" }
},
```

**ru (러시아어):**
```json
"timetable": {
  "title": "Расписание",
  "subtitle_count": "{{count}} выступлений · 3 дня",
  "tab_day_label": "{{date}} {{weekday}} · {{count}} выступлений",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}} мин перерыв",
  "scale": { "solo": "SOLO", "band": "BAND", "big_band": "BIG BAND", "ensemble": "ENSEMBLE" },
  "weekday": { "fri": "Пт", "sat": "Сб", "sun": "Вс" }
},
```

**ar (아랍어):**
```json
"timetable": {
  "title": "الجدول الزمني",
  "subtitle_count": "{{count}} عرضًا · 3 أيام",
  "tab_day_label": "{{date}} {{weekday}} · {{count}} عرضًا",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}} دقيقة استراحة",
  "scale": { "solo": "SOLO", "band": "BAND", "big_band": "BIG BAND", "ensemble": "ENSEMBLE" },
  "weekday": { "fri": "جمعة", "sat": "سبت", "sun": "أحد" }
},
```

**ja (일본어):**
```json
"timetable": {
  "title": "タイムテーブル",
  "subtitle_count": "{{count}}組 · 3日間",
  "tab_day_label": "{{date}} {{weekday}} · {{count}}組",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}}分転換",
  "scale": { "solo": "SOLO", "band": "BAND", "big_band": "BIG BAND", "ensemble": "ENSEMBLE" },
  "weekday": { "fri": "金", "sat": "土", "sun": "日" }
},
```

**zh-Hans (중국어 간체):**
```json
"timetable": {
  "title": "演出时刻表",
  "subtitle_count": "{{count}}组 · 3天",
  "tab_day_label": "{{date}} {{weekday}} · {{count}}组",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}}分钟换场",
  "scale": { "solo": "SOLO", "band": "BAND", "big_band": "BIG BAND", "ensemble": "ENSEMBLE" },
  "weekday": { "fri": "周五", "sat": "周六", "sun": "周日" }
},
```

**zh-Hant (중국어 번체):**
```json
"timetable": {
  "title": "演出時刻表",
  "subtitle_count": "{{count}}組 · 3天",
  "tab_day_label": "{{date}} {{weekday}} · {{count}}組",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}}分鐘換場",
  "scale": { "solo": "SOLO", "band": "BAND", "big_band": "BIG BAND", "ensemble": "ENSEMBLE" },
  "weekday": { "fri": "週五", "sat": "週六", "sun": "週日" }
},
```

**hi (힌디어):**
```json
"timetable": {
  "title": "टाइमटेबल",
  "subtitle_count": "{{count}} कार्यक्रम · 3 दिन",
  "tab_day_label": "{{date}} {{weekday}} · {{count}} कार्यक्रम",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}} मिनट का अंतराल",
  "scale": { "solo": "SOLO", "band": "BAND", "big_band": "BIG BAND", "ensemble": "ENSEMBLE" },
  "weekday": { "fri": "शुक्र", "sat": "शनि", "sun": "रवि" }
},
```

**id (인도네시아어):**
```json
"timetable": {
  "title": "Jadwal",
  "subtitle_count": "{{count}} penampil · 3 hari",
  "tab_day_label": "{{date}} {{weekday}} · {{count}} penampil",
  "tab_day_time": "{{start}} – {{end}}",
  "transition": "⟶ {{minutes}} menit transisi",
  "scale": { "solo": "SOLO", "band": "BAND", "big_band": "BIG BAND", "ensemble": "ENSEMBLE" },
  "weekday": { "fri": "Jum", "sat": "Sab", "sun": "Min" }
},
```

- [ ] **Step 2: 모든 JSON 유효성 확인**

```bash
for f in public/locales/*/translation.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f'))" && echo "$f OK" || echo "$f INVALID"
done
```

Expected: 13개 파일 모두 `OK`.

- [ ] **Step 3: 커밋**

```bash
git add public/locales/es/translation.json public/locales/fr/translation.json public/locales/de/translation.json public/locales/pt/translation.json public/locales/ru/translation.json public/locales/ar/translation.json public/locales/ja/translation.json public/locales/zh-Hans/translation.json public/locales/zh-Hant/translation.json public/locales/hi/translation.json public/locales/id/translation.json
git commit -m "i18n(timetable): add translations for 11 remaining locales"
```

---

## Task 14: 빌드 검증 및 수동 QA

이 마지막 Task는 코드 변경 없이 전체 동작을 검증한다.

- [ ] **Step 1: 전체 테스트 실행**

```bash
npx jest
```

Expected: 모든 기존 + 신규 테스트 PASS.

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 3: 린트**

```bash
npm run lint
```

Expected: 에러 없음 (경고는 기존에 있던 것만).

- [ ] **Step 4: 프로덕션 빌드**

```bash
npm run build
```

Expected: 빌드 성공, `/camps/2026` 경로가 13개 로케일별로 생성됨.

- [ ] **Step 5: 수동 QA 체크리스트**

`npm run dev`로 개발 서버 띄우고 `http://localhost:3000/camps/2026`에서 확인:

| 항목 | 예상 결과 |
|------|----------|
| 3개 탭 렌더 | 금/토/일 각 `X팀` 표기 |
| 기본 활성 탭 | 첫날(6/5 금) |
| 탭 클릭 전환 | 내용 교체, `aria-selected` 갱신 |
| 키보드 네비 | 좌/우 화살표로 탭 이동, Home/End 지원은 없어도 무방 |
| 해시 딥링크 | `#timetable-day-2026-06-06` 진입 시 토요일 탭 활성 |
| 뮤지션 카드 클릭 | `/camps/2026/musicians/{id}`로 이동 |
| 복합/미매칭 이름 | 링크 없음, 이니셜 fallback 표시 |
| 모바일 뷰 (375px) | 축 제거, 카드 풀너비 |
| 태블릿 (768px) | 축 표시, 카드 축소 |
| 데스크톱 (1280px) | 축 + 프로필 80px |
| 로케일 전환 (`ko`→`en`) | 뮤지션명도 영문 로드, 탭 라벨 현지화 |
| 로케일 전환 (`ja`) | 요일이 `金/土/日` |
| JSON-LD | `<script type="application/ld+json">`에 `subEvent` 54개 포함 |

- [ ] **Step 6: 수동 QA 통과 시 병합 준비**

모든 항목 체크 후, PR 작성 또는 main에 직접 병합 (프로젝트 관례에 따름).

```bash
git log --oneline main..HEAD
```

Expected: 이 계획의 Task 1~13이 커밋으로 누적되어 보임.

---

## 검증 요약

**구현 완료 후 보장되는 것:**

1. 3일간 54팀의 공연 일정이 시간순으로 탭 기반 타임라인에 표시됨
2. 각 공연 카드가 뮤지션 상세페이지로 링크됨 (1인 매칭 시)
3. 복합 이름/미매칭 뮤지션도 이니셜 fallback으로 안전하게 렌더링됨
4. 13개 로케일 모두에서 탭 라벨과 요일이 현지화됨
5. `Event.subEvent` 구조화 데이터가 구글에 정확한 공연별 시각을 노출함
6. 엑셀 업데이트 시 `npm run build:timetable` 한 번으로 재생성
7. 탭 접근성(ARIA tablist, 키보드, `<time>` 시맨틱)
8. 모바일/태블릿/데스크톱 반응형 동작
9. 빌드 타임 생성되어 런타임 fetch 없음
10. 기존 라인업 섹션 앵커(`#lineup`)와 Hero의 라인업 카운트 버튼도 그대로 동작
