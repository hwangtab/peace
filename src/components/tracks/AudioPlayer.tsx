import React from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface AudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  title: string;
  artist: string;
}

const AudioPlayer = React.memo(({ audioUrl, isPlaying, onPlayPause, title, artist }: AudioPlayerProps) => {
  const { t } = useTranslation();
  const {
    progress,
    duration,
    getProgressPercent,
    handleSeek,
    seekToPercent,
    formatTime,
  } = useAudioPlayer({ audioUrl, isPlaying });

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-3 sm:p-4">
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Play/Pause Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onPlayPause}
          aria-label={isPlaying ? t('common.pause') : t('common.play')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-ocean-mist text-white hover:bg-jeju-ocean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
        >
          {isPlaying ? (
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{title}</div>
          <div className="text-xs text-gray-500 truncate">{artist}</div>
        </div>

        {/* Time */}
        <div className="text-xs text-gray-500 tabular-nums">
          {formatTime(progress)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="mt-2 h-1.5 sm:h-1 bg-gray-200 rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
        onClick={handleSeek}
        onTouchEnd={(e) => {
          const touch = e.changedTouches[0];
          if (touch) {
            const target = e.currentTarget;
            const mouseEvent = {
              currentTarget: target,
              clientX: touch.clientX,
            } as React.MouseEvent<HTMLDivElement>;
            handleSeek(mouseEvent);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); seekToPercent((getProgressPercent() + 5) / 100); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); seekToPercent((getProgressPercent() - 5) / 100); }
        }}
        role="slider"
        tabIndex={0}
        aria-label={t('common.audio_position')}
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuetext={`${formatTime(progress)} / ${formatTime(duration)}`}
      >
        <motion.div
          className="h-full bg-coastal-gray rounded"
          style={{ width: `${getProgressPercent()}%` }}
          layout
        />
      </div>
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
