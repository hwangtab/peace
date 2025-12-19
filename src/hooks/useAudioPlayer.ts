import { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

interface UseAudioPlayerOptions {
  audioUrl: string;
  isPlaying: boolean;
}

interface UseAudioPlayerReturn {
  progress: number;
  duration: number;
  getProgressPercent: () => number;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  formatTime: (time: number) => string;
}

export const useAudioPlayer = ({ audioUrl, isPlaying }: UseAudioPlayerOptions): UseAudioPlayerReturn => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef<Howl | null>(null);
  const requestRef = useRef<number | null>(null);
  const previousUrlRef = useRef<string | null>(null);

  // audioUrl 변경 시 기존 인스턴스 정리 후 새로 생성 (메모리 누수 방지)
  useEffect(() => {
    if (!audioUrl) return;

    // URL이 변경되었을 때만 새 인스턴스 생성
    if (previousUrlRef.current !== audioUrl) {
      // 기존 인스턴스 정리
      if (soundRef.current) {
        soundRef.current.unload();
        soundRef.current = null;
      }

      soundRef.current = new Howl({
        src: [audioUrl],
        html5: true,
        onload: () => {
          const dur = soundRef.current?.duration() ?? 0;
          setDuration(dur);
        },
        onend: () => {
          setProgress(0);
        },
      });

      previousUrlRef.current = audioUrl;
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
        soundRef.current = null;
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [audioUrl]);

  // 재생/일시정지 제어
  useEffect(() => {
    const sound = soundRef.current;
    if (!sound) return;

    if (isPlaying) {
      sound.play();
      const animate = () => {
        const seek = sound.seek();
        if (typeof seek === 'number') {
          setProgress(seek);
        }
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    } else {
      sound.pause();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isPlaying]);

  // NaN/Infinity 방지를 위한 안전한 progress 계산
  const getProgressPercent = useCallback((): number => {
    if (!duration || duration <= 0 || !isFinite(duration)) return 0;
    if (!progress || !isFinite(progress)) return 0;
    return Math.min((progress / duration) * 100, 100);
  }, [progress, duration]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const sound = soundRef.current;
    if (!sound || !duration || duration <= 0) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    const newTime = percent * duration;

    sound.seek(newTime);
    setProgress(newTime);
  }, [duration]);

  const formatTime = useCallback((time: number): string => {
    if (!isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    progress,
    duration,
    getProgressPercent,
    handleSeek,
    formatTime,
  };
};
