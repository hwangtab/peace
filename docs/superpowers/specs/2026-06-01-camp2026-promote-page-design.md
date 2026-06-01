# 제3회 강정 피스앤뮤직캠프 — 뮤지션용 SNS 홍보 안내 페이지

작성일: 2026-06-01

## 목적

2026 캠프 참가 뮤지션이 링크 하나를 받아서 → 준비된 홍보글을 복사하고 → 포스터·타임테이블 이미지를 내려받아 → 인스타그램·페이스북 등 SNS에 직접 올릴 수 있게 안내하는 페이지.

뮤지션에게 **링크로만 전달**하는 페이지이므로 사이트 전역 네비게이션 메뉴에는 넣지 않는다.

## 결정사항 (사용자 확정)

- **배포 형태**: 사이트에 새 페이지로 추가 (`/camps/2026/promote`)
- **언어**: 한국어 + 영어 (한 페이지에 두 언어 홍보글을 모두 노출, 뮤지션이 골라 복사)
- **홍보글 구성**: 여러 버전 세트 (피드용 긴 글 / 스토리·짧은 캡션 / 해시태그)
- **타임테이블 이미지 포함**: 포스터와 함께 내려받기 제공
  - 원본 `타임테이블.jpg`(960×1280)의 "TIME TIBLE" 오타는 사용자 요청에 따라 **그대로 둠**

## 파일 구성 (기존 2026 캠프 페이지 패턴과 동일)

- `pages/camps/2026/promote.tsx` — 얇은 라우트. `getStaticProps`에서 `serverSideTranslations(lang, ['translation', 'camp_promote_2026'])`
- `src/pages/CampPromote2026Page.tsx` — 페이지 컴포넌트
- `public/locales/ko/camp_promote_2026.json`, `public/locales/en/camp_promote_2026.json` — 홍보글 콘텐츠 (ko/en only, `camp_guidelines_2026`과 동일 전략)
- `public/images-webp/camps/2026/timetable-2026.webp` — 타임테이블 webp 변환본
- 신규 공용 컴포넌트:
  - `src/components/common/CopyButton.tsx` — 클립보드 복사 + "복사됨!" 일시 피드백, 접근성 라벨
  - `src/components/camp/promote/ShareImageCard.tsx` — 이미지 미리보기 + [이미지 저장] 다운로드 버튼
  - `src/components/camp/promote/PromoTextBlock.tsx` — 홍보글 한 버전(제목 + 본문 + CopyButton)
- `next-i18next.config.js` — `ns` / `fallbackNS` 배열 및 주석에 `camp_promote_2026` 추가

## 페이지 구조

1. **PageHero** — 배경: 26 포스터, 제목 "함께 알려주세요" / 영어 병기
2. **① 이렇게 올려주세요** — 3스텝 안내 (이미지 저장 → 글 복사 → 인스타·페북·스토리 업로드)
3. **② 포스터 & 타임테이블 내려받기** — `2026poster1`, `2026poster2`, `timetable-2026` 미리보기 + [이미지 저장]
4. **③ 복사용 홍보글 (한국어)** — 피드용 긴 글 / 스토리·짧은 캡션 / 해시태그, 각 CopyButton
5. **④ Copy & paste (English)** — Feed / Story / Hashtags, 각 CopyButton
6. **⑤ 핵심 정보 카드** — 일정·장소·웹사이트, 계정 태그 안내
7. **⑥ 감사 메시지 + 캠프 홈으로 돌아가기**

## 디자인

기존 디자인 토큰(`jeju-ocean`, `sky-horizon`, `ocean-sand`, `coastal-gray`, `deep-ocean`, `seafoam`)과 `PageLayout`/`PageHero`/`Section`/`Container` + framer-motion 패턴을 그대로 재사용해 사이트와 톤을 일치시킨다.

## 검증

- `npx tsc --noEmit` 타입 체크
- `next build` 통과 (raw i18n key 노출 없음 — ko/en 키 완전 작성)
- dev 서버에서 ko/en 페이지 렌더 + 복사/다운로드 동작 스크린샷 확인
