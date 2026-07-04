# 상호작용 후 고착 상태(stuck state) UI 버그 감사 보고서

날짜: 2026-07-04 · 계기: 헤더 로고 클릭 시 히어로 배경이 그라디언트로 고착되는 버그 신고
방식: 5차원 발견(Sonnet, 코드+실 브라우저) → 발견별 2렌즈 적대 검증 → 근본원인 종합(Fable)
규모: 에이전트 29개, 도구 호출 396회 · 발견 11건(9 CONFIRMED, 2 PLAUSIBLE) → 근본원인 4개

## 배경

헤더 로고를 눌러 홈으로 돌아왔을 때 히어로 배경 사진이 뜨지 않고 그라디언트만 남은 채 색이
돌아오지 않는다는 신고가 있었다. 근본원인은 `HeroSection`의 `onError`가 실패 플래그를 한 번
`true`로 세팅하면 **재시도·리셋 경로가 전혀 없어 일시적 네트워크 실패가 세션 내내 영구
고착**되는 구조였다(수정: [181a06a3](../../../src/components/home/HeroSection.tsx)).

이 버그가 "자잘한 UI 버그" 부류의 대표 사례라는 판단 하에, **같은 클래스(상호작용 이후 상태가
정상으로 돌아오지 못함)**로 범위를 좁혀 전수 감사했다. 직전의 정적 런타임 감사(210페이지
크롤)는 페이지 로드 시점만 봤기 때문에 이런 "인터랙션 이후" 버그는 애초에 잡을 수 없는
영역이었다.

## 근본원인 4개

### R11. 관리자 액션의 실패 경로에 플래그 리셋이 없음 (HIGH)

Hero와 완전히 동일한 패턴이 관리자 화면 전역에 반복돼 있다: `setFlag(true) → await fetch →
setFlag(false)`를 **try/catch/finally 없이** 순차 코드로만 작성해, 네트워크 단절이나 서버의
비-JSON 응답(타임아웃 시 HTML 에러 페이지 등)으로 예외가 나면 리셋 문장 자체가 실행되지 않는다.

| 파일 | 함수 | 영향 |
|---|---|---|
| [AdminCollectionPage.tsx:440](../../../src/components/admin/AdminCollectionPage.tsx#L440) | save() | 저장 버튼 영구 "저장 중" |
| [AdminCollectionPage.tsx:485](../../../src/components/admin/AdminCollectionPage.tsx#L485) | hideSelected() | 내리기 버튼 영구 고착 |
| AdminCollectionPage.tsx (506, 560) | cloneSelectedToLocale/cloneMissingLocales | 복제 버튼 영구 고착 |
| [AdminCollectionPage.tsx:308](../../../src/components/admin/AdminCollectionPage.tsx#L308) | loadMore()/loadAll() | 목록 더보기 영구 고착 |
| [whitepaper.tsx:95](../../../pages/admin/whitepaper.tsx#L95) | save() | 저장·취소 버튼 동시 영구 비활성 — 편집 화면에 갇힘 |
| [ContactsPanel.tsx:48](../../../src/components/admin/mailbox/ContactsPanel.tsx#L48) | addContact()/importCsv() | 추가/일괄추가 버튼 영구 고착 |

새로고침 외 복구 경로가 없고, 새로고침 시 미저장 편집 내용도 함께 사라진다. 같은 파일 안에
이미 안전한 경로(예: AdminCollectionPage의 `setIsLoadingLocaleStatuses` 관련 effect,
ContactsPanel의 `load()`)와 안전하지 않은 경로가 섞여 있어 — 방어 패턴이 **파일 단위가 아니라
함수 단위로 누락**된 것으로 확인됐다.

- **근본 수정**: 위 함수 전부를 `try { ... } finally { setFlag(false) }`로 감싼다. 성공 시의
  명시적 `setFlag(false)` 호출은 finally로 대체하거나 중복 유지해도 무방.

### R12. GalleryImageItem — 이미지 로드 실패 영구 고착 (MEDIUM)

Hero와 동일한 결함이 이번 세션의 이전 감사(R6)에서 onError 처리를 새로 넣을 때 재시도 없이
도입됐다. [GalleryImageItem.tsx:90](../../../src/components/gallery/GalleryImageItem.tsx#L90) —
`onError={() => setHasError(true)}`가 유일한 세팅 지점이고 되돌리는 코드가 없다. CDN 일시
오류로 한 번 실패하면 그 타일은 세션 내내 깨진 아이콘 + 클릭/키보드 상호작용 비활성 상태로
남는다(3개 차원에서 독립적으로 중복 발견될 만큼 뚜렷함).

- **근본 수정**: HeroSection에 적용한 것과 동일한 바운디드 재시도 패턴(`key` 기반 remount, 짧은
  지연 후 최대 N회 재시도) 이식.

### R13. 오디오 재생 실패가 재생 상태에 반영되지 않음 (HIGH)

[useAudioPlayer.ts:94](../../../src/hooks/useAudioPlayer.ts#L94) — 정상 종료(`onend`, 79-86행)
에서는 `onEndedRef.current?.()`를 호출해 부모(TracksSection)의 `playingTrackId`를 리셋하지만,
`onloaderror`/`onplayerror`(네트워크 실패, CORS, 자동재생 정책 거부 등)에서는 이 호출이 빠져
있다. 결과: 오디오가 실제로는 재생되지 않는데 재생 아이콘은 "일시정지(❚❚)"로 고정되고, hook이
반환하는 `error`도 `AudioPlayer.tsx`가 소비하지 않아 사용자는 아무 피드백 없이 무음 상태로
방치된다.

- **근본 수정**: `onloaderror`/`onplayerror` 콜백에도 `onEndedRef.current?.()` 호출을 추가해
  "재생 실패 = 사실상 종료"로 부모 상태에 전파. `AudioPlayer.tsx`가 `error`를 받아 최소한의
  실패 안내를 표시.

### R14. 뷰포트 리사이즈 시 열린 메뉴/드롭다운이 저절로 재등장 (MEDIUM)

[useNavigation.ts:23](../../../src/hooks/useNavigation.ts#L23) — 메뉴/드롭다운 열림 상태는
`router.events`의 `routeChangeComplete`에서만 초기화된다. `DesktopMenu`/`MobileMenu`는 각각
`hidden nav:flex`/`nav:hidden` CSS로만 화면에서 숨겨질 뿐 **언마운트되지 않으므로**, 데스크톱
드롭다운을 연 채로 창을 모바일 폭으로 좁혔다가 다시 넓히면(또는 그 반대) 아무 조작 없이 열린
상태가 재등장한다. 실제로 두 방향 모두 Playwright로 재현됨.

- **근본 수정**: 뷰포트가 nav 브레이크포인트(1280px)를 넘나들 때 모든 열림 상태를 초기화하는
  리스너(`matchMedia` 또는 `useIsMobile`류) 추가.

## 커버리지 공백

- 관리자 라우트는 로그인 세션이 필요해 실제 네트워크 차단까지는 재현하지 못하고 코드 분석
  기반으로 판정(fetch/JSON 파싱의 표준 reject 동작은 확정적이라 신뢰도 높음).
- iOS Safari 고유의 `:hover` 잔류 현상은 Playwright(Chromium 기반)로 재현 불가 — 단, 코드
  검토 결과 hover 전용 요소가 전부 카드 전체가 항상 클릭 가능한 장식적 오버레이라 실질 영향은
  낮다고 판단.
- headlessui 기반 모달(ImageLightbox, MusicianModal)의 body scroll lock은 실측 검증 결과
  정상 — 별도 결함 없음.
- 오디오 실제 로드/재생 실패(네트워크 차단·자동재생 정책)는 코드 분석만으로 판정, 실기기 재현
  없음.
