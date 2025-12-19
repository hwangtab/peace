import React from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent } from '../../data/timeline';

interface TimelineItemProps {
  event: TimelineEvent;
  isLeft: boolean;
}

// Move static objects outside component to prevent recreation
const eventTypeColor = {
  camp: 'bg-jeju-ocean',
  album: 'bg-golden-sun',
  milestone: 'bg-sunset-coral'
};

const eventTypeBorder = {
  camp: 'border-jeju-ocean',
  album: 'border-golden-sun',
  milestone: 'border-sunset-coral'
};

const eventTypeLabel = {
  camp: '캠프',
  album: '앨범',
  milestone: '마일스톤'
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const mobileContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: 0.2 }
  }
};

// Memoized component to prevent unnecessary re-renders
const TimelineItem = React.memo<TimelineItemProps>(({ event, isLeft }) => {
  // Content variants depend on isLeft, so keep them inside
  const contentVariants = {
    hidden: { opacity: 0, x: isLeft ? -20 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, delay: 0.2 }
    }
  };

  const CardContent = () => (
    <div className="bg-cloud-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-ocean-mist/20">
      <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold ${eventTypeColor[event.eventType]} mb-3 shadow-sm`}>
        {eventTypeLabel[event.eventType]}
      </span>
      <h3 className="typo-h3 text-jeju-ocean mb-2">{event.title}</h3>
      <p className="typo-body text-coastal-gray mb-3 text-sm text-pretty">{event.description}</p>
      {event.location && (
        <p className="text-xs text-ocean-mist flex items-center font-medium">
          <span className="mr-1">📍</span> {event.location}
        </p>
      )}
    </div>
  );

  const YearLabel = ({ align }: { align: 'left' | 'right' }) => (
    <div className={`flex flex-col justify-center h-full ${align === 'right' ? 'items-end' : 'items-start'}`}>
      <span className="text-3xl font-bold text-jeju-ocean/80 font-display">{event.year}</span>
      {event.month && (
        <span className="text-ocean-mist font-medium">{event.month}월</span>
      )}
    </div>
  );

  const MobileCard = () => (
    <motion.div
      variants={mobileContentVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="bg-cloud-white rounded-xl p-4 shadow-sm border border-ocean-mist/20 w-full"
    >
      {/* 연도 레이블 - 모바일에서 카드 안에 */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-jeju-ocean/80 font-display">
          {event.year}
        </span>
        {event.month && (
          <span className="text-sm text-ocean-mist font-medium">
            {event.month}월
          </span>
        )}
      </div>

      {/* 이벤트 타입 뱃지 */}
      <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold ${eventTypeColor[event.eventType]} mb-3 shadow-sm`}>
        {eventTypeLabel[event.eventType]}
      </span>

      {/* 제목 */}
      <h3 className="text-lg font-medium text-jeju-ocean mb-2 font-display">
        {event.title}
      </h3>

      {/* 설명 */}
      <p className="text-sm text-coastal-gray mb-3 leading-relaxed text-pretty">
        {event.description}
      </p>

      {/* 위치 */}
      {event.location && (
        <p className="text-xs text-ocean-mist flex items-center font-medium">
          <span className="mr-1">📍</span> {event.location}
        </p>
      )}
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="flex items-stretch mb-8 md:mb-16 w-full"
    >
      {/* Left Column (5/12) - Hidden on mobile */}
      <div className="hidden md:flex md:w-5/12 md:pr-8 md:justify-end">
        {isLeft ? (
          <motion.div variants={contentVariants} className="w-full text-right">
            <CardContent />
          </motion.div>
        ) : (
          <div className="w-full">
            <YearLabel align="right" />
          </div>
        )}
      </div>

      {/* Center Column (2/12 on desktop, hidden on mobile) */}
      <div className="hidden md:flex md:w-2/12 md:justify-center relative">
        <div className="w-1 bg-transparent h-full absolute left-1/2 -translate-x-1/2" /> {/* Spacer for line */}
        <motion.div
          whileInView={{ scale: 1.2 }}
          transition={{ duration: 0.4 }}
          className={`w-6 h-6 rounded-full bg-cloud-white border-4 ${eventTypeBorder[event.eventType]} shadow-md z-10 mt-6`}
        />
      </div>

      {/* Right Column (5/12 on desktop, full width on mobile) */}
      <div className="w-full md:w-5/12 md:pl-8 flex justify-start">
        {/* Mobile view: Always show full card with year inside */}
        <div className="block md:hidden w-full">
          <MobileCard />
        </div>

        {/* Desktop view: Show conditional layout (left/right content) */}
        <div className="hidden md:block w-full">
          {!isLeft ? (
            <motion.div variants={contentVariants} className="w-full text-left">
              <CardContent />
            </motion.div>
          ) : (
            <div className="w-full">
              <YearLabel align="left" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default TimelineItem;
