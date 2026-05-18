import { useState, useEffect, useRef, useCallback } from 'react';
import type { Howl } from 'howler';

// Howler.js (35KB) 는 audio 재생 시점에만 필요. dynamic import 로 tracks 페이지
// 첫 페인트 JS 페이로드에서 빼고, 첫 click play 직전에 가져온다.
let HowlClassPromise: Promise<typeof Howl> | null = null;
const loadHowl = () => {
  if (!HowlClassPromise) {
    HowlClassPromise = import('howler').then((m) => m.Howl);
  }
  return HowlClassPromise;
};

interface UseAudioPlayerOptions {
  audioUrl: string;
  isPlaying: boolean;
}

interface UseAudioPlayerReturn {
  progress: number;
  duration: number;
  error: string | null;
  getProgressPercent: () => number;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  seekToPercent: (percent: number) => void;
  formatTime: (time: number) => string;
}

export const useAudioPlayer = ({ audioUrl, isPlaying }: UseAudioPlayerOptions): UseAudioPlayerReturn => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // soundReady 는 Howler 비동기 로드 + sound 생성 완료를 알린다. 재생/일시정지
  // 제어 effect 가 이 값에 의존해 sound 가 생기는 즉시 재트리거되도록 함.
  const [soundReady, setSoundReady] = useState(0);
  const soundRef = useRef<Howl | null>(null);
  const requestRef = useRef<number | null>(null);
  const previousUrlRef = useRef<string | null>(null);
  const isLoadedRef = useRef(false);
  const lastProgressUpdateRef = useRef(0);

  // audioUrl 변경 시 기존 인스턴스 정리 후 새로 생성 (메모리 누수 방지)
  useEffect(() => {
    if (!audioUrl) return;
    if (previousUrlRef.current === audioUrl) return;

    // 기존 인스턴스 정리
    if (soundRef.current) {
      soundRef.current.unload();
      soundRef.current = null;
    }
    isLoadedRef.current = false;
    setError(null);
    previousUrlRef.current = audioUrl;

    let cancelled = false;
    loadHowl().then((HowlClass) => {
      if (cancelled || previousUrlRef.current !== audioUrl) return;
      const newSound = new HowlClass({
        src: [audioUrl],
        html5: true,
        // 콜백 내부에서 soundRef.current 가 아닌 newSound 직접 참조 — 빠른 트랙
        // 전환 시 cleanup 이 ref 를 비웠거나 다른 instance 로 교체된 상황에서
        // 이전 트랙의 onload 가 새 트랙의 duration 을 덮어쓰는 회귀 방지.
        onload: () => {
          if (cancelled || previousUrlRef.current !== audioUrl) return;
          isLoadedRef.current = true;
          setDuration(newSound.duration() ?? 0);
        },
        onend: () => {
          setProgress(0);
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
          }
        },
        onloaderror: (_id: number, msg: unknown) => {
          if (cancelled || previousUrlRef.current !== audioUrl) return;
          console.warn('Audio load error:', msg);
          isLoadedRef.current = false;
          setError(String(msg || 'Failed to load audio'));
          newSound.stop();
        },
        onplayerror: (_id: number, msg: unknown) => {
          if (cancelled || previousUrlRef.current !== audioUrl) return;
          console.warn('Audio play error:', msg);
          setError(String(msg || 'Failed to play audio'));
          newSound.stop();
        },
      });
      soundRef.current = newSound;
      setSoundReady((n) => n + 1);
    });

    return () => {
      cancelled = true;
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

  // 재생/일시정지 제어 (audioUrl 변경 시에도 재실행하여 새 트랙 재생)
  useEffect(() => {
    const sound = soundRef.current;
    if (!sound) return;

    // 핸들러를 effect 스코프에서 선언해 cleanup 에서 이 listener 만 제거
    const playOnLoad = () => { sound.play(); };

    if (isPlaying) {
      if (isLoadedRef.current) {
        sound.play();
      } else {
        sound.once('load', playOnLoad);
      }
      const animate = () => {
        const now = performance.now();
        if (now - lastProgressUpdateRef.current >= 250) {
          const seek = sound.seek();
          if (typeof seek === 'number') {
            setProgress(seek);
          }
          lastProgressUpdateRef.current = now;
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
      sound.off('load', playOnLoad);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
    // soundReady 가 deps 에 들어가야 Howler 비동기 로드 후 sound 가 생기는
    // 시점에 isPlaying=true 였던 사용자 의도가 반영됨.
  }, [isPlaying, audioUrl, soundReady]);

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

  const seekToPercent = useCallback((percent: number) => {
    const sound = soundRef.current;
    if (!sound || !duration || duration <= 0) return;
    const clamped = Math.max(0, Math.min(1, percent));
    const newTime = clamped * duration;
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
    error,
    getProgressPercent,
    handleSeek,
    seekToPercent,
    formatTime,
  };
};
