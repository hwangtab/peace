import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { musicians } from '../../data/musicians';
import MusicianCard from '../musicians/MusicianCard';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';
import React from 'react';

interface MusiciansSectionProps {
  enableSectionWrapper?: boolean;
  hideSectionHeader?: boolean;
}

const MusiciansSection: React.FC<MusiciansSectionProps> = React.memo(({ enableSectionWrapper = true, hideSectionHeader = false }) => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.1
  });

  const content = (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {!hideSectionHeader && (
        <SectionHeader
          title="참여 뮤지션"
          subtitle="평화를 노래하는 12팀의 아티스트"
          inView={inView}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {musicians.map((musician, index) => (
          <MusicianCard key={musician.id} musician={musician} index={index} />
        ))}
      </div>
    </div>
  );

  if (enableSectionWrapper) {
    return (
      <Section id="musicians" background="white" ref={ref}>
        {content}
      </Section>
    );
  }

  return <div ref={ref}>{content}</div>;
});

MusiciansSection.displayName = 'MusiciansSection';
export default MusiciansSection;
