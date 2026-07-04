import React from 'react';
import { m as motion } from 'framer-motion';
import { TimelineEvent } from '@/data/timeline';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { REVEAL_DURATION, REVEAL_EASE } from '@/constants/motion';

import TimelineCardContent from './subcomponents/TimelineCardContent';
import TimelineMobileCard from './subcomponents/TimelineMobileCard';
import TimelineYearLabel from './subcomponents/TimelineYearLabel';

interface TimelineItemProps {
  event: TimelineEvent;
  isLeft: boolean;
}

// Move static objects outside component to prevent recreation
const eventTypeColor = {
  camp: 'bg-jeju-ocean',
  album: 'bg-golden-sun',
  milestone: 'bg-sunset-coral',
};

const eventTypeBorder = {
  camp: 'border-jeju-ocean',
  album: 'border-golden-sun',
  milestone: 'border-sunset-coral',
};

// Memoized component to prevent unnecessary re-renders
const TimelineItem = React.memo<TimelineItemProps>(({ event, isLeft }) => {
  const { viewport, reduce } = useScrollReveal();

  // 타이밍/viewport 는 훅·모션 상수로 통일하되, 타임라인 카드의 의도적인 좌우
  // 대칭 x축 슬라이드(isLeft 방향성)와 컨테이너 y축 오프셋은 유지한다.
  // prefers-reduced-motion 이면 x/y 오프셋과 지연을 제거한다(감사 접근성 결함 보완).
  const containerVariants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: REVEAL_DURATION, ease: REVEAL_EASE },
    },
  };

  const mobileContentVariants = {
    hidden: { opacity: 0, x: reduce ? 0 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: REVEAL_DURATION, ease: REVEAL_EASE, delay: reduce ? 0 : 0.2 },
    },
  };

  // Content variants depend on isLeft, so keep them inside
  const contentVariants = {
    hidden: { opacity: 0, x: reduce ? 0 : isLeft ? -20 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: REVEAL_DURATION, ease: REVEAL_EASE, delay: reduce ? 0 : 0.2 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      className="flex items-stretch mb-8 md:mb-16 w-full"
    >
      {/* Left Column (5/12) - Hidden on mobile */}
      <div className="hidden md:flex md:w-5/12 md:pe-8 md:justify-end">
        {isLeft ? (
          <motion.div variants={contentVariants} className="w-full text-end">
            <TimelineCardContent event={event} eventTypeColor={eventTypeColor} />
          </motion.div>
        ) : (
          <div className="w-full">
            <TimelineYearLabel event={event} align="right" />
          </div>
        )}
      </div>

      {/* Center Column (2/12 on desktop, hidden on mobile) */}
      <div className="hidden md:flex md:w-2/12 md:justify-center relative">
        <div className="w-1 bg-transparent h-full absolute left-1/2 -translate-x-1/2" />{' '}
        {/* Spacer for line */}
        <motion.div
          whileInView={{ scale: 1.2 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className={`w-6 h-6 rounded-full bg-cloud-white border-4 ${eventTypeBorder[event.eventType]} shadow-md z-10 mt-6`}
        />
      </div>

      {/* Right Column (5/12 on desktop, full width on mobile) */}
      <div className="w-full md:w-5/12 md:ps-8 flex justify-start">
        {/* Mobile view: Always show full card with year inside */}
        <div className="block md:hidden w-full">
          <TimelineMobileCard
            event={event}
            eventTypeColor={eventTypeColor}
            mobileContentVariants={mobileContentVariants}
          />
        </div>

        {/* Desktop view: Show conditional layout (left/right content) */}
        <div className="hidden md:block w-full">
          {!isLeft ? (
            <motion.div variants={contentVariants} className="w-full text-start">
              <TimelineCardContent event={event} eventTypeColor={eventTypeColor} />
            </motion.div>
          ) : (
            <div className="w-full">
              <TimelineYearLabel event={event} align="left" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

TimelineItem.displayName = 'TimelineItem';

export default TimelineItem;
