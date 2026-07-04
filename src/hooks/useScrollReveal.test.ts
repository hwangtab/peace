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

  it('caps stagger delay for large indexes', () => {
    mockUseReducedMotion.mockReturnValue(false);
    const { result } = renderHook(() => useScrollReveal());
    expect(result.current.staggerDelay(100, 0.4)).toBe(0.4);
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
