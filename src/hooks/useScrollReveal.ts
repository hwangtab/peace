import { useReducedMotion } from 'framer-motion';
import {
  REVEAL_DISTANCE,
  REVEAL_DURATION,
  REVEAL_EASE,
  SCROLL_VIEWPORT,
  STAGGER_GROUP,
  STAGGER_INTERVAL,
} from '@/constants/motion';

/**
 * 스크롤 reveal의 두 오케스트레이션 스타일을 모두 지원한다:
 * - 부모 whileInView + variants 전파 일괄 stagger: `container`/`item`/`viewport` 사용
 * - 항목별 독립 whileInView + index 지연: `itemHidden`/`itemVisible`/`itemTransition` 사용
 *   (`initial={itemHidden} whileInView={itemVisible} transition={itemTransition(index)}`).
 *   시작 오프셋을 컴포넌트마다 직접 쓰지 않고 여기서 받아야 사이트 전체가 같은 거리에서
 *   같은 방향으로 등장한다.
 * 두 스타일 모두 내부에서 prefers-reduced-motion을 확인해 감소 모드면 오프셋·지연을
 * 제거하므로, 이 훅을 쓰는 것만으로 접근성 처리가 함께 해결된다.
 */
export const useScrollReveal = () => {
  const reduce = useReducedMotion();
  const duration = reduce ? 0 : REVEAL_DURATION;

  // 한 줄(STAGGER_GROUP) 안에서만 잔물결 — 누적하지 않아 뒤쪽 줄도 진입 즉시 나타난다.
  const staggerDelay = (index = 0) => (reduce ? 0 : (index % STAGGER_GROUP) * STAGGER_INTERVAL);

  const itemHidden = reduce ? { opacity: 1 } : { opacity: 0, y: REVEAL_DISTANCE };
  const itemVisible = { opacity: 1, y: 0 };

  return {
    reduce,
    viewport: SCROLL_VIEWPORT,
    container: {
      hidden: { opacity: reduce ? 1 : 0 },
      visible: {
        opacity: 1,
        transition: reduce ? {} : { staggerChildren: STAGGER_INTERVAL },
      },
    },
    item: {
      hidden: itemHidden,
      visible: {
        ...itemVisible,
        transition: { duration, ease: REVEAL_EASE },
      },
    },
    itemHidden,
    itemVisible,
    staggerDelay,
    itemTransition: (index = 0) => ({
      duration,
      delay: staggerDelay(index),
      ease: REVEAL_EASE,
    }),
  };
};
