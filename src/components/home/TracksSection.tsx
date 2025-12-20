import React, { useState, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import TrackCard from '../tracks/TrackCard';
import Section from '../layout/Section';
import { tracks } from '../../data/tracks';
import Button from '../common/Button';
import SectionHeader from '../common/SectionHeader';

interface TracksSectionProps {
  enableSectionWrapper?: boolean;
  hideSectionHeader?: boolean;
}

const TracksSection: React.FC<TracksSectionProps> = ({ enableSectionWrapper = true, hideSectionHeader = false }) => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.1
  });

  const [expandedTrackId, setExpandedTrackId] = useState<number | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  const handleToggle = useCallback((id: number) => {
    setExpandedTrackId(prev => prev === id ? null : id);
  }, []);

  const handlePlay = useCallback((id: number) => {
    setPlayingTrackId(prev => prev === id ? null : id);
  }, []);

  const content = (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {!hideSectionHeader && (
        <SectionHeader
          title="수록곡"
          subtitle="12곡의 평화의 노래"
          inView={inView}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 max-w-6xl mx-auto">
        {tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            isExpanded={expandedTrackId === track.id}
            onToggle={() => handleToggle(track.id)}
            currentlyPlaying={playingTrackId === track.id}
            onPlay={() => handlePlay(track.id)}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center mt-16"
      >
        <Button
          href="https://smartstore.naver.com/peaceandmusic"
          variant="primary"
          size="lg"
          external
        >
          음반 구매하기
        </Button>
      </motion.div>
    </div>
  );

  if (enableSectionWrapper) {
    return (
      <Section id="tracks" background="sky-horizon" ref={ref}>
        {content}
      </Section>
    );
  }

  return <div ref={ref}>{content}</div>;
};

export default TracksSection;
