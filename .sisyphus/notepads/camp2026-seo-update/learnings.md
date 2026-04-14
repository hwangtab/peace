# Learnings

## [2026-03-18] Session Start

### Existing musician images in public/images-webp/musicians/
Already present (no download needed):
1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 21, 22, 23, 24, 26, 27, 29, 35, 37, 40, 43, 46, 47, 49, 51, 53, 54, 57, 59, 60

Missing (need download or copy):
17, 20, 25, 30, 31, 32, 33, 34, 36, 39, 42, 44, 45, 48, 50, 52, 55, 56, 58

Note: 27, 54, 59 already exist in musicians/ folder — but their imageUrl in data still points to camps/ paths.
Note: 36 does NOT exist yet — needs copy from camps/2025/DSC00723.webp

### Camp source images confirmed present:
- /public/images-webp/camps/2026/sight.jpeg (ID 27)
- /public/images-webp/camps/2025/DSC00723.webp (ID 36)
- /public/images-webp/camps/2026/464596350_8533558266721540_3682315944236788793_n.jpg (ID 54)
- /public/images-webp/camps/2026/KakaoTalk_Photo_2024-11-20-10-06-50 025.png (ID 59)

### Key constraints
- 3 files must stay in sync: src/data/musicians.ts, public/data/musicians.json, public/data/en/musicians.json
- SEOHelmet.tsx must NOT be modified
- /pages/album/musicians/[id].tsx must NOT be modified
- sitemap/generateSitemap.js must NOT be modified
- This is a Next.js project (not CRA despite README saying CRA — uses next.config.js)

## [2026-03-18] Task 1: Image Download Complete

### Execution Summary
- Created: `scripts/download-musician-images.js`
- Downloaded: 18 musician images (IDs: 17, 20, 25, 30, 31, 32, 33, 34, 39, 42, 44, 45, 48, 50, 52, 55, 56, 58)
- All 18 files successfully converted to WebP format
- All files >1KB and valid WebP (verified with `file` command)
- Evidence saved to `.sisyphus/evidence/task-1-*`

### Script Features
- Uses `sharp` for WebP conversion (quality: 85, effort: 4)
- Includes User-Agent header to avoid bot blocking
- Validates downloaded files (>1KB + valid image metadata)
- Skips existing files (no overwrite)
- Logs errors and continues on failure
- Saves verification report and download log

### File Sizes (WebP)
- Smallest: ID 39 (2.3 KB), ID 55 (3.2 KB), ID 42 (4.3 KB)
- Largest: ID 58 (151 KB), ID 25 (90.8 KB), ID 31 (47.3 KB)
- Average: ~40 KB per file

### Next Steps
- Task 2: Copy ID 36 from camps/2025/DSC00723.webp
- Task 3: Update musicians.ts data pointers for IDs 17, 20, 25, 30, 31, 32, 33, 34, 39, 42, 44, 45, 48, 50, 52, 55, 56, 58

## [2026-03-18] Task 4: Camp musician SEO context split

### What worked
- `MusicianDetailContent`에 `pageContext?: 'album' | 'camp'`를 추가하고, `pageContext === 'camp'`일 때만 SEO 메타(title/description/keywords)를 분기하면 공용 컴포넌트 재사용을 유지하면서 캠프 SEO만 별도 제어할 수 있음.
- 앨범 라우트는 prop 미전달(기본 `undefined`) 상태로 두면 기존 SEO 문자열이 그대로 유지되어 회귀 없이 안전함.
- `camp.seo_musician_suffix`를 i18n 키로 분리해 메타 설명에 붙이는 방식이 로케일별 유지보수에 유리함.

## [2026-03-18] Task 3: Musician imageUrl localization

### What worked
- `src/data/musicians.ts`는 single quote 스타일을 쓰고 있어 imageUrl 검증/추출 스크립트에서 `['"]` 둘 다 허용해야 함.
- 지정된 24개 ID만 `/images-webp/musicians/{id}.webp`로 교체하면 `src/data/musicians.ts`와 `public/data/musicians.json`을 안전하게 동기화할 수 있음.
- `npm run build`가 성공하면서 `scripts/generateSitemap.js`가 자동 실행되어 데이터 변경 후 정적 생성까지 함께 검증됨.

## [2026-03-18] Task 5: English musicians JSON expansion

### What worked
- `public/data/en/musicians.json`은 기존 12개 엔트리를 유지한 채 캠프 누락 46명을 추가하는 방식이 안전하다. 이 파일은 최종적으로 58개 엔트리를 가지지만, 검증 대상인 54개 캠프 musician ID는 모두 포함된다.
- 영문 표기는 `public/data/musicians.json`보다 `src/data/camps.ts`의 `campsEn` 이름을 우선해야 캠프 페이지 노출명과 일치한다.
- 영문 JSON에서도 모든 신규 항목의 `imageUrl`은 원본 한국어 데이터의 외부 URL/캠프 경로와 무관하게 `/images-webp/musicians/{id}.webp`로 강제하는 것이 검증 조건에 맞다.
