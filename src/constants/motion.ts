/**
 * 스크롤 reveal 애니메이션 공용 타이밍 — 사이트 전역이 하나의 리듬을 공유하게 한다.
 * 개별 컴포넌트가 각자 stagger/duration/viewport 값을 발명하면 인접 섹션·같은 내러티브
 * 안에서 등장 박자가 제각각으로 느껴진다(2026-07 애니메이션 감사 — docs/superpowers/audits
 * /2026-07-04-animation-order-audit.md). 새 스크롤 reveal은 이 상수 또는
 * useScrollReveal 훅을 통해서만 값을 가져온다.
 */
export const SCROLL_VIEWPORT = { once: true, margin: '-80px' } as const;
export const STAGGER_INTERVAL = 0.08;
export const REVEAL_DURATION = 0.5;
export const REVEAL_DISTANCE = 16;
export const REVEAL_EASE = 'easeOut' as const;
export const STAGGER_DELAY_CAP = 0.4;
