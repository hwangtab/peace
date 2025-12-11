import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  title: string;
  artist: string;
}

const AudioPlayer = ({ audioUrl, isPlaying, onPlayPause, title, artist }: AudioPlayerProps) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef<Howl | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (audioUrl && !soundRef.current) {
      soundRef.current = new Howl({
        src: [audioUrl],
        html5: true,
        onload: () => {
          setDuration(soundRef.current?.duration() || 0);
        },
      });
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
        soundRef.current = null;
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!soundRef.current) return;

    if (isPlaying) {
      // Ensure we stop any previous playback and reset before playing
      soundRef.current.stop();
      soundRef.current.play();
      const animate = () => {
        setProgress(soundRef.current?.seek() || 0);
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    } else {
      soundRef.current.pause();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!soundRef.current) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const newTime = percent * duration;

    soundRef.current.seek(newTime);
    setProgress(newTime);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onPlayPause}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-ocean-mist text-white hover:bg-jeju-ocean transition-colors"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>

        {/* Track Info */}
        <div className="flex-1">
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-gray-500">{artist}</div>
        </div>

        {/* Time */}
        <div className="text-xs text-gray-500">
          {formatTime(progress)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="mt-2 h-1 bg-gray-200 rounded cursor-pointer"
        onClick={handleSeek}
      >
        <motion.div
          className="h-full bg-coastal-gray rounded"
          style={{ width: `${(progress / duration) * 100}%` }}
          layout
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
