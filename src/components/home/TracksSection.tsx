import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import TrackCard from '../tracks/TrackCard';
import { tracks } from '../../data/tracks';
import { Track } from '../../types/track';

const TracksSection = () => {
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleTrackToggle = (trackId: number) => {
    setExpandedTrack(expandedTrack === trackId ? null : trackId);
  };

  const handleTrackPlay = (trackId: number) => {
    setCurrentlyPlaying(currentlyPlaying === trackId ? null : trackId);
  };

  return (
    <section id="tracks" className="section bg-white" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-medium text-gray-900 mb-4 font-serif">
            수록곡
          </h2>
          <p className="text-lg text-gray-600 subtitle">
            평화를 노래하는 12곡의 이야기
          </p>
        </motion.div>

        <div className="space-y-4">
          {tracks.map((track: Track) => (
            <TrackCard
              key={track.id}
              track={track}
              isExpanded={expandedTrack === track.id}
              onToggle={() => handleTrackToggle(track.id)}
              currentlyPlaying={currentlyPlaying === track.id}
              onPlay={() => handleTrackPlay(track.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TracksSection;
