import { useTranslation } from 'next-i18next';
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import TrackCard from '../tracks/TrackCard';
import Section from '../layout/Section';
import { getTracks } from '@/api/tracks';
import { getMusicians } from '@/api/musicians';
import { Track } from '@/types/track';
import { Musician } from '@/types/musician';
import Button from '../common/Button';
import SectionHeader from '../common/SectionHeader';
import { config } from '@/config/env';

interface TracksSectionProps {
  enableSectionWrapper?: boolean;
  hideSectionHeader?: boolean;
  initialTracks?: Track[];
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const TracksSection: React.FC<TracksSectionProps> = React.memo(({
  enableSectionWrapper = true,
  hideSectionHeader = false,
  initialTracks = [],
  initialMusicians = [],
  initialLocale = 'ko',
}) => {
  const { t, i18n } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.1,
  });

  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [musicians, setMusicians] = useState<Musician[]>(initialMusicians);
  const [isLoading, setIsLoading] = useState(initialTracks.length === 0);
  const [expandedTrackId, setExpandedTrackId] = useState<number | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  // Load tracks and musicians data on mount or when language changes
  useEffect(() => {
    if (i18n.language === initialLocale && initialTracks.length > 0) {
      setTracks(initialTracks);
      setMusicians(initialMusicians);
      return;
    }

    let isCancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [tracksData, musiciansData] = await Promise.all([
          getTracks(i18n.language),
          getMusicians(i18n.language),
        ]);
        if (!isCancelled) {
          setTracks(tracksData);
          setMusicians(musiciansData);
        }
      } catch (error) {
        console.error('Failed to load tracks:', error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, initialLocale, initialTracks.length, initialMusicians.length]);

  const handleToggle = useCallback((id: number) => {
    setExpandedTrackId((prev) => (prev === id ? null : id));
  }, []);

  const handlePlay = useCallback((id: number) => {
    setPlayingTrackId((prev) => (prev === id ? null : id));
  }, []);

  // 트랙→뮤지션 매핑을 사전 구축하여 O(n*m) → O(n+m)으로 최적화
  const musicianByKey = useMemo(() => {
    const map = new Map<string, Musician>();
    for (const m of musicians) {
      if (m.trackTitle) map.set(`track:${m.trackTitle}`, m);
      if (m.name) map.set(`name:${m.name}`, m);
    }
    return map;
  }, [musicians]);

  const content = (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {!hideSectionHeader && (
        <SectionHeader title={t('home.tracks.title')} subtitle={t('home.tracks.subtitle')} />
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20" role="status">
          <div className="motion-safe:animate-spin rounded-full h-12 w-12 border-b-2 border-jeju-ocean" />
          <span className="sr-only">{t('common.loading')}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 max-w-6xl mx-auto">
          {tracks.map((track) => {
            const musician = musicianByKey.get(`track:${track.title}`)
              || musicianByKey.get(`name:${track.artist}`);
            return (
              <TrackCard
                key={track.id}
                track={track}
                isExpanded={hideSectionHeader ? true : expandedTrackId === track.id}
                onToggle={() => handleToggle(track.id)}
                currentlyPlaying={playingTrackId === track.id}
                onPlay={() => handlePlay(track.id)}
                musicianImageUrl={musician?.imageUrl}
                alwaysExpanded={hideSectionHeader}
              />
            );
          })}
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
});

TracksSection.displayName = 'TracksSection';
export default TracksSection;
