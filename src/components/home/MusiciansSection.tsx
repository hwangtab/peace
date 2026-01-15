import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { getMusicians } from '../../api/musicians';
import { Musician } from '../../types/musician';
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

  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load musicians data on mount
  useEffect(() => {
    let isCancelled = false;

    const loadMusicians = async () => {
      setIsLoading(true);
      const data = await getMusicians();
      if (!isCancelled) {
        setMusicians(data);
        setIsLoading(false);
      }
    };

    loadMusicians();

    return () => {
      isCancelled = true;
    };
  }, []);

  const content = (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {!hideSectionHeader && (
        <SectionHeader
          title="참여 뮤지션"
          subtitle="평화를 노래하는 12팀의 아티스트"
          inView={inView}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jeju-ocean"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {musicians.map((musician, index) => (
            <MusicianCard key={musician.id} musician={musician} index={index} />
          ))}
        </div>
      )}
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
