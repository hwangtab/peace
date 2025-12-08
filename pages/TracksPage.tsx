import { motion } from 'framer-motion';
import { useState } from 'react';
import TrackCard from '../src/components/tracks/TrackCard';
import { tracks } from '../src/data/tracks';
import { Track } from '../src/types/track';
import SEOHelmet from '../src/components/shared/SEOHelmet';
import { getBreadcrumbSchema, getMusicPlaylistSchema } from '../src/utils/structuredData';

const TracksPage = () => {
  const [expandedTrackId, setExpandedTrackId] = useState<number | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);

  const handleToggle = (trackId: number) => {
    setExpandedTrackId(expandedTrackId === trackId ? null : trackId);
  };

  const handlePlay = (trackId: number) => {
    setCurrentlyPlaying(currentlyPlaying === trackId ? null : trackId);
  };

  // Breadcrumb Structured Data
  const breadcrumbs = [
    { name: "홈", url: "https://peaceandmusic.net/" },
    { name: "트랙", url: "https://peaceandmusic.net/tracks" }
  ];

  // MusicPlaylist Structured Data
  const trackList = tracks.map(track => ({
    name: track.title,
    url: "https://peaceandmusic.net/tracks"
  }));

  const structuredData = [
    getBreadcrumbSchema(breadcrumbs),
    getMusicPlaylistSchema(trackList)
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-light-beige">
      <SEOHelmet
        title="트랙 | 이름을 모르는 먼 곳의 그대에게"
        description="평화를 노래하는 우리들의 목소리. 이름을 모르는 먼 곳의 그대에게 프로젝트의 전체 트랙을 감상하세요."
        keywords="평화 음악, 트랙, 음악 감상, 평화 노래, 수록곡"
        canonicalUrl="https://peaceandmusic.net/tracks"
        structuredData={structuredData}
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-medium text-gray-900 mb-4 font-serif">
            트랙
          </h1>
          <p className="text-xl text-gray-600">
            평화를 노래하는 우리들의 목소리
          </p>
        </motion.div>

        <div className="space-y-4">
          {tracks.map((track: Track) => (
            <TrackCard
              key={track.id}
              track={track}
              isExpanded={expandedTrackId === track.id}
              onToggle={() => handleToggle(track.id)}
              currentlyPlaying={currentlyPlaying === track.id}
              onPlay={() => handlePlay(track.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TracksPage;
