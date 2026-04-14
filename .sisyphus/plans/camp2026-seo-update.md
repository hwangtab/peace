# 26캠프 SEO/메타데이터/썸네일 업데이트

## TL;DR

> **Quick Summary**: 26캠프(제3회 강정피스앤뮤직캠프) 뮤지션 페이지의 SEO 완성도를 높인다. 외부 URL 이미지를 로컬로 전환하여 OG 썸네일을 안정화하고, 캠프 출연 맥락을 SEO 메타데이터에 반영하며, 영문 뮤지션 데이터를 보강한다.
>
> **Deliverables**:
> - 18개 외부 이미지 다운로드 → webp 변환 → 로컬 저장 + 6개 데이터 포인터 수정
> - 캠프 뮤지션 페이지 SEO에 "26캠프 출연" 맥락 추가 (앨범 페이지 불변)
> - 영문 musicians.json에 46명 추가 (기존 8명 + 신규 46명 = 54명)
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: Task 1 (이미지 다운로드) → Task 2~4 (데이터 업데이트 + SEO + 영문) → Task 5 (검증)

---

## Context

### Original Request
26캠프와 관련해서 SEO, 메타데이터, 썸네일 업데이트. 각 뮤지션들이 자기 사진이 썸네일로 나오게 하고, SEO도 26캠프에 출연하는 뮤지션으로서 초점 맞춰 소개.

### Interview Summary
**Key Discussions**:
- 외부 URL 이미지 ~20명 → 다운로드하여 로컬화
- 영문 데이터 54명 전원 보강 포함
- 빈약한 description 개선은 이번 스코프에서 제외
- sitemap 작업은 `scripts/generateSitemap.js`가 이미 처리 → 불필요 (Metis 발견)

**Research Findings**:
- `MusicianDetailContent.tsx`가 `/album/musicians/[id]`와 `/camps/2026/musicians/[id]` 공용 → `pageContext` prop 필요
- ID 22(모허), 40(윤선애): 로컬 `.webp` 파일 존재하지만 데이터가 외부 URL을 가리킴 → 포인터만 수정
- ID 27, 36, 54, 59: 캠프 사진을 프로필로 사용 중 → musicians 폴더로 복사/이동
- `SEOHelmet.tsx`의 `getFullUrl()` 함수가 상대경로를 절대URL로 변환 → 외부 URL에 적용 시 이중 URL 버그 발생 중 (로컬화로 자동 해결)

### Metis Review
**Identified Gaps** (addressed):
- sitemap은 이미 완성 → 플랜에서 제거
- 3파일 동기화 필수 (musicians.ts + musicians.json + en/musicians.json)
- 영문 누락 46명 (42가 아닌)
- ID 22, 40 포인터 수정 필요
- pageContext prop으로 앨범/캠프 분기 필요
- OG 이미지 비율(1200x630 vs 정사각형) 이슈 → 이번 스코프 외

---

## Work Objectives

### Core Objective
26캠프 뮤지션 54명의 페이지가 SNS 공유 시 각자의 프로필 사진이 썸네일로 표시되고, 검색엔진에 "26캠프 출연 뮤지션"으로서 최적화되도록 SEO 메타데이터를 정비한다.

### Concrete Deliverables
- 18개 외부 이미지 → `/public/images-webp/musicians/{id}.webp`
- 4개 캠프 사진 → `/public/images-webp/musicians/{id}.webp` (복사)
- 24개 뮤지션의 `imageUrl` 3파일 동기화
- `MusicianDetailContent.tsx`에 `pageContext` prop 추가
- `/pages/camps/2026/musicians/[id].tsx`에서 캠프 맥락 SEO 전달
- `/public/data/en/musicians.json`에 46명 추가

### Definition of Done
- [ ] 54명 전원의 `imageUrl`이 `/images-webp/musicians/` 로컬 경로 또는 기존 유효한 로컬 경로를 가리킴
- [ ] `/camps/2026/musicians/{id}` 페이지의 `<title>`에 캠프 맥락 포함
- [ ] `/album/musicians/{id}` 페이지의 `<title>`에 캠프 맥락 미포함 (기존 유지)
- [ ] 영문 `en/musicians.json`에 54명 캠프 뮤지션 전원 존재
- [ ] `npm run build` 성공

### Must Have
- 각 뮤지션의 자기 사진이 OG 썸네일로 표시
- 캠프 맥락 SEO (title, description, keywords)
- 3파일 데이터 일관성 (musicians.ts, musicians.json, en/musicians.json)

### Must NOT Have (Guardrails)
- `/album/musicians/[id]` 페이지 SEO 변경 금지
- SEOHelmet.tsx 컴포넌트 자체 수정 금지
- 기존 영문 번역(ID 1-12) 수정 금지
- 빈약한 description 보강 (치치, 키타와올겐, 피움) 금지
- 영문 외 다른 로케일(es, fr, de 등) 번역 추가 금지
- sitemap.xml 또는 generateSitemap.js 수정 금지
- 데이터 자동 동기화 빌드 스크립트 추가 금지

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (jest.config.js)
- **Automated tests**: None — 이 작업은 데이터/설정 변경이라 기존 테스트 영향 없음
- **Framework**: N/A

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Image files**: Use Bash — `ls -la`, `file` command로 이미지 검증
- **SEO metadata**: Use Bash — `npm run build` 후 생성된 HTML에서 meta tag grep
- **Data consistency**: Use Bash — node 스크립트로 3파일 비교 검증
- **Build**: Use Bash — `npm run build` 성공 확인

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — 이미지 다운로드 스크립트 + 실행):
├── Task 1: 외부 이미지 다운로드 & webp 변환 스크립트 작성/실행 [quick]
└── Task 2: 캠프 사진 4개를 musicians 폴더로 복사 [quick]

Wave 2 (After Wave 1 — 데이터 업데이트 + SEO + 영문, MAX PARALLEL):
├── Task 3: musicians.ts + musicians.json imageUrl 업데이트 (24건) [unspecified-high]
├── Task 4: MusicianDetailContent에 pageContext prop 추가 + 캠프 SEO 적용 [deep]
└── Task 5: en/musicians.json에 46명 추가 [unspecified-high]

Wave FINAL (After ALL — 검증):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | — | 3 |
| 2 | — | 3 |
| 3 | 1, 2 | F1-F4 |
| 4 | — | F1-F4 |
| 5 | 1, 2 | F1-F4 |
| F1-F4 | 3, 4, 5 | — |

### Agent Dispatch Summary

- **Wave 1**: **2 tasks** — T1 → `quick`, T2 → `quick`
- **Wave 2**: **3 tasks** — T3 → `unspecified-high`, T4 → `deep`, T5 → `unspecified-high`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. 외부 이미지 다운로드 & webp 변환 스크립트 작성/실행

  **What to do**:
  - Node.js 일회성 스크립트를 작성하여 18개 외부 URL 이미지를 다운로드
  - 대상 ID와 현재 URL:
    ```
    17: https://image.bugsm.co.kr/album/images/500/205313/20531325.jpg
    20: https://kprofiles.com/wp-content/uploads/2020/08/Mgz_Main_Top_20160218193236.jpg
    25: https://i.ytimg.com/vi/fp1kFyL6AxQ/hq720.jpg?sqp=...
    30: https://image.genie.co.kr/Y/IMAGE/IMG_ARTIST/014/937/608/14937608_4_600x600.JPG
    31: https://ojsfile.ohmynews.com/STD_IMG_FILE/2023/1206/IE003236477_STD.jpg
    32: https://ojsfile.ohmynews.com/CT_T_IMG/2017/0819/IE002205318_LT.jpg
    33: https://lh5.googleusercontent.com/proxy/oX_irhtfpzHmEbGR-AKKrMIJT1I1WAYuj4G75Vm2eiiotqz8tQjEm9pvuiGx2pmme0TPvoRXIlNlzwaZepyd1LleYzADR1W4PgXDZfShmR-pRdp_cfc94-otTp44lDAZFzrkZIiVF_Y
    34: https://i3.ruliweb.com/img/25/04/08/19613ee8904afd4.jpeg
    39: https://image.bugsm.co.kr/artist/images/200/200905/20090589.jpg
    42: https://image.bugsm.co.kr/artist/images/200/800739/80073984.jpg
    44: https://img.khan.co.kr/newsmaker/1354/1354_38.jpg
    45: https://ojsfile.ohmynews.com/STD_IMG_FILE/2019/0711/IE002521195_STD.jpg
    48: https://cdn.jejusori.net/news/photo/201003/77655_84499_4920.jpg
    50: https://i.ytimg.com/vi/kcASkP7C0CM/maxresdefault.jpg
    52: https://i.ytimg.com/vi/HAm1Jg1LZkY/hq720.jpg?sqp=...
    55: https://image.bugsm.co.kr/artist/images/224/200649/20064990.jpg
    56: https://theplay.or.kr/wp-content/uploads/포크송-가수-황명하-8.jpg
    58: https://mblogthumb-phinf.pstatic.net/MjAyMzA5MjRfMTYw/MDAxNjk1NTM5NDg5MTU0.hfy0_56rmwIGsFMtySOw6HPX4F_ywdJMFB0CR3t6jGcg.57jZOi-BeYm4Gf4kl3UTl0nEbHGIao9fa_B6GqCcvAsg.JPEG.minjow1996/IMG＿20230924＿155512＿094.jpg?type=w800
    ```
  - `sharp` (이미 프로젝트에 설치됨)를 사용하여 webp로 변환
  - 저장 경로: `/public/images-webp/musicians/{id}.webp`
  - User-Agent 헤더 포함, 리트라이 로직 추가
  - 다운로드 실패 시 로그 출력 후 계속 진행 (crash 금지)
  - 다운로드된 파일이 실제 이미지인지 검증 (파일 크기 > 1KB, magic bytes 확인)

  **Must NOT do**:
  - 기존 로컬 이미지 덮어쓰기 금지 (이미 존재하는 {id}.webp는 건너뛰기)
  - `scripts/convert-images-optimized.js` 수정 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단일 스크립트 작성+실행. 명확한 입출력.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `scripts/convert-images-optimized.js` — sharp 사용 패턴 참조 (webp 변환 옵션)
  - `src/data/musicians.ts` — 각 뮤지션의 현재 imageUrl 확인
  - `public/images-webp/musicians/` — 기존 파일 네이밍 패턴 ({id}.webp)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 18개 이미지 파일 존재 확인
    Tool: Bash
    Preconditions: 스크립트 실행 완료
    Steps:
      1. ls -la public/images-webp/musicians/{17,20,25,30,31,32,33,34,39,42,44,45,48,50,52,55,56,58}.webp
      2. 각 파일 크기가 1KB 이상인지 확인
      3. file public/images-webp/musicians/17.webp 명령으로 이미지 타입 확인
    Expected Result: 18개 파일 모두 존재, 각각 1KB 이상, WebP 또는 RIFF 타입
    Failure Indicators: 파일 누락, 0바이트 파일, HTML 에러 페이지 저장
    Evidence: .sisyphus/evidence/task-1-image-download-verify.txt

  Scenario: 다운로드 실패 시 그레이스풀 처리
    Tool: Bash
    Preconditions: 스크립트에 의도적으로 잘못된 URL이 없어도 로그 확인
    Steps:
      1. 스크립트 실행 로그에서 실패 건수 확인
      2. 실패한 ID가 있으면 해당 URL과 에러 메시지 확인
    Expected Result: 실패 건이 있어도 스크립트는 정상 종료, 실패 ID 목록 출력
    Evidence: .sisyphus/evidence/task-1-download-log.txt
  ```

  **Commit**: YES (groups with Task 2, 3)
  - Message: `feat(images): download and localize external musician images`
  - Files: `public/images-webp/musicians/*.webp`, `scripts/download-musician-images.js`
  - Pre-commit: `ls public/images-webp/musicians/{17,20,25,30,31,32,33,34,39,42,44,45,48,50,52,55,56,58}.webp`

- [x] 2. 캠프 사진 4개를 musicians 폴더로 복사

  **What to do**:
  - 4명의 뮤지션이 캠프 사진을 프로필로 사용 중 → musicians 폴더에 전용 사본 생성
  - 복사 대상:
    ```
    ID 27 (Sight X Zsthyger): /images-webp/camps/2026/sight.jpeg → /images-webp/musicians/27.webp
    ID 36 (오재환): /images-webp/camps/2025/DSC00723.webp → /images-webp/musicians/36.webp  
    ID 54 (Honey Whiskey): /images-webp/camps/2026/464596350_8533558266721540_3682315944236788793_n.jpg → /images-webp/musicians/54.webp
    ID 59 (HANASH): /images-webp/camps/2026/KakaoTalk_Photo_2024-11-20-10-06-50 025.png → /images-webp/musicians/59.webp
    ```
  - jpeg/png 파일은 sharp로 webp 변환하여 저장
  - webp 파일은 그대로 복사
  - 원본 파일 삭제하지 않음

  **Must NOT do**:
  - 원본 캠프 사진 삭제 금지
  - 기존 musicians 폴더 파일 덮어쓰기 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 4개 파일 복사/변환. 매우 단순.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `public/images-webp/camps/2026/sight.jpeg` — ID 27 원본
  - `public/images-webp/camps/2025/DSC00723.webp` — ID 36 원본
  - `public/images-webp/camps/2026/` — ID 54, 59 원본 (파일명은 musicians.ts에서 확인)
  - `src/data/musicians.ts:294,374,544,594` — 각 뮤지션의 현재 imageUrl 참조

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 4개 이미지 파일 존재 및 타입 확인
    Tool: Bash
    Preconditions: 복사/변환 완료
    Steps:
      1. ls -la public/images-webp/musicians/{27,36,54,59}.webp
      2. file public/images-webp/musicians/{27,36,54,59}.webp
      3. 각 파일 크기가 1KB 이상인지 확인
    Expected Result: 4개 파일 모두 WebP 포맷, 1KB 이상
    Failure Indicators: 파일 누락 또는 변환 실패
    Evidence: .sisyphus/evidence/task-2-camp-image-copy.txt

  Scenario: 원본 캠프 사진 보존 확인
    Tool: Bash
    Preconditions: 복사 완료
    Steps:
      1. ls -la public/images-webp/camps/2026/sight.jpeg
      2. ls -la public/images-webp/camps/2025/DSC00723.webp
    Expected Result: 원본 파일 모두 존재 (삭제되지 않음)
    Evidence: .sisyphus/evidence/task-2-originals-preserved.txt
  ```

  **Commit**: YES (groups with Task 1, 3)
  - Message: `feat(images): download and localize external musician images`
  - Files: `public/images-webp/musicians/{27,36,54,59}.webp`

- [x] 3. musicians.ts + musicians.json imageUrl 업데이트 (24건)

  **What to do**:
  - 24명의 뮤지션 imageUrl을 로컬 경로로 업데이트
  - 대상 및 변경값:
    ```
    ID 17: "https://image.bugsm.co.kr/..." → "/images-webp/musicians/17.webp"
    ID 20: "https://kprofiles.com/..." → "/images-webp/musicians/20.webp"
    ID 22: "https://street-h.com/..." → "/images-webp/musicians/22.webp" (로컬 파일 이미 존재)
    ID 25: "https://i.ytimg.com/..." → "/images-webp/musicians/25.webp"
    ID 27: "/images-webp/camps/2026/sight.jpeg" → "/images-webp/musicians/27.webp"
    ID 30: "https://image.genie.co.kr/..." → "/images-webp/musicians/30.webp"
    ID 31: "https://ojsfile.ohmynews.com/..." → "/images-webp/musicians/31.webp"
    ID 32: "https://ojsfile.ohmynews.com/..." → "/images-webp/musicians/32.webp"
    ID 33: "https://lh5.googleusercontent.com/..." → "/images-webp/musicians/33.webp"
    ID 34: "https://i3.ruliweb.com/..." → "/images-webp/musicians/34.webp"
    ID 36: "/images-webp/camps/2025/DSC00723.webp" → "/images-webp/musicians/36.webp"
    ID 39: "https://image.bugsm.co.kr/..." → "/images-webp/musicians/39.webp"
    ID 40: "https://ojsfile.ohmynews.com/..." → "/images-webp/musicians/40.webp" (로컬 파일 이미 존재)
    ID 42: "https://image.bugsm.co.kr/..." → "/images-webp/musicians/42.webp"
    ID 44: "https://img.khan.co.kr/..." → "/images-webp/musicians/44.webp"
    ID 45: "https://ojsfile.ohmynews.com/..." → "/images-webp/musicians/45.webp"
    ID 48: "https://cdn.jejusori.net/..." → "/images-webp/musicians/48.webp"
    ID 50: "https://i.ytimg.com/..." → "/images-webp/musicians/50.webp"
    ID 52: "https://i.ytimg.com/..." → "/images-webp/musicians/52.webp"
    ID 54: "/images-webp/camps/2026/..." → "/images-webp/musicians/54.webp"
    ID 55: "https://image.bugsm.co.kr/..." → "/images-webp/musicians/55.webp"
    ID 56: "https://theplay.or.kr/..." → "/images-webp/musicians/56.webp"
    ID 58: "https://mblogthumb-phinf.pstatic.net/..." → "/images-webp/musicians/58.webp"
    ID 59: "/images-webp/camps/2026/..." → "/images-webp/musicians/59.webp"
    ```
  - **두 파일 모두 업데이트**: `src/data/musicians.ts` AND `public/data/musicians.json`
  - 각 ID에 대해 old URL → new URL 교체 (정확한 문자열 매칭)

  **Must NOT do**:
  - imageUrl 이외의 필드 수정 금지
  - 24건 이외의 뮤지션 데이터 변경 금지
  - en/musicians.json은 Task 5에서 처리 — 여기서 수정 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 24건의 정확한 문자열 교체. 2개 파일 동기화. 실수 위험.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 4, 5)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `src/data/musicians.ts` — 전체 뮤지션 데이터 (TypeScript)
  - `public/data/musicians.json` — 전체 뮤지션 데이터 (JSON, getStaticProps에서 사용)
  - 각 ID의 정확한 현재 URL은 위 "대상 및 변경값" 참조

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: musicians.ts에서 외부 URL 완전 제거 확인
    Tool: Bash
    Preconditions: 수정 완료
    Steps:
      1. grep -n "bugsm.co.kr\|kprofiles.com\|ohmynews.com\|ytimg.com\|googleusercontent.com\|ruliweb.com\|khan.co.kr\|theplay.or.kr\|pstatic.net\|genie.co.kr\|jejusori.net\|street-h.com" src/data/musicians.ts
      2. 결과가 없어야 함 (instagramUrls이나 youtubeUrl 제외한 imageUrl만)
    Expected Result: imageUrl 필드에 외부 URL 없음
    Failure Indicators: grep 결과에 imageUrl 라인이 나옴
    Evidence: .sisyphus/evidence/task-3-no-external-urls.txt

  Scenario: musicians.json 동일 검증
    Tool: Bash
    Preconditions: 수정 완료
    Steps:
      1. node -e "const m=require('./public/data/musicians.json');const ext=m.filter(e=>e.imageUrl&&e.imageUrl.startsWith('http'));console.log(ext.length===0?'OK':'EXTERNAL:'+ext.map(e=>e.id).join(','))"
    Expected Result: OK 출력
    Evidence: .sisyphus/evidence/task-3-json-no-external.txt

  Scenario: 두 파일 간 imageUrl 일관성 검증
    Tool: Bash
    Preconditions: 수정 완료
    Steps:
      1. node 스크립트로 musicians.ts의 24개 ID imageUrl과 musicians.json의 동일 ID imageUrl 비교
    Expected Result: 24개 전부 일치
    Failure Indicators: 불일치 ID 존재
    Evidence: .sisyphus/evidence/task-3-data-consistency.txt
  ```

  **Commit**: YES (groups with Task 1, 2)
  - Message: `feat(images): download and localize external musician images`
  - Files: `src/data/musicians.ts`, `public/data/musicians.json`
  - Pre-commit: `node -e "const m=require('./public/data/musicians.json');const ext=m.filter(e=>e.imageUrl&&e.imageUrl.startsWith('http'));console.log(ext.length===0?'OK':'FAIL:'+ext.length)"`

- [x] 4. MusicianDetailContent에 pageContext prop 추가 + 캠프 SEO 적용

  **What to do**:
  - `MusicianDetailContent.tsx`에 선택적 `pageContext?: 'album' | 'camp'` prop 추가
  - `pageContext === 'camp'`일 때 SEO 메타데이터 변경:
    - **title**: `${musician.name} — ${t('camp.title_2026')} | ${t('nav.logo')}`
    - **description**: `${musician.shortDescription} ${t('camp.seo_musician_suffix')}` (번역 키 추가 필요 — "2026년 6월 5-7일 제주 강정체육공원에서 열리는 제3회 강정피스앤뮤직캠프에 출연합니다.")
    - **keywords**: 기존 + `, 강정피스앤뮤직캠프, 2026, 강정마을, 평화음악축제`
  - `pageContext` 없거나 `'album'`일 때: 기존 동작 유지 (변경 없음)
  - `/pages/camps/2026/musicians/[id].tsx`에서 `pageContext="camp"` prop 전달
  - `/pages/album/musicians/[id].tsx`는 수정하지 않음 (기본값 유지)
  - 번역 파일 업데이트: `public/locales/ko/translation.json`에 `camp.seo_musician_suffix` 키 추가
  - 번역 파일 업데이트: `public/locales/en/translation.json`에 영문 번역 추가

  **Must NOT do**:
  - `SEOHelmet.tsx` 수정 금지
  - `/pages/album/musicians/[id].tsx` 수정 금지
  - `pageContext` 외 MusicianDetailContent의 기존 props/로직 변경 금지

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 공유 컴포넌트 수정으로 앨범 페이지 회귀 위험. 번역 파일 동기화 필요.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3, 5)
  - **Blocks**: F1-F4
  - **Blocked By**: None (SEO 로직 변경은 이미지 로컬화와 독립)

  **References**:
  - `src/components/musicians/MusicianDetailContent.tsx:54-63` — 현재 SEO 설정 코드 (PageLayout에 title/description/keywords/ogImage 전달)
  - `src/components/musicians/MusicianDetailContent.tsx:20-30` — MusicianDetailContentProps 인터페이스
  - `pages/camps/2026/musicians/[id].tsx:17-37` — 캠프 뮤지션 페이지 (여기서 pageContext="camp" 전달)
  - `pages/album/musicians/[id].tsx` — 앨범 뮤지션 페이지 (수정 금지, 비교 대상)
  - `public/locales/ko/translation.json` — 한국어 번역 (camp.seo_musician_suffix 추가)
  - `public/locales/en/translation.json` — 영문 번역 (동일 키 추가)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 캠프 뮤지션 페이지 SEO title에 캠프 맥락 포함
    Tool: Bash
    Preconditions: npm run build 완료
    Steps:
      1. 빌드된 HTML에서 캠프 뮤지션 페이지 확인
      2. grep -o '<title>[^<]*</title>' .next/server/pages/camps/2026/musicians/14.html
      3. 결과에 "강정피스앤뮤직캠프" 또는 camp 관련 텍스트 포함 확인
    Expected Result: title에 캠프 맥락 포함 (예: "강가히말라야 — 제3회 강정피스앤뮤직캠프")
    Failure Indicators: 기존 포맷 그대로 ("{name} | {app.title}")
    Evidence: .sisyphus/evidence/task-4-camp-seo-title.txt

  Scenario: 앨범 뮤지션 페이지 SEO title 미변경 확인
    Tool: Bash
    Preconditions: npm run build 완료
    Steps:
      1. grep -o '<title>[^<]*</title>' .next/server/pages/album/musicians/2.html
      2. 결과에 "캠프" 텍스트 미포함 확인
    Expected Result: 기존 포맷 유지 ("{name} | {app.title}") — 캠프 맥락 없음
    Failure Indicators: 캠프 관련 텍스트 포함
    Evidence: .sisyphus/evidence/task-4-album-seo-unchanged.txt

  Scenario: TypeScript 타입 체크 통과
    Tool: Bash
    Preconditions: 코드 수정 완료
    Steps:
      1. npx tsc --noEmit
    Expected Result: 에러 0건
    Failure Indicators: MusicianDetailContentProps 관련 타입 에러
    Evidence: .sisyphus/evidence/task-4-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(seo): add camp context to musician page SEO metadata`
  - Files: `src/components/musicians/MusicianDetailContent.tsx`, `pages/camps/2026/musicians/[id].tsx`, `public/locales/ko/translation.json`, `public/locales/en/translation.json`
  - Pre-commit: `npx tsc --noEmit`

- [x] 5. en/musicians.json에 46명 추가

  **What to do**:
  - `public/data/en/musicians.json`에 46명의 영문 뮤지션 데이터 추가
  - 기존 8명 유지 (ID 2, 3, 4, 5, 7, 10, 11, 12) — 수정 금지
  - 추가 대상: 54명 캠프 참가자 중 기존에 없는 46명
    - IDs: 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 13
  - 필드 구조는 기존 영문 항목과 동일하게 맞출 것:
    ```json
    {
      "id": number,
      "name": "English name",
      "shortDescription": "English short desc",
      "description": "English full desc",
      "genre": ["genre1", "genre2"],
      "trackTitle": "track title or empty",
      "imageUrl": "/images-webp/musicians/{id}.webp",
      "instagramUrls": [...],
      "youtubeUrl": "..." (있는 경우)
    }
    ```
  - **imageUrl은 로컬 경로로 설정** (Task 3에서 업데이트된 값과 동일)
  - 한국어 고유명사(인명, 지명)는 그대로 유지하고 설명만 영문으로
  - 이미 영문 이름이 있는 뮤지션은 `src/data/camps.ts`의 campsEn 데이터에서 참조 (line 300-353)

  **Must NOT do**:
  - 기존 12개 항목 수정 금지 (ID 1-12 중 영문에 있는 것들)
  - 한국어 musicians.json 수정 금지
  - 다른 로케일 JSON 수정 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 46개 항목 번역 및 추가. 데이터 구조 일관성 유지 필요. 양이 많음.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3, 4)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1, Task 2 (imageUrl에 로컬 경로 사용해야 하므로)

  **References**:
  - `public/data/en/musicians.json` — 기존 영문 데이터 (12명, 구조 참조)
  - `public/data/musicians.json` — 한국어 원본 (번역 소스)
  - `src/data/camps.ts:300-353` — campsEn의 영문 이름 참조
  - `src/data/musicians.ts` — 전체 뮤지션 데이터 (genre, instagramUrls 등)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: JSON 파싱 성공 확인
    Tool: Bash
    Preconditions: 수정 완료
    Steps:
      1. node -e "JSON.parse(require('fs').readFileSync('public/data/en/musicians.json'));console.log('VALID JSON')"
    Expected Result: "VALID JSON" 출력
    Failure Indicators: SyntaxError
    Evidence: .sisyphus/evidence/task-5-json-valid.txt

  Scenario: 54명 전원 존재 확인
    Tool: Bash
    Preconditions: 수정 완료
    Steps:
      1. node -e "const d=JSON.parse(require('fs').readFileSync('public/data/en/musicians.json'));const ids=[14,5,15,3,16,4,17,18,19,20,21,10,22,7,23,24,13,25,26,27,29,30,31,32,33,34,35,36,37,38,39,40,12,42,11,43,2,44,45,46,47,48,49,50,51,52,60,59,53,54,55,56,57,58];const missing=ids.filter(id=>!d.find(m=>m.id===id));console.log(missing.length===0?'OK':'MISSING:'+missing)"
    Expected Result: "OK" 출력
    Failure Indicators: MISSING 출력
    Evidence: .sisyphus/evidence/task-5-54-musicians.txt

  Scenario: 기존 8명 데이터 보존 확인
    Tool: Bash
    Preconditions: 수정 완료
    Steps:
      1. node -e "const d=JSON.parse(require('fs').readFileSync('public/data/en/musicians.json'));const existing=[2,3,4,5,7,10,11,12];existing.forEach(id=>{const m=d.find(e=>e.id===id);if(!m)console.log('MISSING:'+id);else console.log('OK:'+id+' '+m.name);})"
    Expected Result: 8개 모두 "OK:" 출력, 기존 name/description 유지
    Evidence: .sisyphus/evidence/task-5-existing-preserved.txt

  Scenario: imageUrl이 로컬 경로인지 확인
    Tool: Bash
    Preconditions: 수정 완료
    Steps:
      1. node -e "const d=JSON.parse(require('fs').readFileSync('public/data/en/musicians.json'));const ids=[14,5,15,3,16,4,17,18,19,20,21,10,22,7,23,24,13,25,26,27,29,30,31,32,33,34,35,36,37,38,39,40,12,42,11,43,2,44,45,46,47,48,49,50,51,52,60,59,53,54,55,56,57,58];const ext=ids.filter(id=>{const m=d.find(e=>e.id===id);return m&&m.imageUrl&&m.imageUrl.startsWith('http')});console.log(ext.length===0?'OK':'EXTERNAL:'+ext)"
    Expected Result: "OK" 출력
    Evidence: .sisyphus/evidence/task-5-local-urls.txt
  ```

  **Commit**: YES
  - Message: `feat(i18n): add 46 camp musicians to English musicians.json`
  - Files: `public/data/en/musicians.json`
  - Pre-commit: `node -e "JSON.parse(require('fs').readFileSync('public/data/en/musicians.json'));console.log('OK')"`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `unspecified-high`

  **QA Scenarios:**

  ```
  Scenario: Must Have — 모든 캠프 뮤지션 로컬 이미지 사용
    Tool: Bash
    Steps:
      1. node -e "const m=require('./public/data/musicians.json');const ids=[14,5,15,3,16,4,17,18,19,20,21,10,22,7,23,24,13,25,26,27,29,30,31,32,33,34,35,36,37,38,39,40,12,42,11,43,2,44,45,46,47,48,49,50,51,52,60,59,53,54,55,56,57,58];const ext=ids.filter(id=>{const x=m.find(e=>e.id===id);return x&&x.imageUrl.startsWith('http')});console.log(ext.length===0?'PASS':'FAIL:'+JSON.stringify(ext))"
    Expected Result: "PASS" 출력
    Evidence: .sisyphus/evidence/f1-must-have-local-images.txt

  Scenario: Must Have — 캠프 SEO 메타데이터 적용
    Tool: Bash
    Steps:
      1. npm run build
      2. grep -l "pageContext" src/components/musicians/MusicianDetailContent.tsx
      3. grep -l "pageContext.*camp" pages/camps/2026/musicians/\\[id\\].tsx
    Expected Result: 두 파일 모두 매칭, pageContext 로직 존재
    Evidence: .sisyphus/evidence/f1-must-have-camp-seo.txt

  Scenario: Must Have — 영문 54명 완비
    Tool: Bash
    Steps:
      1. node -e "const d=JSON.parse(require('fs').readFileSync('public/data/en/musicians.json'));const ids=[14,5,15,3,16,4,17,18,19,20,21,10,22,7,23,24,13,25,26,27,29,30,31,32,33,34,35,36,37,38,39,40,12,42,11,43,2,44,45,46,47,48,49,50,51,52,60,59,53,54,55,56,57,58];const missing=ids.filter(id=>!d.find(m=>m.id===id));console.log(missing.length===0?'PASS':'FAIL:'+missing)"
    Expected Result: "PASS" 출력
    Evidence: .sisyphus/evidence/f1-must-have-en-data.txt

  Scenario: Must NOT Have — 앨범 페이지 SEO 미변경
    Tool: Bash
    Steps:
      1. grep -c "pageContext" pages/album/musicians/\\[id\\].tsx
    Expected Result: 0 (앨범 라우트에 pageContext 미전달)
    Evidence: .sisyphus/evidence/f1-must-not-album-unchanged.txt

  Scenario: Must NOT Have — SEOHelmet.tsx 미수정
    Tool: Bash
    Steps:
      1. git diff HEAD -- src/components/shared/SEOHelmet.tsx | wc -l
    Expected Result: 0 (변경 없음)
    Evidence: .sisyphus/evidence/f1-must-not-seohelmet.txt

  Scenario: Must NOT Have — 기존 영문 번역 미수정
    Tool: Bash
    Steps:
      1. git diff HEAD -- public/data/en/musicians.json 파일의 기존 12개 ID 항목이 변경되지 않았는지 확인
      2. node -e "const d=JSON.parse(require('fs').readFileSync('public/data/en/musicians.json'));[2,3,4,5,7,10,11,12].forEach(id=>{const m=d.find(e=>e.id===id);console.log(id+':'+m.name)})"
    Expected Result: 기존 8개 캠프 뮤지션의 name이 이전과 동일
    Evidence: .sisyphus/evidence/f1-must-not-existing-en.txt
  ```

  Output: `Must Have [3/3] | Must NOT Have [3/3] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`

  **QA Scenarios:**

  ```
  Scenario: TypeScript 타입 체크 통과
    Tool: Bash
    Steps:
      1. npx tsc --noEmit 2>&1
    Expected Result: 에러 0건, exit code 0
    Evidence: .sisyphus/evidence/f2-typecheck.txt

  Scenario: 프로덕션 빌드 성공
    Tool: Bash
    Steps:
      1. npm run build 2>&1
    Expected Result: "Compiled successfully" 또는 exit code 0
    Failure Indicators: "Error:", "Failed to compile"
    Evidence: .sisyphus/evidence/f2-build.txt

  Scenario: JSON 파일 유효성
    Tool: Bash
    Steps:
      1. node -e "JSON.parse(require('fs').readFileSync('public/data/musicians.json'));console.log('ko:OK')"
      2. node -e "JSON.parse(require('fs').readFileSync('public/data/en/musicians.json'));console.log('en:OK')"
    Expected Result: 두 줄 모두 "OK" 출력
    Evidence: .sisyphus/evidence/f2-json-valid.txt

  Scenario: 3파일 간 imageUrl 일관성
    Tool: Bash
    Steps:
      1. node -e "const ko=require('./public/data/musicians.json');const en=JSON.parse(require('fs').readFileSync('public/data/en/musicians.json'));const ids=[17,20,22,25,27,30,31,32,33,34,36,39,40,42,44,45,48,50,52,54,55,56,58,59];const mismatches=ids.filter(id=>{const k=ko.find(m=>m.id===id);const e=en.find(m=>m.id===id);return e&&k&&k.imageUrl!==e.imageUrl});console.log(mismatches.length===0?'PASS':'MISMATCH:'+mismatches)"
    Expected Result: "PASS" 출력
    Evidence: .sisyphus/evidence/f2-data-consistency.txt
  ```

  Output: `TypeCheck [PASS/FAIL] | Build [PASS/FAIL] | JSON [PASS/FAIL] | Consistency [PASS/FAIL] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high`

  **QA Scenarios:**

  ```
  Scenario: 캠프 뮤지션 페이지 OG 이미지 확인 (5명 샘플)
    Tool: Bash
    Steps:
      1. npm run build
      2. 빌드 결과물에서 5명의 캠프 뮤지션 HTML 확인 (ID 14, 17, 30, 51, 59)
      3. 각 파일에서 og:image meta tag 추출: grep 'og:image' .next/server/pages/camps/2026/musicians/{14,17,30,51,59}.html
      4. 각 og:image 값이 "https://peaceandmusic.net/images-webp/musicians/" 로 시작하는지 확인
    Expected Result: 5개 모두 로컬 이미지 경로 포함
    Failure Indicators: 외부 URL(bugsm, ytimg 등) 또는 og:image 태그 누락
    Evidence: .sisyphus/evidence/f3-og-image-camp.txt

  Scenario: 캠프 뮤지션 페이지 title에 캠프 맥락 포함 (3명 샘플)
    Tool: Bash
    Steps:
      1. grep '<title>' .next/server/pages/camps/2026/musicians/{14,30,51}.html
      2. 각 title에 "강정피스앤뮤직캠프" 또는 "Gangjeong Peace" 포함 확인
    Expected Result: 3개 모두 캠프 관련 텍스트 포함
    Evidence: .sisyphus/evidence/f3-camp-title.txt

  Scenario: 앨범 뮤지션 페이지 title에 캠프 맥락 미포함 (2명 샘플)
    Tool: Bash
    Steps:
      1. grep '<title>' .next/server/pages/album/musicians/{2,5}.html
      2. 각 title에 "캠프" 또는 "Camp" 텍스트 미포함 확인
    Expected Result: 2개 모두 캠프 관련 텍스트 없음
    Failure Indicators: "캠프", "Camp", "강정피스앤뮤직캠프" 포함
    Evidence: .sisyphus/evidence/f3-album-unchanged.txt
  ```

  Output: `OG Images [5/5] | Camp Title [3/3] | Album Unchanged [2/2] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`

  **QA Scenarios:**

  ```
  Scenario: 변경된 파일 목록이 스코프 내인지 확인
    Tool: Bash
    Steps:
      1. git diff --name-only HEAD 실행
      2. 변경된 파일이 아래 허용 목록에 포함되는지 확인:
         - src/data/musicians.ts
         - src/components/musicians/MusicianDetailContent.tsx
         - pages/camps/2026/musicians/[id].tsx
         - public/data/musicians.json
         - public/data/en/musicians.json
         - public/images-webp/musicians/*.webp
         - public/locales/ko/translation.json
         - public/locales/en/translation.json
         - scripts/download-musician-images.js (일회성 스크립트)
      3. 허용 목록 외 파일이 변경되었으면 FAIL
    Expected Result: 모든 변경 파일이 허용 목록 내
    Failure Indicators: pages/album/musicians/[id].tsx, src/components/shared/SEOHelmet.tsx, sitemap.xml 등 금지 파일 변경
    Evidence: .sisyphus/evidence/f4-scope-check.txt

  Scenario: Must NOT do 위반 검사
    Tool: Bash
    Steps:
      1. git diff HEAD -- pages/album/musicians/\\[id\\].tsx | wc -l → 0이어야 함
      2. git diff HEAD -- src/components/shared/SEOHelmet.tsx | wc -l → 0이어야 함
      3. git diff HEAD -- public/sitemap.xml | wc -l → 0이어야 함
      4. git diff HEAD -- scripts/generateSitemap.js | wc -l → 0이어야 함
    Expected Result: 4개 모두 0
    Failure Indicators: 0이 아닌 값
    Evidence: .sisyphus/evidence/f4-must-not-violations.txt
  ```

  Output: `Scope [CLEAN/N issues] | Must NOT [4/4 clean] | VERDICT`

---

## Commit Strategy

- **Commit 1**: `feat(images): download and localize external musician images` — 18 downloads + 4 copies + 24 imageUrl updates in musicians.ts + musicians.json
- **Commit 2**: `feat(seo): add camp context to musician page SEO metadata` — pageContext prop + camp-specific title/description/keywords
- **Commit 3**: `feat(i18n): add 46 camp musicians to English musicians.json` — en/musicians.json 보강

---

## Success Criteria

### Verification Commands
```bash
# 1. 이미지 파일 존재 확인 (18 downloads + 4 copies = 22 new files)
ls -la public/images-webp/musicians/{17,20,25,27,30,31,32,33,34,36,39,42,44,45,48,50,52,54,55,56,58,59}.webp

# 2. 데이터 일관성 검증 (모든 캠프 뮤지션의 imageUrl이 로컬 경로)
node -e "const m=require('./public/data/musicians.json');const ids=[14,5,15,3,16,4,17,18,19,20,21,10,22,7,23,24,13,25,26,27,29,30,31,32,33,34,35,36,37,38,39,40,12,42,11,43,2,44,45,46,47,48,49,50,51,52,60,59,53,54,55,56,57,58];const ext=ids.filter(id=>{const x=m.find(e=>e.id===id);return x&&x.imageUrl.startsWith('http')});console.log(ext.length===0?'OK':'EXTERNAL:'+JSON.stringify(ext))"

# 3. 영문 데이터 검증
node -e "const d=JSON.parse(require('fs').readFileSync('public/data/en/musicians.json'));const ids=[14,5,15,3,16,4,17,18,19,20,21,10,22,7,23,24,13,25,26,27,29,30,31,32,33,34,35,36,37,38,39,40,12,42,11,43,2,44,45,46,47,48,49,50,51,52,60,59,53,54,55,56,57,58];const missing=ids.filter(id=>!d.find(m=>m.id===id));console.log(missing.length===0?'OK':'MISSING:'+missing)"

# 4. 빌드 성공
npm run build
```

### Final Checklist
- [ ] 54명 전원 로컬 이미지 사용
- [ ] 캠프 페이지 title에 캠프 맥락 포함
- [ ] 앨범 페이지 title에 캠프 맥락 미포함
- [ ] 영문 데이터 54명 완비
- [ ] 3파일 데이터 일관성
- [ ] 빌드 성공
