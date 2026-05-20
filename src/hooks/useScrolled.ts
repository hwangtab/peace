import { useSyncExternalStore } from 'react';

// hysteresis: 50px 초과로 활성, 30px 미만으로 비활성
// closure 내부 currentScrolled 로 이전 값을 보존 — snapshot 은 pure read
let currentScrolled = false;
const scrollListeners = new Set<() => void>();
let rafHandle: number | undefined;
let ticking = false;

function readScroll() {
  const next = currentScrolled ? window.scrollY > 30 : window.scrollY > 50;
  if (next !== currentScrolled) {
    currentScrolled = next;
    scrollListeners.forEach((l) => l());
  }
  ticking = false;
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  rafHandle = requestAnimationFrame(readScroll);
}

function subscribeScroll(cb: () => void) {
  if (scrollListeners.size === 0) {
    // 첫 구독 시 동기 측정 — useLayoutEffect 없이 paint 전 초기 상태 확보
    currentScrolled = window.scrollY > 50;
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  scrollListeners.add(cb);
  return () => {
    scrollListeners.delete(cb);
    if (scrollListeners.size === 0) {
      window.removeEventListener('scroll', onScroll);
      if (rafHandle !== undefined) cancelAnimationFrame(rafHandle);
    }
  };
}

const getScrolledSnapshot = () => currentScrolled;
const getScrolledServerSnapshot = () => false;

export function useScrolled(): boolean {
  return useSyncExternalStore(subscribeScroll, getScrolledSnapshot, getScrolledServerSnapshot);
}
