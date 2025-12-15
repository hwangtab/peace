import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import TrackCard from '../tracks/TrackCard';
import Section from '../layout/Section';
import { tracks } from '../../data/tracks';

const TracksSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [expandedTrackId, setExpandedTrackId] = useState<number | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setExpandedTrackId(prev => prev === id ? null : id);
  };

  const handlePlay = (id: number) => {
    setPlayingTrackId(prev => prev === id ? null : id);
  };

  return (
    <Section id="tracks" background="white" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="typo-h2 mb-4 text-gray-900">수록곡</h2>
          <p className="typo-subtitle mb-12 text-gray-600">12곡의 평화의 노래</p>
        </motion.div>

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
          <a
            href="https://smartstore.naver.com/peaceandmusic"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-jeju-ocean text-white font-bold py-4 px-12 rounded-full hover:bg-ocean-mist transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
          >
            음반 구매하기
          </a>
        </motion.div>
      </div>
    </Section>
  );
};

export default TracksSection;
