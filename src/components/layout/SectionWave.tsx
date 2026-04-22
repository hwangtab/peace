import React from 'react';
import WaveDivider from '@/components/common/WaveDivider';

type WaveColor =
  | 'white'
  | 'ocean-sand'
  | 'sky-horizon'
  | 'sunlight-glow'
  | 'seafoam'
  | 'light-beige'
  | 'golden-sun'
  | 'jeju-ocean'
  | 'deep-ocean';

/**
 * Explicit Tailwind class map so the JIT compiler can pick these up
 * (dynamic `text-${color}` strings get tree-shaken out of the build).
 */
const COLOR_TO_TEXT: Record<WaveColor, string> = {
  'white': 'text-white',
  'ocean-sand': 'text-ocean-sand',
  'sky-horizon': 'text-sky-horizon',
  'sunlight-glow': 'text-sunlight-glow',
  'seafoam': 'text-seafoam',
  'light-beige': 'text-light-beige',
  'golden-sun': 'text-golden-sun',
  'jeju-ocean': 'text-jeju-ocean',
  'deep-ocean': 'text-deep-ocean',
};

interface Props {
  /** Background color of the section that the wave should "introduce" */
  color: WaveColor;
  /**
   * Direction the wave faces:
   * - `down` (default): wave points into the NEXT section, overlapping it.
   *   Use between `<Section A>` and `<Section B(color)>` — the wave carries
   *   B's color up into A's bottom.
   * - `up`: wave points into the PREVIOUS section, overlapping it.
   *   Use when the wave itself belongs to the new section that just began.
   */
  flow?: 'down' | 'up';
}

/**
 * Opinionated wrapper around `<WaveDivider>` that matches our most common
 * section-to-section transition. Handles the color/direction/overlap triple
 * as one named concept so 6 page files don't repeat the 3-prop combo.
 */
const SectionWave: React.FC<Props> = ({ color, flow = 'down' }) => {
  return (
    <WaveDivider
      className={COLOR_TO_TEXT[color]}
      direction={flow}
      overlap={flow === 'down' ? 'next' : 'prev'}
    />
  );
};

export default SectionWave;
