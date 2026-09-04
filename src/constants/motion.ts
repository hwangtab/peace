/**
 * 스크롤 reveal 애니메이션 공용 타이밍 — 사이트 전역이 하나의 리듬을 공유하게 한다.
 * 개별 컴포넌트가 각자 stagger/duration/viewport 값을 발명하면 인접 섹션·같은 내러티브
 * 안에서 등장 박자가 제각각으로 느껴진다(2026-07 애니메이션 감사 — docs/superpowers/audits
 * /2026-07-04-animation-order-audit.md). 새 스크롤 reveal은 이 상수 또는
 * useScrollReveal 훅을 통해서만 값을 가져온다.
 */
/**
 * 진입 판정은 뷰포트 경계 그대로(margin 0). 기존 '-80px' 는 요소가 화면 안으로 80px
 * 들어와야 등장을 시작해, 스크롤이 빠를수록 빈 상태가 길어졌다. 반대로 양수 마진으로
 * 미리 트리거하면 느린 읽기 속도에서 등장이 화면 밖에서 끝나 애니메이션이 아예 안 보인다
 * (2026-09 실측: +350px 에서 느린 스크롤 100% 가 화면 밖 완료). 마진 0 이면 "요소가
 * 보이기 시작한 순간부터 REVEAL_DURATION 동안만 흐리다" 가 스크롤 속도와 무관하게 성립한다.
 */
export const SCROLL_VIEWPORT = { once: true, margin: '0px' } as const;
export const STAGGER_INTERVAL = 0.08;
// 0.5s 는 진입 후 빈 시간을 그만큼 늘린다(실측 빈 시간 중앙값 584ms). 0.35s 로 줄여도
// 페이드는 충분히 인지되고, 빈 구간은 속도와 무관하게 이 값 안으로 묶인다.
export const REVEAL_DURATION = 0.35;
export const REVEAL_DISTANCE = 16;
export const REVEAL_EASE = 'easeOut' as const;
/**
 * 항목별 whileInView(패턴 B)의 index 지연은 이 크기 안에서만 잔물결을 주고 다시 0 부터
 * 센다(index % STAGGER_GROUP). 누적 지연(index * 간격, 상한 0.4s)은 각 항목이 "자기"
 * 진입 시점부터 지연을 세기 때문에 뒤쪽 줄일수록 진입 후 늦게 나타나 스크롤 순서와
 * 등장 순서가 어긋났다(2026-09 실측: 등장 지연 상위 25% 가 전부 상한 0.4s). 가장 흔한
 * 그리드가 3열이라 3 — 다른 열 수에서도 최대 지연 0.16s 로 체감 차이가 없다.
 */
export const STAGGER_GROUP = 3;
