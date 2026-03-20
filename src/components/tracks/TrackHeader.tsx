import { motion } from 'framer-motion';
import { Track } from '@/types/track';

interface TrackHeaderProps {
  track: Track;
  isExpanded: boolean;
  onToggle: () => void;
  onPlay: () => void;
  alwaysExpanded: boolean;
}

export default function TrackHeader({ track, isExpanded, onToggle, onPlay, alwaysExpanded }: TrackHeaderProps) {
  if (alwaysExpanded) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold font-serif break-words">{track.title}</h3>
              <span className="text-sm text-coastal-gray ml-4">{track.duration}</span>
            </div>
            <p className="text-jeju-ocean font-serif break-words">{track.artist}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 cursor-pointer hover:bg-ocean-sand transition-colors"
      onClick={() => {
        onToggle();
        onPlay();
      }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); onPlay(); } }}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
    >
      <div className="flex justify-between items-center">
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold font-serif break-words">{track.title}</h3>
            <span className="text-sm text-coastal-gray ml-4">{track.duration}</span>
          </div>
          <p className="text-jeju-ocean font-serif break-words">{track.artist}</p>
        </div>
        <motion.button
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-coastal-gray ml-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
