import React, { ReactNode } from 'react';
import classNames from 'classnames';

/**
 * Semantic width tiers — pick by content type:
 *
 * - `prose`   max-w-3xl  (768px)  — long-form text, guidelines, solidarity body
 * - `content` max-w-5xl  (1024px) — general sections, card lists  [default]
 * - `wide`    max-w-7xl  (1280px) — galleries, grids, full-width sections
 */
export type ContainerSize = 'prose' | 'content' | 'wide';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: ContainerSize;
}

const SIZE_CLASSES: Record<ContainerSize, string> = {
  prose: 'max-w-3xl',
  content: 'max-w-5xl',
  wide: 'max-w-7xl',
};

/**
 * Container — single source of truth for horizontal layout.
 * Always use this instead of raw `container mx-auto px-*` divs.
 * Compose with <Section> for vertical rhythm.
 */
const Container: React.FC<ContainerProps> = ({ children, className, size = 'content' }) => {
  return (
    <div
      className={classNames('mx-auto w-full px-4 sm:px-6 lg:px-8', SIZE_CLASSES[size], className)}
    >
      {children}
    </div>
  );
};

export default Container;
