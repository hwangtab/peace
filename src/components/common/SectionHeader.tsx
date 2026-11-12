import React from 'react';
import { m as motion } from 'framer-motion';
import classNames from 'classnames';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface SectionHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  description?: React.ReactNode; // Alternative name for subtitle if needed
  align?: 'center' | 'left';
  className?: string;
  titleTag?: 'h1' | 'h2';
  useDivider?: boolean;
  /**
   * false 면 자체 스크롤 reveal 을 끈다. 이미 whileInView 로 감싼 부모(예: 섹션
   * 컨테이너 variants) 안에 들어갈 때 켜두면 opacity 가 두 번 곱해져 헤더만
   * 늦게/느리게 나타난다. 그런 자리에서는 false 로 넘긴다.
   */
  reveal?: boolean;
}

/**
 * SectionHeader Component
 *
 * Standardized header for all sections of the website.
 * Provides consistent typography, spacing, and dividers.
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  description,
  align = 'center',
  className: classNameProp,
  titleTag = 'h2',
  useDivider = true,
  reveal = true,
}) => {
  const displaySubtitle = subtitle || description;
  const TitleTag = titleTag;
  const { viewport, itemHidden, itemVisible, itemTransition } = useScrollReveal();

  const className = classNames(
    'mb-12 md:mb-16',
    {
      'text-center': align === 'center',
      'text-start': align === 'left',
    },
    classNameProp
  );

  const content = (
    <>
      <TitleTag
        className={classNames(titleTag === 'h1' ? 'typo-h1' : 'typo-h2', 'mb-4 text-deep-ocean')}
      >
        {title}
      </TitleTag>

      {displaySubtitle && (
        <p className="typo-subtitle mb-6 text-coastal-gray max-w-2xl mx-auto">{displaySubtitle}</p>
      )}

      {useDivider && (
        <div
          className={classNames(
            'w-24 h-1.5 rounded-full',
            'bg-gradient-to-r from-jeju-ocean via-ocean-mist to-golden-sun',
            {
              'mx-auto': align === 'center',
              'me-auto': align === 'left',
            }
          )}
        />
      )}
    </>
  );

  if (!reveal) {
    return <div className={className}>{content}</div>;
  }

  return (
    <motion.div
      initial={itemHidden}
      whileInView={itemVisible}
      viewport={viewport}
      transition={itemTransition()}
      className={className}
    >
      {content}
    </motion.div>
  );
};

export default SectionHeader;
