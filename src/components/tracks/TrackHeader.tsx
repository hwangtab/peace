import Link from 'next/link';
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
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-center">
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold font-serif break-words min-w-0">
                <Link href={`/album/tracks/${track.id}`} className="hover:text-jeju-ocean transition-colors focus-visible:outline-none focus-visible:underline">
                  {track.title}
                </Link>
              </h3>
              <span className="text-sm text-coastal-gray ml-2 sm:ml-4 flex-shrink-0">{track.duration}</span>
            </div>
            <p className="text-jeju-ocean font-serif font-bold break-words">{track.artist}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-3 sm:p-4 cursor-pointer hover:bg-ocean-sand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-lg"
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
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold font-serif break-words min-w-0">
              <Link href={`/album/tracks/${track.id}`} className="hover:text-jeju-ocean transition-colors focus-visible:outline-none focus-visible:underline" onClick={(e) => e.stopPropagation()}>
                {track.title}
              </Link>
            </h3>
            <span className="text-sm text-coastal-gray ml-2 sm:ml-4 flex-shrink-0">{track.duration}</span>
          </div>
          <p className="text-jeju-ocean font-serif font-bold break-words">{track.artist}</p>
        </div>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-coastal-gray ml-2 sm:ml-4"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 sm:h-5 sm:w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </motion.span>
      </div>
    </div>
  );
}
