import React, { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { m as motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** 같은 줄 안에서의 지연 인덱스(STAGGER_GROUP 단위로 순환). */
  index?: number;
  /**
   * 뷰포트 높이 대비 이 배율을 넘는 요소는 등장 애니메이션을 건너뛰고 즉시 렌더한다.
   * opacity 애니메이션은 요소 전체를 하나의 컴포지트 레이어로 승격시키므로,
   * 뷰포트보다 훨씬 큰 컨테이너(문서 본문·펼친 카드 등)에 걸면 스크롤 중
   * 큰 레이어 생성으로 수백 ms 정지가 생긴다. 기본 1.5배.
   */
  maxViewportRatio?: number;
}

/**
 * 스크롤 등장 애니메이션 공용 래퍼.
 *
 * `useScrollReveal` 을 그대로 쓰되, 마운트 시 실제 높이를 재서 너무 큰 요소는
 * 애니메이션 없이 렌더한다. 새 섹션에 reveal 을 붙일 때 무심코 문서 전체를
 * 감싸는 회귀를 막는 것이 목적이므로, 큰 컨테이너에는 이 컴포넌트를 쓴다.
 */
const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className,
  index = 0,
  maxViewportRatio = 1.5,
}) => {
  const { viewport, itemHidden, itemVisible, itemTransition } = useScrollReveal();
  const ref = useRef<HTMLDivElement>(null);
  const [skip, setSkip] = useState(false);

  useLayoutEffect(() => {
    if (skip) return;
    const el = ref.current;
    if (!el) return;
    const height = el.getBoundingClientRect().height;
    const limit = window.innerHeight * maxViewportRatio;
    if (height > limit) {
      setSkip(true);
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[ScrollReveal] 등장 애니메이션을 건너뜁니다 — 요소 높이 ${Math.round(height)}px 가 ` +
            `뷰포트×${maxViewportRatio}(${Math.round(limit)}px)를 넘습니다. ` +
            `큰 컨테이너는 작은 블록으로 나누거나 이 컴포넌트를 쓰세요. ` +
            `[${typeof window !== 'undefined' ? window.location.pathname : ''}]`
        );
      }
    }
  }, [maxViewportRatio, skip]);

  if (skip) {
    return (
      <div ref={ref} className={className} data-scroll-reveal="static">
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} data-scroll-reveal="animated">
      <motion.div
        initial={itemHidden}
        whileInView={itemVisible}
        viewport={viewport}
        transition={itemTransition(index)}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ScrollReveal;
