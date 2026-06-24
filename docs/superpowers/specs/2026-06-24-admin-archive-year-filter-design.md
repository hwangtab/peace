# 관리자 아카이브 연도·유형 2축 필터 설계

작성일: 2026-06-24
상태: 승인됨 (구현 계획 대기)

## 배경 / 목적

관리자(기획단) 페이지의 아카이브 관리 목록이 연도·이벤트 구분 없이 한 목록에 모두 뭉쳐 있다. 캠프가 회차별로 누적되고(23·25·26년 캠프, 24년 앨범) 비디오는 384건·갤러리 16K건·언론보도 520건으로 커져, 기획단이 특정 회차의 콘텐츠를 찾고 관리하기 어렵다.

**유형(캠프·앨범·라이브·뮤비·인터뷰) + 연도** 2축으로 필터링해 원하는 회차/유형만 골라 관리할 수 있게 한다.

### 범위

- **관리자(기획단) 페이지만.** 공개 사이트는 변경하지 않는다.
- **비디오·갤러리·언론보도** 3개 컬렉션. 회의록·백서는 제외(데이터가 사실상 2026 하나뿐이고, 백서는 단일→다중 문서 구조 변경이 필요해 별도 작업).

### 데이터 현황 (실측, 2026-06-24)

- `archive_videos` (384): camp 2023(157)·album 2024(78)·camp 2025(26)·camp 2026(2) **+ live/music_video/interview가 2004~2026 수십 조합**(뮤지션 영상 long-tail)
- `archive_gallery_images` (16K): camp 2023·camp 2025·album 2024 (이벤트 기반, 깔끔)
- `archive_press_items` (520): album 2024(364)·camp 2026(117)·camp 2025(39)

→ 비디오는 유형 축이 두텁고, 갤러리·보도는 유형 2~3종뿐. 2축 독립 필터가 셋 모두를 자연스럽게 수용한다.

## 현재 구조

- `src/lib/adminArchive.ts`: 갤러리만 `AdminFacet`(결합형) 사용 — `facet.param='cat'`, `fields=['event_type','event_year']`, options=`[전체, 캠프 2026, 캠프 2025, 캠프 2023, 앨범 2024]`. `applyFacet(facet, value)`가 `camp:2026` → `{event_type:'camp', event_year:'2026'}` eq 필터로 변환.
- videos·press: `event_type`·`event_year` **필드는 있으나 facet 없음** → 필터 UI 없음.
- 목록 API: `/api/admin/archive/[collection]` 가 `cat` 파라미터로 facet 적용.
- UI: `AdminCollectionPage`가 `config.facet` 있으면 `<select>` 하나 렌더.

## 설계

### 1. 데이터 모델 / 설정

`AdminFacet`(결합형 단일 파라미터)을 제거하고, archive 컬렉션에 **2축 독립 필터**를 도입한다.

- 컬렉션 config에 `yearTypeFilter: true`(또는 동등 플래그)로 2축 필터 사용을 표시. videos·gallery·press에 적용.
- 필터 파라미터: `type`(event_type 값), `year`(event_year 값). 둘 다 선택(빈 값=전체).
- `applyFacet`을 대체하는 `applyArchiveFilters(query, { type, year })` — 값이 있을 때만 `.eq('event_type', type)` / `.eq('event_year', year)` 적용.

### 2. 필터 옵션 동적 생성 ("있는 것만")

옵션을 하드코딩하지 않고 실제 데이터에서 추출한다.

- SSR(`loadAdminCollectionPageProps`)에서 해당 테이블의 `event_type, event_year` **두 컬럼만** 조회.
  - 갤러리 16K도 정수/짧은 문자열 2컬럼이라 1회 SSR 부담 작음. (추후 성능 이슈 시 distinct RPC로 교체 가능 — 지금은 YAGNI)
- 추출 순수 함수 `buildArchiveFacetOptions(rows)`:
  - **유형 옵션**: 존재하는 distinct `event_type`을 한글 라벨(`EVENT_TYPE_OPTIONS` 매핑: camp→캠프, album→앨범, live→라이브, music_video→뮤비, interview→인터뷰)로, 알 수 없는 값은 원문. `EVENT_TYPE_OPTIONS` 정의 순서로 정렬, 맨 앞 `전체`(value='').
  - **연도 옵션**: distinct `event_year` 내림차순, 맨 앞 `전체`(value='').
- props로 `typeOptions`, `yearOptions` 전달.

### 3. UI (AdminCollectionPage 상단)

기존 facet `<select>` 자리에 **유형 탭(pill) + 연도 드롭다운**을 렌더한다. videos·gallery·press 동일 컴포넌트.

```
유형:  [전체] 캠프  앨범  라이브  뮤비  인터뷰
연도:  ( 2026 ▾ )         검색 [______]
```

- **유형 탭**: 가로 pill, 활성 항목 강조(jeju-ocean). 클릭 → `type` URL 파라미터 갱신.
- **연도 드롭다운**: `<select>`. 변경 → `year` URL 파라미터 갱신.
- 파라미터 변경 시 기존 로케일 전환과 동일하게 `router.push`로 목록 재조회.
- 기존 검색·상태(client-side) 필터는 그대로 유지.
- 갤러리의 기존 `cat` facet UI·로직은 제거하고 이 2축 UI로 통일.

별도 컴포넌트 `AdminArchiveFilterBar`로 분리(유형 탭 + 연도 드롭다운). AdminCollectionPage는 이를 조립.

### 4. URL / 상태

- `/admin/videos?locale=ko&type=live&year=2024` 형태.
- `loadAdminCollectionPageProps`가 `type`·`year` 쿼리를 읽어 SSR 초기 목록에 반영하고, 옵션과 함께 props로 전달.
- 클라이언트 "더 보기"·새로고침·초안 복제 등 기존 흐름이 현재 `type`·`year`를 유지하도록 list 파라미터 빌더에 포함.

## 영향 받는 파일 (개략)

- `src/lib/adminArchive.ts` — AdminFacet 제거/대체, `applyArchiveFilters`, config 플래그, 옵션 추출 함수
- `src/lib/adminArchive.test.ts` — applyFacet 테스트 → applyArchiveFilters + buildArchiveFacetOptions 테스트
- `src/lib/adminPageData.ts`(loadAdminCollectionPageProps) — type/year 읽기, 옵션 조회·전달
- `pages/api/admin/archive/[collection].ts` — cat → type/year 필터
- `src/components/admin/AdminCollectionPage.tsx` — facet select 제거, 필터 바 조립, list 파라미터에 type/year
- `src/components/admin/AdminArchiveFilterBar.tsx` (신규) — 유형 탭 + 연도 드롭다운
- `src/lib/adminArchive.ts`의 videos/gallery/press config — 2축 필터 활성, 갤러리 기존 facet 제거

## 테스트

- `buildArchiveFacetOptions`: distinct 추출·내림차순·한글 라벨 매핑·전체 옵션 선두
- `applyArchiveFilters`: type만/year만/둘 다/없음 각각 올바른 eq 호출 (체이너블 목)
- 기존 `applyFacet` 관련 테스트 제거/교체

## YAGNI / 범위 밖

- 공개 사이트 연도 구성
- 회의록·백서 연도 분류 (별도 작업)
- 연도 distinct를 위한 전용 RPC (데이터 규모상 SSR 2컬럼 조회로 충분; 필요 시 후속)
- 유형·연도 외 추가 필터(장소·뮤지션 등)
