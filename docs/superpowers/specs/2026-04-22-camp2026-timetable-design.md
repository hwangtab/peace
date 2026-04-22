# 2026 강정피스앤뮤직캠프 타임테이블 디자인 스펙

- 작성일: 2026-04-22
- 대상: `src/pages/Camp2026Page.tsx`
- 데이터 원본: `docs/2026캠프 운영/timetable_v5.xlsx`

## 1. 목표

제3회 강정피스앤뮤직캠프(2026-06-05 ~ 06-07)의 공연 일정을 캠프 페이지에 시각적으로 통합한다. 기존 뮤지션 그리드(`CampLineup`)를 시간순 타임테이블로 대체해 관객이 "언제 누가 무대에 오르는지"를 직관적으로 파악할 수 있게 한다.

## 2. 범위와 정보 공개 정책

### 공개하는 정보
- 날짜 / 요일
- 공연 시작·종료 시각
- 뮤지션명
- 규모 구분 (솔로/듀오 · 밴드 소형/중형/대형 · 앙상블)
- 전환 구간(다음 팀 셋업 시간) — 시각적 최소화

### 공개하지 않는 정보 (운영 전용)
- 테크니컬 라이더
- 숙박 인원 / 숙박 일수
- 내부 비고(이동 방향, 스왑 내역, 연락처, 가족 동반 여부 등)

## 3. 페이지 배치

현재 플로우:
```
Hero → Overview → GangjeongStorySection → Lineup(54개 뮤지션 카드) → Final CTA
```

변경 후:
```
Hero → Overview → GangjeongStorySection → Timetable(탭 기반 3일 타임라인) → Final CTA
```

`Camp2026Page.tsx`의 기존 Lineup 섹션(`#lineup`)을 그대로 유지하되, 섹션 본문만 `<CampTimetable />`로 교체한다. 섹션 헤더(`camp.section_musicians`)와 카운트 부제(`camp.lineup_count`)는 유지한다. Hero의 `#lineup` 앵커 버튼도 그대로 동작한다.

## 4. 아키텍처

### 4.1 파일 구조

```
src/components/camp/timetable/
├── CampTimetable.tsx          # 탭 + 선택된 day 렌더
├── TimetableDayView.tsx       # 단일 day 타임라인 컨테이너
├── TimetableActCard.tsx       # 공연 카드 1개
├── TimetableTransition.tsx    # 전환 구간 표시
├── ScaleBadge.tsx             # 규모 배지
└── types.ts                   # 타입 정의

scripts/
└── convert-timetable.ts       # 엑셀 → JSON 변환 CLI

src/data/
└── timetable-2026.ts          # 변환 결과 (정적)
```

### 4.2 데이터 파이프라인

엑셀을 단일 진실 소스로 유지하고 빌드 타임에 JSON으로 변환한다.

```
docs/2026캠프 운영/timetable_v5.xlsx
        │
        ▼  scripts/convert-timetable.ts
        │   (npm run build:timetable)
        ▼
src/data/timetable-2026.ts  ← 정적 번들, 런타임 fetch 없음
        │
        ▼
CampTimetable (React)
```

변환 스크립트는 다음을 수행:
1. 3개 시트(`6월5일(금)`, `6월6일(토)`, `6월7일(일)`) 파싱
2. 각 행을 `TimetableAct`로 정규화
3. 뮤지션명 → `musicians.json`의 `name`/`alias`와 퍼지 매칭
4. 복합 이름(`A × B`, `A X B`, `A with B`)은 구분자로 분리 후 각자 매칭
5. 매칭 실패 항목은 콘솔 경고(`⚠ 매칭 실패: "..."`), 수동 보정 가능
6. 변환 실패 시 `exit 1` (CI에서 조용한 실패 방지)

### 4.3 JSON 스키마

```ts
type ActType = 'performance' | 'transition';
type Scale = 'solo' | 'band' | 'big-band' | 'ensemble';

interface TimetableAct {
  order: number | null;             // 공연은 1,2,3... transition은 null
  start: string;                    // '17:00' (HH:mm)
  end: string;                      // '17:25'
  type: ActType;
  name: string;                     // 공연: 뮤지션명, transition: 안내문
  scale?: Scale;                    // performance만
  musicianIds?: string[];           // 1명 또는 복합(2명 이상)
  transitionMinutes?: number;       // transition만
  nextActName?: string;             // transition만
}

interface TimetableDay {
  date: string;                     // '2026-06-05'
  dayLabel: string;                 // '6/5 (금)'
  weekday: 'fri' | 'sat' | 'sun';
  teamCount: number;                // 12
  startTime: string;                // '17:00'
  endTime: string;                  // '22:57'
  acts: TimetableAct[];
}

interface Timetable {
  year: 2026;
  days: TimetableDay[];
}
```

## 5. 비주얼 디자인

### 5.1 디자인 팔레트

기존 `tailwind.config.js`의 Ocean Blues 팔레트를 그대로 사용한다:
- `jeju-ocean (#0A5F8A)` — 탭 활성, 큰 밴드 배지, 주요 타이포
- `ocean-mist (#4A90B8)` — 중형 밴드 배지
- `seafoam (#B8D8E8)` / `sky-horizon (#D4E9F7)` — 솔로/듀오 배지
- `golden-sun (#FDB44B)` — 활성 탭 언더라인 악센트
- `sunset-coral`, `sunset-gradient` — 앙상블 배지
- `coastal-gray` — 시간 마커, 전환 텍스트
- `ocean-sand` — 탭 비활성 호버

### 5.2 탭 UI

```
┌──────────────────┬──────────────────┬──────────────────┐
│  6/5 금  · 12팀  │  6/6 토  · 21팀  │  6/7 일  · 21팀  │
│  17:00 – 22:57   │  12:00 – 22:37   │  11:00 – 21:30   │
└──────────────────┴──────────────────┴──────────────────┘
     ▔▔▔▔▔▔▔▔▔▔▔▔ (활성 탭: golden-sun 언더라인 2px)
```

- 활성: `bg-jeju-ocean` + 흰 텍스트 + 하단 `bg-golden-sun` 2px 언더라인
- 비활성: `bg-white` + `text-coastal-gray`, 호버 `bg-ocean-sand`
- 가로 3칸 균등 분할. 모바일에서도 유지(폰트만 축소)
- 전환 애니메이션: `AnimatePresence`로 패널 교체 (페이드 200ms)
- ARIA: `role="tablist"` / `role="tab"` / `role="tabpanel"`, `aria-selected`, `aria-controls`
- 키보드: 좌/우 화살표로 탭 이동, Enter/Space로 활성화

### 5.3 세로 타임라인 축 (데스크톱 `≥1024px`)

```
시간     축            카드
17:00 ○──│────── [이미지] 블로꾸자파리/뽈레뽈레/북짝북짝
         │                17:00 – 17:25 · ENSEMBLE
         │  ⟶ 5분 전환
17:30 ○──│────── [이미지] 최상돈 × 김강곤
         │                17:30 – 17:55 · SOLO
...
```

- 왼쪽에 고정 너비(64px) 세로 축, `bg-ocean-gradient` 위→아래 그라데이션
- 1시간 단위 시간 마커(`○` 점 + `HH:00` 텍스트)가 축 옆에 고정
- 태블릿(`640px–1024px`): 축 48px로 축소, 이미지 작게
- 모바일(`<640px`): 축 제거, 시간 마커가 카드 내부로 흡수(카드 상단에 시간 표시)

### 5.4 공연 카드 (`TimetableActCard`)

```
┌─────────────────────────────────────────────┐
│  ●●     윤선애                               │
│  (64px)  17:00 – 17:25                      │
│          [ SOLO ]                           │
└─────────────────────────────────────────────┘
```

- 배경: `bg-white`, `rounded-xl`, `shadow-sm`
- 호버: `shadow-lg`, `-translate-y-0.5` (1px 상승)
- 왼쪽 이미지: 원형(데스크톱 80×80, 모바일 64×64)
  - 매칭된 뮤지션: `musicians.json`의 프로필 이미지
  - 매칭 실패: 이니셜 fallback (`bg-jeju-ocean` + 흰 텍스트 2글자)
  - 복합 이름(2명): 두 프로필 약간 겹쳐 표시(`-ml-3`)
- 오른쪽 정보: 이름(`font-bold text-lg`) · 시간(`<time>` + 마이크로카피) · 규모 배지
- 클릭 영역: 전체 카드가 `<a>` (매칭된 뮤지션 1명일 때만), `/camps/2026/musicians/{id}`로 이동
- 복합 이름/미매칭: 클릭 비활성(`cursor: default`), 링크 없음

### 5.5 규모 배지 (`ScaleBadge`)

| 원본 구분 | 내부 키 | 기본 라벨 | 색상 |
|-----------|---------|-----------|------|
| 솔로/듀오 · 밴드(1인) · 밴드(2인) | `solo` | `SOLO` | `bg-seafoam text-jeju-ocean` |
| 밴드(3–4인) | `band` | `BAND` | `bg-ocean-mist text-white` |
| 밴드(5인+) | `big-band` | `BIG BAND` | `bg-jeju-ocean text-white` |
| 밴드(다수) | `ensemble` | `ENSEMBLE` | `bg-sunset-gradient text-white` |

- 기본 라벨은 영문. i18n 키 `timetable.scale.{solo,band,big_band,ensemble}`로 각 언어 오버라이드 가능
- 모양: `rounded-full`, 좌우 패딩 `px-3`, 폰트 `text-xs font-bold tracking-wide`

### 5.6 전환 구간 (`TimetableTransition`)

카드 사이에 얇은 구분자:
```
   · · · · · · ⟶ 5분 · · · · · ·
```
- `text-coastal-gray/60`, `text-xs`
- 점선(`border-dashed`) + 중앙에 `⟶ {minutes}분` 텍스트
- 시각적 무게 최소 (54팀 기준 반복 빈도 높음)
- i18n: `timetable.transition` (`"⟶ {{minutes}}분 전환"`)

### 5.7 애니메이션

- 카드: 기존 패턴 준수 — `whileInView` 페이드+슬라이드업, 50ms stagger
  - `animate` 패턴 금지 (최근 커밋 `3a2226e`에서 모바일 깜빡임 방지용으로 제거)
- 탭 전환: `AnimatePresence` mode="wait"로 패널 교체, 200ms 페이드
- 축 그라데이션: 정적 (움직이지 않음)

## 6. 인터랙션

### 6.1 탭 초기값 및 딥링크

- 기본: 첫날(금) 활성화
- URL 해시: `#timetable-day-2026-06-05`, `#timetable-day-2026-06-06`, `#timetable-day-2026-06-07`
- 해시 있으면 해당 탭 선택. 없으면 첫날.
- 탭 전환 시 `history.replaceState`로 해시 갱신(뒤로가기 이력은 남기지 않음)

### 6.2 뮤지션 매칭 실패 대응

변환 스크립트 단계:
1. 정확 일치 (name 또는 alias)
2. 구분자(`×`, `X`, `x`, `with`, `&`) 기준 분리 후 각자 재매칭
3. 공백/특수문자 제거 후 정규화 비교
4. 위 모두 실패 시 경고 출력 + `musicianIds: undefined`로 JSON 기록

렌더 단계:
- `musicianIds.length === 1`: 프로필 이미지 + 상세페이지 링크
- `musicianIds.length >= 2`: 프로필 이미지 2개 겹쳐 표시, 링크 없음
- `musicianIds` 없음: 이니셜 원형 fallback + 링크 없음

### 6.3 로케일 전환

- 언어 전환 시 `musicians.json`이 해당 언어로 재로드됨(기존 `useLocalizedResource` 훅 활용)
- 뮤지션명도 자동으로 해당 언어 이름 반영
- 요일 라벨은 i18n 키(`timetable.weekday.fri` 등)로 각 언어 포맷 지원
  - 예: 영어 `Fri, Jun 5`, 일본어 `6月5日(金)`
- 시간 표기(`17:00 – 17:25`)는 로케일 무관 공통(ISO-ish)

## 7. 데이터 / 뮤지션 매칭 엣지 케이스

| 원본 표기 | 처리 |
|-----------|------|
| `윤선애` | 정확 일치 → 링크 활성 |
| `최상돈 × 김강곤` | 분리 → 둘 다 매칭 → 프로필 2개 겹쳐 표시, 링크 없음 |
| `사이트 with 제트싸이져` | 분리 → 매칭 시도 |
| `블로꾸자파리/뽈레뽈레/북짝북짝` | 슬래시도 분리자, 3명 매칭 시도 |
| `Dear arcadian` | 정확 일치 (영문도 `musicians.json`에 존재) |
| `불가사리 즉흥세션` | 매칭 실패 → 이니셜 fallback |

## 8. SEO / 구조화 데이터

기존 `getEventSchema` (`src/pages/Camp2026Page.tsx:60`)를 확장:

```ts
{
  "@type": "Event",
  "name": "제3회 강정피스앤뮤직캠프",
  "startDate": "2026-06-05T17:00:00+09:00",
  "endDate": "2026-06-07T21:30:00+09:00",
  "subEvent": [
    {
      "@type": "Event",
      "name": "윤선애",
      "startDate": "2026-06-05T18:00:00+09:00",
      "endDate": "2026-06-05T18:25:00+09:00",
      "performer": { "@type": "MusicGroup", "name": "윤선애", "url": "..." },
      "location": { ... }
    },
    ...
  ]
}
```

- 공연(`performance`)만 subEvent로 포함, 전환(`transition`)은 제외
- Google Rich Results Test로 검증

## 9. 접근성

- 탭: WAI-ARIA Authoring Practices의 Tabs 패턴 준수
  - 좌/우 화살표, Home/End 키 지원
  - 각 탭은 `tabindex=0` (활성), `tabindex=-1` (비활성)
- 카드: `<a>` 의미론적 링크, 전체 영역 클릭 가능
- 시간: `<time dateTime="2026-06-05T18:00">18:00</time>`
- 프로필 이미지: `alt` 에 뮤지션명
- 색 대비: 모든 텍스트/배경 조합 WCAG AA(4.5:1) 이상
- 프리퍼스 리듀스드 모션: 애니메이션 비활성화 (`prefers-reduced-motion`)

## 10. 성능

- 데이터: 정적 `.ts` 번들, 런타임 fetch 없음
- JSON 예상 크기: 약 10–15KB gzip
- 이미지: Next.js `<Image>` + `loading="lazy"` + `sizes` 속성
- 첫 탭만 실제로 DOM에 렌더, 나머지 탭은 선택 시 렌더(lazy). 이미 마운트된 탭은 캐시
- 번들 영향: framer-motion은 기존 사용 중, 추가 의존성 0

## 11. 에러 / 빈 상태

- 데이터 누락은 빌드 타임에 보장 → 런타임 에러 바운더리 불필요
- 변환 스크립트 실패 → `exit 1` → 빌드 실패 → 조용한 실패 방지
- 매칭 실패는 에러가 아니라 정상 경로 (fallback 렌더)

## 12. i18n 키 추가

`public/locales/{lang}/translation.json`에 추가:

```json
{
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
  }
}
```

- 기본값은 한국어. 나머지 12개 로케일은 각 언어로 번역
- 영문 배지는 여러 언어에서 그대로 써도 자연스러움 (페스티벌 국제 관용)

## 13. 테스트

- `scripts/convert-timetable.test.ts` — 샘플 엑셀 → 예상 JSON, 복합 이름 분리, 매칭 실패 경로
- `CampTimetable.test.tsx` — 탭 전환, 기본 탭, 해시 기반 초기값, 키보드 네비
- `TimetableActCard.test.tsx` — 링크 활성/비활성, 복합 이름, 이니셜 fallback
- `ScaleBadge.test.tsx` — 4가지 규모 렌더

프로젝트에 시각 회귀 테스트(Storybook/Chromatic) 없음. 수동 QA 체크리스트로 보완:
- [ ] 3개 탭 전환 동작
- [ ] 모바일 뷰포트(375px)에서 축 제거/카드 풀너비
- [ ] 뮤지션 카드 → 상세페이지 링크
- [ ] 복합 이름 카드 링크 비활성
- [ ] 13개 로케일 전환 시 뮤지션명 변경

## 14. 구현 전 결정 완료 사항

| 결정 | 선택 |
|------|------|
| 정보 범위 | 공연 중심 (운영정보 제외) |
| 레이아웃 | 탭(3일) + 세로 타임라인 |
| 페이지 배치 | 기존 Lineup 섹션 대체 |
| 데이터 소스 | 엑셀 → 변환 스크립트 → 정적 JSON |
| 매칭 실패 대응 | 이니셜 fallback + 링크 없음 |
| 규모 배지 라벨 | 영문 기본 + i18n 오버라이드 |
| 전환 구간 | 시각적 최소화 |
| 날짜 탭 초기값 | 첫날(금), 해시 딥링크 지원 |

## 15. 구현 순서 (writing-plans에서 상세화 예정)

1. 엑셀 변환 스크립트 + 타입 정의
2. i18n 키 추가 (한국어 우선, 나머지 언어는 임시 영문)
3. `TimetableActCard`, `ScaleBadge`, `TimetableTransition` 컴포넌트
4. `TimetableDayView` (단일 날짜 타임라인)
5. `CampTimetable` (탭 + 해시 딥링크)
6. `Camp2026Page.tsx` 통합 (기존 Lineup 대체)
7. `getEventSchema` subEvent 확장
8. 나머지 12개 로케일 번역
9. 모바일/접근성/시각 QA
