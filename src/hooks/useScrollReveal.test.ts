import { renderHook } from '@testing-library/react';
import { useReducedMotion } from 'framer-motion';
import { useScrollReveal } from './useScrollReveal';
import { REVEAL_DISTANCE, REVEAL_DURATION, SCROLL_VIEWPORT } from '@/constants/motion';

jest.mock('framer-motion', () => ({
  useReducedMotion: jest.fn(),
}));

const mockUseReducedMotion = useReducedMotion as jest.Mock;

describe('useScrollReveal', () => {
  it('returns the shared viewport trigger', () => {
    mockUseReducedMotion.mockReturnValue(false);
    const { result } = renderHook(() => useScrollReveal());
    expect(result.current.viewport).toEqual(SCROLL_VIEWPORT);
  });

  it('offsets and staggers items when motion is not reduced', () => {
    mockUseReducedMotion.mockReturnValue(false);
    const { result } = renderHook(() => useScrollReveal());
    expect(result.current.item.hidden).toEqual({ opacity: 0, y: REVEAL_DISTANCE });
    expect(result.current.item.visible.transition.duration).toBe(REVEAL_DURATION);
    expect(result.current.staggerDelay(2)).toBeCloseTo(0.16);
  });

  it('cycles stagger delay within a row instead of accumulating by index', () => {
    // 항목별 whileInView 는 각 항목이 "자기" 뷰포트 진입 시점부터 지연을 세므로, index 누적
    // 지연은 뒤쪽 항목일수록 진입 후 늦게 나타나 줄마다 박자가 어긋난다. 한 줄(최대 3열)
    // 안에서만 잔물결을 주고 다음 줄은 다시 0 부터 시작해야 스크롤 순서와 등장 순서가 맞는다.
    mockUseReducedMotion.mockReturnValue(false);
    const { result } = renderHook(() => useScrollReveal());
    expect(result.current.staggerDelay(0)).toBe(0);
    expect(result.current.staggerDelay(2)).toBeCloseTo(0.16);
    expect(result.current.staggerDelay(3)).toBe(0);
    expect(result.current.staggerDelay(4)).toBeCloseTo(0.08);
    expect(result.current.staggerDelay(100)).toBeCloseTo(0.08);
    expect(result.current.itemTransition(100).delay).toBeCloseTo(0.08);
  });

  it('exposes shared hidden/visible states for per-item reveals', () => {
    mockUseReducedMotion.mockReturnValue(false);
    const { result } = renderHook(() => useScrollReveal());
    expect(result.current.itemHidden).toEqual({ opacity: 0, y: REVEAL_DISTANCE });
    expect(result.current.itemVisible).toEqual({ opacity: 1, y: 0 });
    mockUseReducedMotion.mockReturnValue(true);
    const reduced = renderHook(() => useScrollReveal());
    expect(reduced.result.current.itemHidden).toEqual({ opacity: 1 });
  });

  it('removes offsets and delays when motion is reduced', () => {
    mockUseReducedMotion.mockReturnValue(true);
    const { result } = renderHook(() => useScrollReveal());
    expect(result.current.item.hidden).toEqual({ opacity: 1 });
    expect(result.current.item.visible.transition.duration).toBe(0);
    expect(result.current.staggerDelay(5)).toBe(0);
    expect(result.current.itemTransition(5).delay).toBe(0);
  });
});
