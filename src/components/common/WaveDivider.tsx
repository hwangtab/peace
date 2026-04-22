import React from 'react';

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
