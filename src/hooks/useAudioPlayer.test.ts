import { renderHook, act } from '@testing-library/react';

const mockPlay = jest.fn();
const mockPause = jest.fn();
const mockStop = jest.fn();
const mockSeek = jest.fn();
const mockUnload = jest.fn();
const mockOnce = jest.fn();
const mockOff = jest.fn();
const mockDuration = jest.fn().mockReturnValue(180);

let capturedCallbacks: Record<string, ((...args: unknown[]) => void)[]> = {};

const MockHowl = jest.fn().mockImplementation((options: Record<string, unknown>) => {
  capturedCallbacks = {};
  const instance = {
    play: mockPlay,
    pause: mockPause,
    stop: mockStop,
    seek: mockSeek,
    unload: mockUnload,
    duration: mockDuration,
    once: mockOnce,
    off: mockOff,
    on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
      if (!capturedCallbacks[event]) capturedCallbacks[event] = [];
      capturedCallbacks[event].push(cb);
    }),
  };

  if (typeof options.onload === 'function') {
    Promise.resolve().then(() => (options.onload as () => void)());
  }

  return instance;
});

jest.mock('howler', () => ({
  Howl: MockHowl,
}));

import { useAudioPlayer } from './useAudioPlayer';

describe('useAudioPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDuration.mockReturnValue(180);
    mockSeek.mockReturnValue(0);
    capturedCallbacks = {};
  });

  it('초기 상태: progress=0, duration=0, error=null', () => {
    const { result } = renderHook(() => useAudioPlayer({ audioUrl: '', isPlaying: false }));
    expect(result.current.progress).toBe(0);
    expect(result.current.duration).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('audioUrl 제공 시 Howl 인스턴스 생성', async () => {
    renderHook(() =>
      useAudioPlayer({ audioUrl: 'http://example.com/track.mp3', isPlaying: false })
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(MockHowl).toHaveBeenCalledWith(
      expect.objectContaining({ src: ['http://example.com/track.mp3'], html5: true })
    );
  });

  it('onload 콜백 호출 후 duration 설정', async () => {
    mockDuration.mockReturnValue(240);
    const { result } = renderHook(() =>
      useAudioPlayer({ audioUrl: 'http://example.com/track.mp3', isPlaying: false })
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.duration).toBe(240);
  });

  it('isPlaying=true → play 호출', async () => {
    renderHook(() => useAudioPlayer({ audioUrl: 'http://example.com/track.mp3', isPlaying: true }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockPlay).toHaveBeenCalled();
  });

  it('isPlaying=false → pause 호출', async () => {
    const { rerender } = renderHook(
      ({ isPlaying }) => useAudioPlayer({ audioUrl: 'http://example.com/track.mp3', isPlaying }),
      { initialProps: { isPlaying: true } }
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    rerender({ isPlaying: false });
    expect(mockPause).toHaveBeenCalled();
  });

  it('unmount 시 Howl.unload 호출 (메모리 누수 방지)', async () => {
    const { unmount } = renderHook(() =>
      useAudioPlayer({ audioUrl: 'http://example.com/track.mp3', isPlaying: false })
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    unmount();
    expect(mockUnload).toHaveBeenCalled();
  });

  it('audioUrl 변경 시 기존 인스턴스 unload 후 새 인스턴스 생성', async () => {
    const { rerender } = renderHook(
      ({ audioUrl }) => useAudioPlayer({ audioUrl, isPlaying: false }),
      { initialProps: { audioUrl: 'http://example.com/track1.mp3' } }
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    rerender({ audioUrl: 'http://example.com/track2.mp3' });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockUnload).toHaveBeenCalled();
    expect(MockHowl).toHaveBeenCalledTimes(2);
  });

  describe('getProgressPercent', () => {
    it('duration=0이면 0 반환', () => {
      const { result } = renderHook(() => useAudioPlayer({ audioUrl: '', isPlaying: false }));
      expect(result.current.getProgressPercent()).toBe(0);
    });

    it('progress/duration 비율 계산', async () => {
      mockDuration.mockReturnValue(100);
      const { result } = renderHook(() =>
        useAudioPlayer({ audioUrl: 'http://example.com/t.mp3', isPlaying: false })
      );
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      act(() => {
        result.current.seekToPercent(0.5);
      });
      expect(result.current.getProgressPercent()).toBe(50);
    });
  });

  describe('seekToPercent', () => {
    it('0~1 범위 클램핑: 1.5 → 100%', async () => {
      mockDuration.mockReturnValue(100);
      const { result } = renderHook(() =>
        useAudioPlayer({ audioUrl: 'http://example.com/t.mp3', isPlaying: false })
      );
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      act(() => {
        result.current.seekToPercent(1.5);
      });
      expect(mockSeek).toHaveBeenCalledWith(100);
    });

    it('duration=0이면 seek 미호출', async () => {
      const { result } = renderHook(() => useAudioPlayer({ audioUrl: '', isPlaying: false }));
      act(() => {
        result.current.seekToPercent(0.5);
      });
      expect(mockSeek).not.toHaveBeenCalled();
    });
  });

  describe('formatTime', () => {
    it('0 → "0:00"', () => {
      const { result } = renderHook(() => useAudioPlayer({ audioUrl: '', isPlaying: false }));
      expect(result.current.formatTime(0)).toBe('0:00');
    });

    it('65초 → "1:05"', () => {
      const { result } = renderHook(() => useAudioPlayer({ audioUrl: '', isPlaying: false }));
      expect(result.current.formatTime(65)).toBe('1:05');
    });

    it('음수 → "0:00"', () => {
      const { result } = renderHook(() => useAudioPlayer({ audioUrl: '', isPlaying: false }));
      expect(result.current.formatTime(-10)).toBe('0:00');
    });

    it('Infinity → "0:00"', () => {
      const { result } = renderHook(() => useAudioPlayer({ audioUrl: '', isPlaying: false }));
      expect(result.current.formatTime(Infinity)).toBe('0:00');
    });

    it('3600초 → "60:00"', () => {
      const { result } = renderHook(() => useAudioPlayer({ audioUrl: '', isPlaying: false }));
      expect(result.current.formatTime(3600)).toBe('60:00');
    });
  });
});
