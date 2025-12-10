import React from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent } from '../../data/timeline';

interface TimelineItemProps {
  event: TimelineEvent;
  isLeft: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, isLeft }) => {
  const eventTypeColor = {
    camp: 'bg-deep-sage',
    album: 'bg-blue-600',
    milestone: 'bg-purple-600'
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="flex items-center mb-16"
    >
      {/* Left Content */}
      {isLeft && (
        <motion.div variants={contentVariants} className="w-5/12 text-right pr-8">
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${eventTypeColor[event.eventType]} mb-3`}>
              {eventTypeLabel[event.eventType]}
            </span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-2">{event.description}</p>
            {event.location && (
              <p className="text-sm text-gray-500">📍 {event.location}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Center Timeline Dot and Line */}
      <div className="w-2/12 flex justify-center">
        <div className="relative flex flex-col items-center">
          <motion.div
            whileInView={{ scale: 1.2 }}
            transition={{ duration: 0.4 }}
            className={`w-6 h-6 rounded-full ${eventTypeColor[event.eventType]} border-4 border-white shadow-md z-10`}
          />
        </div>
      </div>

      {/* Right Content */}
      {!isLeft && (
        <motion.div variants={contentVariants} className="w-5/12 pl-8">
          <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-bold text-deep-sage">{event.year}</span>
              {event.month && (
                <span className="text-gray-500">/ {event.month}월</span>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-2">{event.description}</p>
            {event.location && (
              <p className="text-sm text-gray-500">📍 {event.location}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Left Year Label */}
      {isLeft && (
        <div className="w-5/12 flex justify-end pr-8">
          <span className="text-2xl font-bold text-deep-sage">{event.year}</span>
        </div>
      )}
    </motion.div>
  );
};

export default TimelineItem;
