import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { timelineEvents } from '../../data/timeline';
import TimelineItem from './TimelineItem';

const Timeline: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2
      }
    }
  };

  return (
    <section className="section bg-sunlight-glow" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="typo-h2 mb-4">
            강정피스앤뮤직캠프 여정
          </h2>
          <p className="typo-subtitle max-w-2xl mx-auto">
            2023년 강정마을에서 시작된 평화를 위한 음악 프로젝트의 여정입니다
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative"
        >
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-jeju-ocean via-ocean-mist to-jeju-sky transform -translate-x-1/2 rounded-full" />

          {/* Timeline Events */}
          <div className="space-y-8">
            {timelineEvents.map((event, index) => (
              <TimelineItem
                key={event.id}
                event={event}
                isLeft={index % 2 === 0}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Timeline;
