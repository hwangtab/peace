import { renderHook, act } from '@testing-library/react';
import { useUnsavedChangesGuard, UNSAVED_CHANGES_MESSAGE } from './useUnsavedChangesGuard';

// next/router를 실제 이벤트 레지스트리를 갖는 목으로 대체한다.
// (setupTests의 전역 목은 events.on/off가 jest.fn 스텁이라 핸들러를 실행할 수 없음)
type RouteHandler = (url: string, ...rest: unknown[]) => void;

const handlers: Record<string, Set<RouteHandler>> = {};

const routerMock = {
  events: {
    on: jest.fn((event: string, cb: RouteHandler) => {
      (handlers[event] ??= new Set()).add(cb);
    }),
    off: jest.fn((event: string, cb: RouteHandler) => {
      handlers[event]?.delete(cb);
    }),
    emit: jest.fn((event: string, ...args: unknown[]) => {
      handlers[event]?.forEach((cb) => cb(...(args as [string, ...unknown[]])));
    }),
  },
};

jest.mock('next/router', () => ({
  useRouter: () => routerMock,
}));

// routeChangeStart를 발화한다. 핸들러가 throw하면(취소) 그 에러를 반환한다.
function fireRouteChangeStart(url = '/next'): unknown {
  let thrown: unknown = undefined;
  handlers['routeChangeStart']?.forEach((cb) => {
    try {
      cb(url);
    } catch (err) {
      thrown = err;
    }
  });
  return thrown;
}

describe('useUnsavedChangesGuard', () => {
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    for (const key of Object.keys(handlers)) delete handlers[key];
    routerMock.events.emit.mockClear();
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  test('마운트 시 routeChangeStart / beforeunload 리스너를 등록하고 언마운트 시 해제한다', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useUnsavedChangesGuard(false));

    expect(routerMock.events.on).toHaveBeenCalledWith('routeChangeStart', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

    unmount();
    expect(routerMock.events.off).toHaveBeenCalledWith('routeChangeStart', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  test('dirty가 아니면 routeChangeStart는 confirm 없이 통과한다', () => {
    renderHook(() => useUnsavedChangesGuard(false));
    const thrown = fireRouteChangeStart();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(thrown).toBeUndefined();
  });

  test('dirty이고 confirm 승인 시 routeChangeStart는 통과한다', () => {
    confirmSpy.mockReturnValue(true);
    renderHook(() => useUnsavedChangesGuard(true));
    const thrown = fireRouteChangeStart();
    expect(confirmSpy).toHaveBeenCalledWith(UNSAVED_CHANGES_MESSAGE);
    expect(thrown).toBeUndefined();
  });

  test('dirty이고 confirm 취소 시 routeChangeStart가 throw로 전환을 중단하고 routeChangeError를 emit한다', () => {
    confirmSpy.mockReturnValue(false);
    renderHook(() => useUnsavedChangesGuard(true));
    const thrown = fireRouteChangeStart('/somewhere');
    expect(thrown).toBeDefined();
    expect(routerMock.events.emit).toHaveBeenCalledWith(
      'routeChangeError',
      expect.any(Error),
      '/somewhere',
      { shallow: false }
    );
  });

  test('커스텀 메시지를 confirm에 사용한다', () => {
    renderHook(() => useUnsavedChangesGuard(true, '정말 나갈래요?'));
    fireRouteChangeStart();
    expect(confirmSpy).toHaveBeenCalledWith('정말 나갈래요?');
  });

  describe('confirmIfDirty', () => {
    test('dirty가 아니면 프롬프트 없이 true를 반환한다', () => {
      const { result } = renderHook(() => useUnsavedChangesGuard(false));
      let ok = false;
      act(() => {
        ok = result.current.confirmIfDirty();
      });
      expect(ok).toBe(true);
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    test('dirty이고 승인하면 true, 이어지는 routeChangeStart는 재확인 없이 통과한다(이중 확인 방지)', () => {
      confirmSpy.mockReturnValue(true);
      const { result } = renderHook(() => useUnsavedChangesGuard(true));

      let ok = false;
      act(() => {
        ok = result.current.confirmIfDirty();
      });
      expect(ok).toBe(true);
      expect(confirmSpy).toHaveBeenCalledTimes(1);

      // 이어지는 push의 routeChangeStart는 bypass로 통과 → confirm 재호출 없음
      const thrown = fireRouteChangeStart();
      expect(thrown).toBeUndefined();
      expect(confirmSpy).toHaveBeenCalledTimes(1);

      // bypass는 1회용 — 다음 routeChangeStart는 다시 확인한다
      fireRouteChangeStart();
      expect(confirmSpy).toHaveBeenCalledTimes(2);
    });

    test('dirty이고 취소하면 false를 반환하고 bypass를 무장하지 않는다', () => {
      confirmSpy.mockReturnValue(false);
      const { result } = renderHook(() => useUnsavedChangesGuard(true));

      let ok = true;
      act(() => {
        ok = result.current.confirmIfDirty();
      });
      expect(ok).toBe(false);

      // 무장되지 않았으므로 이후 routeChangeStart는 정상적으로 다시 확인한다
      confirmSpy.mockReturnValue(false);
      const thrown = fireRouteChangeStart();
      expect(thrown).toBeDefined();
    });
  });

  describe('confirmDiscard', () => {
    test('dirty가 아니면 프롬프트 없이 true를 반환한다', () => {
      const { result } = renderHook(() => useUnsavedChangesGuard(false));
      let ok = false;
      act(() => {
        ok = result.current.confirmDiscard();
      });
      expect(ok).toBe(true);
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    test('dirty면 confirm 결과를 반환하되 bypass는 무장하지 않는다', () => {
      confirmSpy.mockReturnValue(true);
      const { result } = renderHook(() => useUnsavedChangesGuard(true));

      let ok = false;
      act(() => {
        ok = result.current.confirmDiscard();
      });
      expect(ok).toBe(true);
      expect(confirmSpy).toHaveBeenCalledTimes(1);

      // bypass 미무장 → 다음 routeChangeStart는 여전히 확인한다
      fireRouteChangeStart();
      expect(confirmSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('beforeunload', () => {
    function fireBeforeUnload() {
      const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
      const preventSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);
      return { event, preventSpy };
    }

    test('dirty면 preventDefault를 호출한다', () => {
      renderHook(() => useUnsavedChangesGuard(true));
      const { preventSpy } = fireBeforeUnload();
      expect(preventSpy).toHaveBeenCalled();
    });

    test('dirty가 아니면 preventDefault를 호출하지 않는다', () => {
      renderHook(() => useUnsavedChangesGuard(false));
      const { preventSpy } = fireBeforeUnload();
      expect(preventSpy).not.toHaveBeenCalled();
    });
  });
});
