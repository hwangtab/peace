import { useReducedMotion } from 'framer-motion';
import {
  REVEAL_DISTANCE,
  REVEAL_DURATION,
  REVEAL_EASE,
  SCROLL_VIEWPORT,
  STAGGER_DELAY_CAP,
  STAGGER_INTERVAL,
} from '@/constants/motion';

/**
 * 스크롤 reveal의 두 오케스트레이션 스타일을 모두 지원한다:
 * - 부모 whileInView + variants 전파 일괄 stagger: `container`/`item`/`viewport` 사용
 * - 항목별 독립 whileInView + index 지연: `staggerDelay`/`itemTransition` 사용
 * 두 스타일 모두 내부에서 prefers-reduced-motion을 확인해 감소 모드면 오프셋·지연을
 * 제거하므로, 이 훅을 쓰는 것만으로 접근성 처리가 함께 해결된다.
 */
export const useScrollReveal = () => {
  const reduce = useReducedMotion();
  const duration = reduce ? 0 : REVEAL_DURATION;

  const staggerDelay = (index = 0, cap = STAGGER_DELAY_CAP) =>
    reduce ? 0 : Math.min(index * STAGGER_INTERVAL, cap);

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
      hidden: reduce ? { opacity: 1 } : { opacity: 0, y: REVEAL_DISTANCE },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration, ease: REVEAL_EASE },
      },
    },
    staggerDelay,
    itemTransition: (index = 0, cap = STAGGER_DELAY_CAP) => ({
      duration,
      delay: staggerDelay(index, cap),
      ease: REVEAL_EASE,
    }),
  };
};
