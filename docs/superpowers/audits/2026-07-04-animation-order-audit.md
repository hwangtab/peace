# 애니메이션 순서·리듬 감사 보고서

날짜: 2026-07-04 · 방식: 체계적 디버깅(Phase 1~2 근본원인 규명) → 공용 원자 설계(Fable) → 일괄 이식(Opus)

## 증상

"웹페이지 내 애니메이션이 나오는 순서가 뒤죽박죽이라 UX 경험 저해."

## 근본원인 (Phase 1~2: 증거 기반)

**사이트 전역에 공용 애니메이션 토큰이 없다.** framer-motion을 쓰는 43개 파일이 각자
`containerVariants`/`itemVariants`·`viewport` 마진·`delay: index * N`을 독립적으로
발명했고, 그 값이 문서화된 규칙 없이 파일마다 제각각이다.

정량 증거(grep 실측):

| 파라미터 | 관측된 값 범위 | 편차 |
|---|---|---|
| `staggerChildren` | 0.06 ~ 0.3 | 5배 |
| `index * N` 지연 배율 | 0.03 ~ 0.1 | 3.3배 |
| 아이템 `duration` | 0.15s ~ 0.8s | 5.3배 |
| `viewport.margin` | 없음, -40px ~ -100px | 무작위 |

가장 뚜렷한 사례: 캠프 상세 페이지에서 하나의 연속 내러티브로 이어지는
`GangjeongStorySection`이 5개 서브컴포넌트를 세로로 쌓는데, 그 각각이 서로 다른
리듬으로 등장한다.

| 서브컴포넌트 | staggerChildren | 아이템 duration |
|---|---|---|
| [HookStatement](../../../src/components/camp/gangjeong-story/HookStatement.tsx) | 0.15 | 0.6s |
| [ImpactNumbers](../../../src/components/camp/gangjeong-story/ImpactNumbers.tsx) | (카운트업 별도 메커니즘) | 0.5s + index*150ms |
| [GangjeongTimeline](../../../src/components/camp/gangjeong-story/GangjeongTimeline.tsx) | 0.08 | 0.4s |
| [EmotionalStory](../../../src/components/camp/gangjeong-story/EmotionalStory.tsx) | (단일 항목) | 0.7s |
| [GlobalSolidarity](../../../src/components/camp/gangjeong-story/GlobalSolidarity.tsx) | 0.3 | 0.7s |

하나의 이야기를 스크롤하는 동안 등장 박자가 두 배씩 빨라졌다 느려졌다 하는 것 —
이것이 "순서가 뒤죽박죽"으로 느껴지는 실체다. DOM 순서나 로직 버그가 아니라
**타이밍 설계의 부재**.

### 부차 발견: reduced-motion 처리 누락

`whileInView`를 쓰는 31개 파일 중 27개가 `useReducedMotion`을 전혀 확인하지
않는다 — 모션 감소 설정을 켠 방문자에게도 스크롤 reveal이 그대로 재생된다.

### 참고할 기존 좋은 예

[guidePrimitives.tsx](../../../src/components/camp/guide/guidePrimitives.tsx)가 이미
`containerVariants`/`itemVariants`를 export해 두 안내 페이지가 공유하고 있다 — 이
패턴을 전역으로 일반화하는 것이 자연스러운 해법이다.

## 수정 설계

`src/constants/motion.ts` + `src/hooks/useScrollReveal.ts` 신설. 두 개의 기존
오케스트레이션 스타일(A: 부모 `whileInView`+variants 전파로 일괄 stagger, B: 항목별
독립 `whileInView`+`index*delay`)은 그대로 유지하되, 매직넘버를 전부 공용 상수/훅으로
교체한다 — 구조를 바꾸지 않아 마이그레이션 리스크를 낮춘다.

- `SCROLL_VIEWPORT = { once: true, margin: '-80px' }` — 감사 중 가장 흔했던 값
- `STAGGER_INTERVAL = 0.08`, `REVEAL_DURATION = 0.5`, `REVEAL_DISTANCE = 16`, `REVEAL_EASE = 'easeOut'` — 관측된 최빈값 기준
- `useScrollReveal()` 훅이 `viewport`/`container`/`item`(패턴 A)과 `staggerDelay(index, cap)`/`itemTransition(index, cap)`(패턴 B)을 함께 제공하고, 내부에서 `useReducedMotion()`을 확인해 감소 모드면 duration 0·오프셋 제거 — **이식하는 것만으로 접근성 결함도 함께 해소**된다.

## 이식 대상 (43개 파일 중 스크롤 reveal 40개, mount 전용 3개는 제외)

Hero의 Ken Burns/LCP 콘텐츠, 탭 콘텐츠 마운트 애니메이션(AlbumTabContent 등)처럼
"순서" 문제와 무관한 마운트 즉시 재생 애니메이션은 대상에서 제외.

- **A조 (내러티브, 최우선 증거)**: gangjeong-story 5개
- **B조 (홈페이지)**: AboutSection, GallerySection, TracksSection
- **C조 (캠프/그리드·리스트)**: CampParticipants, CampStaff, CampLineup, CampGallery, CampCard, TimetableActCard, ConcertCard, PhotoTabPanel, VideoTabPanel, SolidarityEventFeature, MusicianCard, TrackCard, GuidelinesSummary, CampFinalCTA, EventFilter, SectionHeader
- **D조 (내러티브 단일열·안내 페이지, guidePrimitives 일반화)**: timeline/TimelineItem, timeline/subcomponents/TimelineMobileCard, CampGuidelines2026Page, CampMusicianGuide2026Page, CampPromote2026Page, CampStaff2026Page, Camp2026Page, CampDetailPage, PhotographerPage, album/AlbumAboutPage, gallery/PhotographerIntro, guidePrimitives.tsx(재수출로 통합)

## 검증 기준

typecheck·lint·jest 전부 통과, prettier 적용. 시각적 리듬 통일은 코드 리뷰(값 일치)로
확인 — 실 브라우저 애니메이션 타이밍 자동 검증은 스코프 밖.
