import { useSyncExternalStore } from 'react';

const MQ = '(max-width: 767px)';

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MQ);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

const getSnapshot = () => window.matchMedia(MQ).matches;
const getServerSnapshot = () => false;

/**
 * 768px 미만을 모바일로 판단한다.
 * SSR에서는 false를 반환하고 hydration 후 실제 값으로 교체된다.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
