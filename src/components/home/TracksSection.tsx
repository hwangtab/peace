import { useTranslation } from 'react-i18next';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import TrackCard from '../tracks/TrackCard';
import Section from '../layout/Section';
import { getTracks } from '../../api/tracks';
import { Track } from '../../types/track';
import Button from '../common/Button';
import SectionHeader from '../common/SectionHeader';
import { config } from '../../config/env';

interface TracksSectionProps {
  enableSectionWrapper?: boolean;
  hideSectionHeader?: boolean;
}

const TracksSection: React.FC<TracksSectionProps> = ({
  enableSectionWrapper = true,
  hideSectionHeader = false,
}) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.1,
  });

  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTrackId, setExpandedTrackId] = useState<number | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  // Load tracks data on mount
  useEffect(() => {
    let isCancelled = false;

    const loadTracks = async () => {
      setIsLoading(true);
      try {
        const data = await getTracks();
        if (!isCancelled) {
          setTracks(data);
        }
      } catch (error) {
        console.error('Failed to load tracks:', error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTracks();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleToggle = useCallback((id: number) => {
    setExpandedTrackId((prev) => (prev === id ? null : id));
  }, []);

  const handlePlay = useCallback((id: number) => {
    setPlayingTrackId((prev) => (prev === id ? null : id));
  }, []);

  const content = (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {!hideSectionHeader && (
        <SectionHeader title={t('home.tracks.title')} subtitle={t('home.tracks.subtitle')} inView={inView} />
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jeju-ocean" />
        </div>
      ) : (
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
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center mt-16"
      >
        <Button href={config.smartstoreUrl} variant="primary" size="lg" external>
          {t('home.tracks.buy_album')}
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
