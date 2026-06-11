import React from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Track } from '@/types/track';
import TrackHeader from './TrackHeader';
import TrackCredits from './TrackCredits';

const AudioPlayer = dynamic(() => import('./AudioPlayer'), {
  loading: () => <div className="h-20 w-full motion-safe:animate-pulse bg-ocean-sand rounded-lg" />,
  ssr: false,
});

export interface TrackCardProps {
  track: Track;
  isExpanded: boolean;
  onToggle: () => void;
  currentlyPlaying: boolean;
  onPlay: () => void;
  musicianImageUrl?: string;
  alwaysExpanded?: boolean;
  priority?: boolean;
}

const TrackCard = React.memo(
  ({
    track,
    isExpanded,
    onToggle,
    currentlyPlaying,
    onPlay,
    musicianImageUrl,
    alwaysExpanded = false,
    priority = false,
  }: TrackCardProps) => {
    const { t } = useTranslation();
    const showContent = alwaysExpanded || isExpanded;
    const [shouldRenderContent, setShouldRenderContent] = React.useState(showContent);

    React.useEffect(() => {
      if (showContent) {
        setShouldRenderContent(true);
        return undefined;
      }

      const timeoutId = window.setTimeout(() => setShouldRenderContent(false), 200);
      return () => window.clearTimeout(timeoutId);
    }, [showContent]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        {alwaysExpanded && musicianImageUrl && (
          <div className="relative h-36 sm:h-48 w-full">
            <Image
              src={musicianImageUrl}
              alt={track.artist}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority={priority}
            />
          </div>
        )}

        <TrackHeader
          track={track}
          isExpanded={isExpanded}
          onToggle={onToggle}
          onPlay={onPlay}
          alwaysExpanded={alwaysExpanded}
        />

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
            showContent ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
          aria-hidden={!showContent}
        >
          {shouldRenderContent && (
            <motion.div
              initial={alwaysExpanded ? false : { opacity: 0, y: -8 }}
              animate={alwaysExpanded ? undefined : { opacity: 1, y: 0 }}
              transition={alwaysExpanded ? undefined : { duration: 0.18, ease: 'easeOut' }}
              className="min-h-0 overflow-hidden"
            >
              <div className="p-4">
                {track.audioUrl && (
                  <div className="mt-4 mb-6 md:mb-8">
                    <AudioPlayer
                      audioUrl={track.audioUrl}
                      isPlaying={currentlyPlaying}
                      onPlayPause={onPlay}
                      title={track.title}
                      artist={track.artist}
                    />
                  </div>
                )}

                {track.description && (
                  <div className="mb-6 md:mb-8">
                    <div className="flex items-center mb-4">
                      <h4 className="text-lg font-serif text-jeju-ocean">
                        {t('common.track_desc')}
                      </h4>
                      <div className="flex-grow ml-3 sm:ml-4 h-px bg-coastal-gray/20" />
                    </div>
                    <p className="text-coastal-gray leading-relaxed whitespace-pre-line break-words">
                      {track.description}
                    </p>
                  </div>
                )}

                {track.lyrics && (
                  <div className="mb-6 md:mb-8">
                    <div className="flex items-center mb-4">
                      <h4 className="text-lg font-serif text-jeju-ocean">{t('common.lyrics')}</h4>
                      <div className="flex-grow ml-3 sm:ml-4 h-px bg-coastal-gray/20" />
                    </div>
                    <div className="bg-ocean-sand/30 p-4 rounded-lg">
                      <p className="text-coastal-gray whitespace-pre-line leading-relaxed break-words">
                        {track.lyrics}
                      </p>
                    </div>
                  </div>
                )}

                {track.credits && <TrackCredits credits={track.credits} />}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }
);

TrackCard.displayName = 'TrackCard';

export default TrackCard;
