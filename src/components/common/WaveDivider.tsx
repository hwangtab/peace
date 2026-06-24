import React, { useEffect, useRef } from 'react';

interface WaveDividerProps {
  className?: string;
  direction?: 'up' | 'down';
  /**
   * Overlap the previous ("prev") or next ("next") section by applying a
   * responsive negative margin. Use this when a `Section` sits directly
   * before/after the divider — it removes the seam and creates the
   * "water flows into next section" feel.
   *
   * - `prev`  → pulls up into the previous section
   * - `next`  → pulls down into the next section
   * - `both`  → pulls into both (rare)
   * - `none`  → no overlap (default)
   */
  overlap?: 'prev' | 'next' | 'both' | 'none';
}

/**
 * WaveDivider Component
 *
 * Creates a wave-shaped SVG divider to be placed between sections.
 * Use text-color utility classes to set the color of the wave (e.g., text-sky-horizon).
 */
const WaveDivider: React.FC<WaveDividerProps> = ({
  className = '',
  direction = 'up',
  overlap = 'none',
}) => {
  const rootRef = useRef<HTMLDivElement>(null);

  // 개발 가드: overlap 으로 잠식하는 인접 섹션의 실제 콘텐츠와 물결 박스 간격을
  // 측정해, 너무 가까우면(콘텐츠가 물결에 묻힘) 콘솔 경고한다. 실제 렌더 위치를
  // 재므로 중앙정렬 hero(콘텐츠가 가장자리에 없음)는 자동으로 안전 판정 → 오탐 없음.
  // 재발 방지: 물결 직전/직후 섹션의 padding 이 부족해지는 회귀를 개발 중 즉시 잡는다.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (overlap === 'none') return;
    const el = rootRef.current;
    if (!el) return;

    let raf = 0;
    const run = () => {
      const isFloating = (n: Element) => {
        const p = getComputedStyle(n).position;
        return p === 'absolute' || p === 'fixed';
      };
      // 인접 섹션 안에서 실제로 보이는 텍스트/이미지 leaf 의 가장 바깥 가장자리.
      // 떠 있는(배경) 요소는 제외해 배경 이미지를 콘텐츠로 오인하지 않는다.
      const contentEdge = (node: Element, side: 'bottom' | 'top'): number | null => {
        let best = side === 'bottom' ? -Infinity : Infinity;
        node.querySelectorAll('p,h1,h2,h3,h4,span,a,img,button,li').forEach((c) => {
          for (let f: Element | null = c; f && f !== node; f = f.parentElement) {
            if (isFloating(f)) return;
          }
          const r = c.getBoundingClientRect();
          if (!r.width || !r.height) return;
          const hasText = (c.textContent || '').trim().length > 0;
          if (c.tagName !== 'IMG' && (c.children.length > 0 || !hasText)) return;
          best = side === 'bottom' ? Math.max(best, r.bottom) : Math.min(best, r.top);
        });
        return Number.isFinite(best) ? best : null;
      };

      const r = el.getBoundingClientRect();
      const checks: Array<{ neighbor: Element | null; side: 'bottom' | 'top' }> = [];
      if (overlap === 'prev' || overlap === 'both')
        checks.push({ neighbor: el.previousElementSibling, side: 'bottom' });
      if (overlap === 'next' || overlap === 'both')
        checks.push({ neighbor: el.nextElementSibling, side: 'top' });

      // loose(128px) − overlap(데스크탑 100px) = 28px 가 정상 하한. 그보다 약간
      // 낮은 20px 미만을 회귀로 본다(정상 케이스 오탐 없이 normal/tight 만 잡힘).
      const MIN_GAP = 20;
      for (const { neighbor, side } of checks) {
        if (!neighbor) continue;
        const edge = contentEdge(neighbor, side);
        if (edge == null) continue;
        const gap = side === 'bottom' ? r.top - edge : edge - r.bottom;
        if (gap < MIN_GAP) {
          const path = typeof window !== 'undefined' ? window.location.pathname : '';
          const padSide = side === 'bottom' ? 'paddingBottom' : 'paddingTop';
          const which = side === 'bottom' ? '직전' : '직후';
          console.warn(
            `[WaveDivider] 물결이 ${which} 섹션 콘텐츠와 ${Math.round(gap)}px` +
              `(권장 ≥${MIN_GAP}px)밖에 안 떨어져 콘텐츠가 물결에 묻힐 수 있습니다. ` +
              `잠식되는 섹션의 ${padSide} 를 loose 로 올리세요. [${path}]`
          );
        }
      }
    };

    // 폰트·레이아웃 안정 후 측정(폰트 로드 전 높이 차이로 인한 오탐 방지).
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const schedule = () => {
      raf = requestAnimationFrame(run);
    };
    if (fonts?.ready) {
      fonts.ready.then(schedule);
    } else {
      schedule();
    }
    return () => cancelAnimationFrame(raf);
  }, [overlap, direction]);

  const overlapClass =
    overlap === 'prev'
      ? '-mt-[60px] sm:-mt-[100px] relative z-10'
      : overlap === 'next'
        ? '-mb-[60px] sm:-mb-[100px] relative z-10'
        : overlap === 'both'
          ? '-mt-[60px] -mb-[60px] sm:-mt-[100px] sm:-mb-[100px] relative z-10'
          : '';

  // SVG sub-pixel seam guard. Skip the side that `overlap` already controls
  // via negative margin so we never silently overwrite the overlap value.
  const seamStyle: React.CSSProperties = {};
  if (direction === 'up' && overlap !== 'next' && overlap !== 'both') {
    seamStyle.marginBottom = '-1px';
  }
  if (direction === 'down' && overlap !== 'prev' && overlap !== 'both') {
    seamStyle.marginTop = '-1px';
  }

  return (
    <div
      ref={rootRef}
      className={`w-full leading-none overflow-hidden pointer-events-none text-[0px] ${overlapClass} ${className}`}
      style={seamStyle}
    >
      <svg
        aria-hidden="true"
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-full h-[60px] sm:h-[100px]"
        style={direction === 'down' ? { transform: 'rotate(180deg)' } : undefined}
      >
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
          className="fill-current"
          style={{ transformOrigin: 'center', transform: 'scaleY(-1)' }}
        />
      </svg>
    </div>
  );
};

export default WaveDivider;
