import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export const UNSAVED_CHANGES_MESSAGE =
  '저장하지 않은 변경 내용이 있습니다. 이 페이지를 벗어나면 편집 중인 내용이 사라집니다. 계속하시겠습니까?';

// routeChangeStart 안에서 이동을 중단시키기 위해 던지는 값.
// Next.js Pages Router의 관례적 패턴: routeChangeStart 핸들러에서 throw 하면
// 라우트 전환이 취소된다. 문자열을 던지고 routeChangeError를 미리 emit 해
// 콘솔 노이즈 없이 조용히 취소한다(수신 측에서 무시).
const ROUTE_ABORTED = 'Route change aborted by useUnsavedChangesGuard (safe to ignore).';

export interface UnsavedChangesGuard {
  // 이동(router.push)을 직접 호출하는 핸들러가 이동 전에 호출한다.
  // dirty면 confirm을 띄우고, 승인되면 뒤이어 발생할 routeChangeStart가
  // 다시 묻지 않도록 1회용 bypass를 무장한다. 취소하면 false(호출자는 이동 중단).
  confirmIfDirty: () => boolean;
  // 라우팅과 무관한 인메모리 폐기(예: 목록에서 다른 항목 선택)용.
  // dirty면 confirm만 띄우고 bypass는 무장하지 않는다.
  confirmDiscard: () => boolean;
}

/**
 * 미저장 편집 보호 훅.
 *
 * - `router.events.routeChangeStart`에서 isDirty면 window.confirm으로 확인하고,
 *   취소 시 throw로 라우트 전환을 중단한다(브라우저 뒤로가기·내비 링크 등 모든 라우팅).
 * - `beforeunload`로 새로고침·탭 닫기도 방어한다.
 * - `confirmIfDirty()`는 router.push를 직접 호출하는 핸들러가 이동 전에 명시적으로
 *   물을 수 있게 하며, 승인 직후의 routeChangeStart는 1회용 bypass로 통과시켜
 *   이중 확인을 방지한다.
 */
export function useUnsavedChangesGuard(
  isDirty: boolean,
  message: string = UNSAVED_CHANGES_MESSAGE
): UnsavedChangesGuard {
  const router = useRouter();
  // 이벤트 핸들러가 항상 최신 값을 보도록 ref로 추적한다.
  const isDirtyRef = useRef(isDirty);
  const messageRef = useRef(message);
  // confirmIfDirty로 승인된 직후의 routeChangeStart 1회를 통과시키는 플래그.
  const bypassNextRouteChangeRef = useRef(false);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      // confirmIfDirty로 이미 승인된 이동이면 다시 묻지 않는다(이중 확인 방지).
      if (bypassNextRouteChangeRef.current) {
        bypassNextRouteChangeRef.current = false;
        return;
      }
      if (!isDirtyRef.current) return;
      if (window.confirm(messageRef.current)) return;
      // 사용자가 취소 → 라우트 전환 중단.
      router.events.emit('routeChangeError', new Error(ROUTE_ABORTED), url, {
        shallow: false,
      });
      throw ROUTE_ABORTED;
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      event.preventDefault();
      // 일부 브라우저는 returnValue 설정을 요구한다.
      event.returnValue = '';
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // router는 안정적인 참조지만, 관례상 의존성에 포함한다.
  }, [router]);

  const confirmIfDirty = useCallback(() => {
    if (!isDirtyRef.current) return true;
    if (typeof window !== 'undefined' && window.confirm(messageRef.current)) {
      // 뒤이어 router.push가 일으킬 routeChangeStart 1회를 통과시킨다.
      bypassNextRouteChangeRef.current = true;
      return true;
    }
    return false;
  }, []);

  const confirmDiscard = useCallback(() => {
    if (!isDirtyRef.current) return true;
    // 라우팅이 아니므로 bypass는 무장하지 않는다(다음 실제 이동의 확인을 삼키지 않도록).
    return typeof window !== 'undefined' ? window.confirm(messageRef.current) : true;
  }, []);

  return { confirmIfDirty, confirmDiscard };
}
