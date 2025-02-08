import { motion } from 'framer-motion';
import { useState } from 'react';
import TrackCard from '../components/tracks/TrackCard';
import { tracks } from '../data/tracks';
import { Track } from '../types/track';

const TracksPage = () => {
  const [expandedTrackId, setExpandedTrackId] = useState<number | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);

  const handleToggle = (trackId: number) => {
    setExpandedTrackId(expandedTrackId === trackId ? null : trackId);
  };

  const handlePlay = (trackId: number) => {
    setCurrentlyPlaying(currentlyPlaying === trackId ? null : trackId);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-light-beige">
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
