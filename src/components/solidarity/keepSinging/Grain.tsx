import React from 'react';

/**
 * 포스터의 필름 그레인을 재현하는 오버레이.
 *
 * feTurbulence 를 인라인 SVG 로 한 번만 렌더하고 fixed 로 화면 전체를 덮는다.
 * pointer-events:none 이라 클릭/스크롤을 막지 않으며, 장식이므로 aria-hidden.
 *
 * mix-blend-mode 는 쓰지 않는다 — fixed + blend 조합은 스크롤하는 동안 브라우저가
 * 매 프레임 전체 뷰포트를 다시 블렌딩해 모바일에서 스크롤이 끊긴다. 단순 반투명
 * 오버레이로도 질감은 충분히 남는다.
 */
const Grain: React.FC = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
    style={{ opacity: 0.06 }}
  >
    <filter id="ksfp-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#ksfp-grain)" />
  </svg>
);

export default Grain;
