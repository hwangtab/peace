import { renderHook, act } from '@testing-library/react';
import { useFilterFromQuery } from './useFilterFromQuery';

const mockRouterBase = {
  isReady: true,
  query: {} as Record<string, string>,
  pathname: '/',
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  prefetch: jest.fn(),
  locale: 'ko',
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

import { useRouter } from 'next/router';
const mockUseRouter = useRouter as jest.Mock;

describe('useFilterFromQuery', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ ...mockRouterBase, query: {} });
  });

  test('query 없으면 "all" 반환', () => {
    mockUseRouter.mockReturnValue({ ...mockRouterBase, query: {} });
    const { result } = renderHook(() => useFilterFromQuery());
    expect(result.current[0]).toBe('all');
  });

  test('유효한 query.filter → 해당 필터 반환', () => {
    mockUseRouter.mockReturnValue({ ...mockRouterBase, query: { filter: 'camp-2026' } });
    const { result } = renderHook(() => useFilterFromQuery());
    expect(result.current[0]).toBe('camp-2026');
  });

  test('유효하지 않은 query.filter → "all" 반환', () => {
    mockUseRouter.mockReturnValue({ ...mockRouterBase, query: { filter: 'invalid-value' } });
    const { result } = renderHook(() => useFilterFromQuery());
    expect(result.current[0]).toBe('all');
  });

  test('router.isReady=false 이면 "all" 반환', () => {
    mockUseRouter.mockReturnValue({ ...mockRouterBase, isReady: false, query: { filter: 'camp-2025' } });
    const { result } = renderHook(() => useFilterFromQuery());
    expect(result.current[0]).toBe('all');
  });

  test('setSelectedFilter 호출 → override 우선 적용', () => {
    mockUseRouter.mockReturnValue({ ...mockRouterBase, query: {} });
    const { result } = renderHook(() => useFilterFromQuery());
    expect(result.current[0]).toBe('all');

    act(() => {
      result.current[1]('camp-2023');
    });

    expect(result.current[0]).toBe('camp-2023');
  });

  test('override 후 query 변경 시 override 무효화 → query 값 적용', () => {
    mockUseRouter.mockReturnValue({ ...mockRouterBase, query: {} });
    const { result, rerender } = renderHook(() => useFilterFromQuery());

    act(() => {
      result.current[1]('camp-2023');
    });
    expect(result.current[0]).toBe('camp-2023');

    // URL 이 바뀌면 queryKey 가 달라져 override 무효화
    mockUseRouter.mockReturnValue({ ...mockRouterBase, query: { filter: 'camp-2026' } });
    rerender();

    expect(result.current[0]).toBe('camp-2026');
  });

  test('override 후 query 그대로이면 override 유지', () => {
    mockUseRouter.mockReturnValue({ ...mockRouterBase, query: { filter: 'camp-2025' } });
    const { result, rerender } = renderHook(() => useFilterFromQuery());

    act(() => {
      result.current[1]('album-2024');
    });
    expect(result.current[0]).toBe('album-2024');

    // query 변화 없이 리렌더 → override 유지
    rerender();
    expect(result.current[0]).toBe('album-2024');
  });
});
