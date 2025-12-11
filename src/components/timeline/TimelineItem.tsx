import React from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent } from '../../data/timeline';

interface TimelineItemProps {
  event: TimelineEvent;
  isLeft: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, isLeft }) => {
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
      <h3 className="text-xl font-bold text-deep-ocean mb-2 font-serif">{event.title}</h3>
      <p className="text-coastal-gray mb-3 text-sm leading-relaxed">{event.description}</p>
      {event.location && (
        <p className="text-xs text-ocean-mist flex items-center font-medium">
          <span className="mr-1">📍</span> {event.location}
        </p>
      )}
    </div>
  );

  const YearLabel = ({ align }: { align: 'left' | 'right' }) => (
    <div className={`flex flex-col justify-center h-full ${align === 'right' ? 'items-end' : 'items-start'}`}>
      <span className="text-3xl font-bold text-jeju-ocean/80 font-serif">{event.year}</span>
      {event.month && (
        <span className="text-ocean-mist font-medium">{event.month}월</span>
      )}
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="flex items-stretch mb-16 w-full"
    >
      {/* Left Column (5/12) */}
      <div className="w-5/12 pr-8 flex justify-end">
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

      {/* Center Column (2/12) */}
      <div className="w-2/12 flex justify-center relative">
        <div className="w-1 bg-transparent h-full absolute left-1/2 -translate-x-1/2" /> {/* Spacer for line */}
        <motion.div
          whileInView={{ scale: 1.2 }}
          transition={{ duration: 0.4 }}
          className={`w-6 h-6 rounded-full bg-cloud-white border-4 ${eventTypeBorder[event.eventType]} shadow-md z-10 mt-6`}
        />
      </div>

      {/* Right Column (5/12) */}
      <div className="w-5/12 pl-8 flex justify-start">
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
    </motion.div>
  );
};

export default TimelineItem;
