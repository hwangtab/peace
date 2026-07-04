import { renderHook, act } from '@testing-library/react';
import { useNavigation } from './useNavigation';

// next/router 모킹 — router.events / locale / asPath 만 사용한다.
const routerEventHandlers: Record<string, Array<() => void>> = {};
jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/',
    locale: 'ko',
    events: {
      on: (event: string, cb: () => void) => {
        (routerEventHandlers[event] ??= []).push(cb);
      },
      off: (event: string, cb: () => void) => {
        routerEventHandlers[event] = (routerEventHandlers[event] ?? []).filter((h) => h !== cb);
      },
    },
  }),
}));

// useNavigation 내부에서 쓰는 보조 훅들을 단순화.
jest.mock('./useScrolled', () => ({ useScrolled: () => false }));
jest.mock('./useHydrated', () => ({ useHydrated: () => true }));

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
    media: '(min-width: 1280px)',
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

// 브레이크포인트 통과(change 이벤트) 시뮬레이션.
function crossBreakpoint(nowMatches: boolean) {
  act(() => {
    mockMq.matches = nowMatches;
    mockMq.listeners.forEach((l) => l({ matches: nowMatches }));
  });
}

beforeEach(() => {
  for (const key of Object.keys(routerEventHandlers)) delete routerEventHandlers[key];
  setupMatchMedia(true); // 데스크톱 폭에서 시작
});

describe('useNavigation — nav 브레이크포인트 통과 시 상태 리셋', () => {
  test('데스크톱에서 드롭다운을 연 뒤 브레이크포인트를 넘으면 열림 상태가 모두 닫힌다', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.handleDesktopDropdownChange('camps', true);
    });
    expect(result.current.desktopOpenDropdown).toBe('camps');

    // 데스크톱 → 모바일 폭으로 통과
    crossBreakpoint(false);

    expect(result.current.desktopOpenDropdown).toBeNull();
    expect(result.current.mobileOpenDropdown).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });

  test('모바일에서 메뉴+아코디언을 연 뒤 브레이크포인트를 넘으면 열림 상태가 모두 닫힌다', () => {
    setupMatchMedia(false); // 모바일 폭에서 시작
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.toggleMenu();
    });
    act(() => {
      result.current.toggleMobileDropdown('album');
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.mobileOpenDropdown).toBe('album');

    // 모바일 → 데스크톱 폭으로 통과
    crossBreakpoint(true);

    expect(result.current.isOpen).toBe(false);
    expect(result.current.mobileOpenDropdown).toBeNull();
    expect(result.current.desktopOpenDropdown).toBeNull();
  });

  test('브레이크포인트를 왕복(넘었다 되돌아옴)해도 열림 상태가 재등장하지 않는다', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      result.current.handleDesktopDropdownChange('community', true);
    });
    expect(result.current.desktopOpenDropdown).toBe('community');

    crossBreakpoint(false); // 데스크톱 → 모바일
    crossBreakpoint(true); // 모바일 → 데스크톱(되돌아옴)

    expect(result.current.desktopOpenDropdown).toBeNull();
    expect(result.current.mobileOpenDropdown).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });

  test('언마운트 시 matchMedia 리스너를 제거한다', () => {
    const { unmount } = renderHook(() => useNavigation());
    unmount();
    expect(mockMq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
