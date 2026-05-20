import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './useIsMobile';

type MockMediaQueryList = {
  matches: boolean;
  media: string;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  listeners: Array<(e: { matches: boolean }) => void>;
};

let mockMq: MockMediaQueryList;

function setupMatchMedia(initialMatches: boolean) {
  mockMq = {
    matches: initialMatches,
    media: '(max-width: 767px)',
    listeners: [],
    addEventListener: jest.fn((_event: string, handler: (e: { matches: boolean }) => void) => {
      mockMq.listeners.push(handler);
    }),
    removeEventListener: jest.fn((_event: string, handler: (e: { matches: boolean }) => void) => {
      mockMq.listeners = mockMq.listeners.filter((l) => l !== handler);
    }),
  };
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn(() => ({ ...mockMq, matches: mockMq.matches })),
  });
}

beforeEach(() => {
  setupMatchMedia(false);
});

describe('useIsMobile', () => {
  test('데스크탑 뷰포트에서 false 반환', () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  test('모바일 뷰포트에서 true 반환', () => {
    setupMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  test('change 이벤트로 false → true 전환', () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      // matchMedia 가 이제 true 반환하도록 교체
      mockMq.matches = true;
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn(() => ({ ...mockMq, matches: true })),
      });
      mockMq.listeners.forEach((l) => l({ matches: true }));
    });

    expect(result.current).toBe(true);
  });

  test('change 이벤트로 true → false 전환', () => {
    setupMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      mockMq.matches = false;
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn(() => ({ ...mockMq, matches: false })),
      });
      mockMq.listeners.forEach((l) => l({ matches: false }));
    });

    expect(result.current).toBe(false);
  });

  test('언마운트 시 이벤트 리스너 제거', () => {
    setupMatchMedia(false);
    const { unmount } = renderHook(() => useIsMobile());
    unmount();
    expect(mockMq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
