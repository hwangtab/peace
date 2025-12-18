import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import TimelineItem from './TimelineItem';
import { timelineEvents as timelineData } from '../../data/timeline';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';

const Timeline = () => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.1,
  });

  return (
    <Section id="history" background="sunlight-glow" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="평화의 발자취"
          subtitle="강정에서 시작된 평화의 노래가 걸어온 길"
          inView={inView}
        />

        <div className="relative">
          {/* Central Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-jeju-ocean/20 via-jeju-ocean/50 to-jeju-ocean/20 rounded-full" />

          <div className="space-y-12 sm:space-y-24">
            {timelineData.map((item, index) => (
              <TimelineItem
                key={item.year}
                event={item}
                isLeft={index % 2 === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Timeline;
