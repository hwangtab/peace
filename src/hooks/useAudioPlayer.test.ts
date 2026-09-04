import { renderHook, act } from '@testing-library/react';

const mockPlay = jest.fn();
const mockPause = jest.fn();
const mockStop = jest.fn();
const mockSeek = jest.fn();
const mockUnload = jest.fn();
const mockLoad = jest.fn();
const mockOnce = jest.fn();
const mockOff = jest.fn();
const mockDuration = jest.fn().mockReturnValue(180);

let capturedCallbacks: Record<string, ((...args: unknown[]) => void)[]> = {};
let capturedOptions: Record<string, unknown> = {};
// preload:false 이후에는 Howler 가 스스로 로드하지 않는다. 훅이 직접 load() 를
// 부르는 경로를 검증하려면 mock 의 자동 onload 발화를 끌 수 있어야 한다.
let autoFireLoad = true;

const MockHowl = jest.fn().mockImplementation((options: Record<string, unknown>) => {
  capturedCallbacks = {};
  capturedOptions = options;
  const instance = {
    play: mockPlay,
    pause: mockPause,
    stop: mockStop,
    seek: mockSeek,
    unload: mockUnload,
    load: mockLoad,
    duration: mockDuration,
    once: mockOnce,
    off: mockOff,
    on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
      if (!capturedCallbacks[event]) capturedCallbacks[event] = [];
      capturedCallbacks[event].push(cb);
    }),
  };

  if (autoFireLoad && typeof options.onload === 'function') {
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
    capturedOptions = {};
    autoFireLoad = true;
  });

  describe('재생 실패 시 부모로 종료 전파 + error 노출', () => {
    it('onloaderror → error 설정, stop 호출, onEnded 전파', async () => {
      const onEnded = jest.fn();
      const { result } = renderHook(() =>
        useAudioPlayer({ audioUrl: 'http://example.com/track.mp3', isPlaying: true, onEnded })
      );
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      act(() => {
        (capturedOptions.onloaderror as (id: number, msg: unknown) => void)(1, 'decode error');
      });
      expect(result.current.error).toBe('decode error');
      expect(mockStop).toHaveBeenCalled();
      expect(onEnded).toHaveBeenCalledTimes(1);
    });

    it('onplayerror → error 설정, stop 호출, onEnded 전파', async () => {
      const onEnded = jest.fn();
      const { result } = renderHook(() =>
        useAudioPlayer({ audioUrl: 'http://example.com/track.mp3', isPlaying: true, onEnded })
      );
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      act(() => {
        (capturedOptions.onplayerror as (id: number, msg: unknown) => void)(1, 'autoplay blocked');
      });
      expect(result.current.error).toBe('autoplay blocked');
      expect(mockStop).toHaveBeenCalled();
      expect(onEnded).toHaveBeenCalledTimes(1);
    });
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

  it('preload:false 로 생성한다 (13곡 동시 preload = 51MB 방지)', async () => {
    renderHook(() =>
      useAudioPlayer({ audioUrl: 'http://example.com/track.mp3', isPlaying: false })
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(capturedOptions.preload).toBe(false);
  });

  it('재생 전에는 load() 를 부르지 않는다', async () => {
    autoFireLoad = false;
    renderHook(() =>
      useAudioPlayer({ audioUrl: 'http://example.com/track.mp3', isPlaying: false })
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockLoad).not.toHaveBeenCalled();
  });

  it('미로드 상태에서 재생 요청 시 load() 를 한 번 시작하고 load 이벤트에 play 를 건다', async () => {
    autoFireLoad = false;
    const { rerender } = renderHook(
      ({ isPlaying }) => useAudioPlayer({ audioUrl: 'http://example.com/track.mp3', isPlaying }),
      { initialProps: { isPlaying: false } }
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    rerender({ isPlaying: true });
    expect(mockLoad).toHaveBeenCalledTimes(1);
    expect(mockOnce).toHaveBeenCalledWith('load', expect.any(Function));

    // 일시정지 후 재요청해도 load() 는 중복 호출되지 않는다.
    rerender({ isPlaying: false });
    rerender({ isPlaying: true });
    expect(mockLoad).toHaveBeenCalledTimes(1);
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
