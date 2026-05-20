import { renderHook, act } from '@testing-library/react';
import { useScrolled } from './useScrolled';

// useScrolled 는 모듈 수준 싱글턴(scrollListeners, currentScrolled)을 사용한다.
// 각 테스트는 실제 scroll 이벤트를 dispatch 해서 상태를 조작하고,
// beforeEach 에서 scrollY=0 + scroll dispatch 로 초기 상태(false)를 강제한다.

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value });
}

function fireScroll() {
  window.dispatchEvent(new Event('scroll'));
}

beforeEach(() => {
  // 모듈 클로저 상태를 false 로 초기화
  // — 구독자가 있을 때만 클로저를 업데이트하므로 여기서는 scrollY 를 0 으로 둔다.
  // 각 테스트에서 renderHook 호출 직후 필요한 scrollY 를 설정한다.
  setScrollY(0);
});

// rAF 를 즉시 실행하는 fake timer 설정
beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

function flushRaf() {
  // jest.useFakeTimers 환경에서 requestAnimationFrame 콜백을 즉시 실행
  jest.runAllTimers();
}

describe('useScrolled', () => {
  test('scrollY=0 으로 구독 시작 → false', () => {
    setScrollY(0);
    const { result } = renderHook(() => useScrolled());
    expect(result.current).toBe(false);
  });

  test('scrollY=100 으로 구독 시작 → true', () => {
    // 이전 테스트에서 구독이 해제됐으므로 새 구독 시 scrollY 재측정
    setScrollY(100);
    const { result } = renderHook(() => useScrolled());
    expect(result.current).toBe(true);
  });

  test('false 상태에서 scrollY=60 scroll 이벤트 → true 전환', () => {
    setScrollY(0);
    const { result } = renderHook(() => useScrolled());
    expect(result.current).toBe(false);

    act(() => {
      setScrollY(60);
      fireScroll();
      flushRaf();
    });

    expect(result.current).toBe(true);
  });

  test('hysteresis: true 상태에서 scrollY=35 → 비활성 유지 (30px 임계값 위)', () => {
    setScrollY(60);
    const { result } = renderHook(() => useScrolled());
    expect(result.current).toBe(true);

    act(() => {
      setScrollY(35); // 30px 임계값 위 → 여전히 true
      fireScroll();
      flushRaf();
    });

    expect(result.current).toBe(true);
  });

  test('hysteresis: true 상태에서 scrollY=20 → false 전환 (30px 아래)', () => {
    setScrollY(60);
    const { result } = renderHook(() => useScrolled());
    expect(result.current).toBe(true);

    act(() => {
      setScrollY(20); // 30px 아래 → false
      fireScroll();
      flushRaf();
    });

    expect(result.current).toBe(false);
  });

  test('언마운트 후 scroll 이벤트 → 이전 결과 변동 없음', () => {
    setScrollY(0);
    const { result, unmount } = renderHook(() => useScrolled());
    expect(result.current).toBe(false);

    unmount();

    // 언마운트 이후 이벤트는 구독자가 없으므로 무시
    act(() => {
      setScrollY(80);
      fireScroll();
      flushRaf();
    });

    // result 가 업데이트되지 않음 (구독 해제)
    expect(result.current).toBe(false);
  });
});
