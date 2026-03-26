import { useTranslation } from 'next-i18next';
import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import TrackCard from '../tracks/TrackCard';
import Section from '../layout/Section';
import { getTracks } from '@/api/tracks';
import { getMusicians } from '@/api/musicians';
import { Track } from '@/types/track';
import { Musician } from '@/types/musician';
import Button from '../common/Button';
import SectionHeader from '../common/SectionHeader';
import { config } from '@/config/env';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';
import { buildTrackMusicianRelation } from '@/utils/trackMusician';

interface TracksSectionProps {
  enableSectionWrapper?: boolean;
  hideSectionHeader?: boolean;
  initialTracks?: Track[];
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const TracksSection: React.FC<TracksSectionProps> = React.memo(
  ({
    enableSectionWrapper = true,
    hideSectionHeader = false,
    initialTracks = [],
    initialMusicians = [],
    initialLocale = 'ko',
  }) => {
    const { t, i18n } = useTranslation();

    const [expandedTrackId, setExpandedTrackId] = useState<number | null>(null);
    const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

    const fetchTracks = useCallback((locale: string) => getTracks(locale), []);
    const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);

    const tracksResource = useLocalizedResource<Track>({
      initialData: initialTracks,
      initialLocale,
      currentLocale: i18n.language,
      fetchResource: fetchTracks,
    });

    const musiciansResource = useLocalizedResource<Musician>({
      initialData: initialMusicians,
      initialLocale,
      currentLocale: i18n.language,
      fetchResource: fetchMusicians,
    });

    const tracks = tracksResource.data;
    const musicians = musiciansResource.data;
    const isLoading = tracksResource.isLoading || musiciansResource.isLoading;
    const loadingError = tracksResource.error ?? musiciansResource.error;

    const handleToggle = useCallback((id: number) => {
      setExpandedTrackId((prev) => (prev === id ? null : id));
    }, []);

    const handlePlay = useCallback((id: number) => {
      setPlayingTrackId((prev) => (prev === id ? null : id));
    }, []);

    const relation = useMemo(
      () => buildTrackMusicianRelation(tracks, musicians),
      [tracks, musicians]
    );

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
        ) : loadingError ? (
          <p className="text-center text-gray-600 py-10" role="alert">
            {t('common.no_results')}
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 max-w-6xl mx-auto">
            {tracks.map((track) => {
              const musician = relation.musicianByTrackId.get(track.id);
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
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
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
        <Section id="tracks" background="sky-horizon">
          {content}
        </Section>
      );
    }

    return <div>{content}</div>;
  }
);

TracksSection.displayName = 'TracksSection';
export default TracksSection;
