import { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/router';
import { isRouteActive } from '@/utils/routeMatch';

export type NavigationDropdownKey = 'camps' | 'album';

export const useNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [desktopOpenDropdown, setDesktopOpenDropdown] = useState<NavigationDropdownKey | null>(
    null
  );
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<NavigationDropdownKey | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const currentPath = router.asPath;

  // 브라우저가 스크롤 위치를 복원한 직후(paint 전)에 초기 상태를 동기 측정.
  // useEffect + rAF 조합은 첫 페인트 이후에 실행되어 스크롤된 상태로 새로고침 시 nav 플래시 발생.
  useLayoutEffect(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  // Scroll detection with requestAnimationFrame throttling.
  // Hysteresis: activate at >50px, deactivate at <30px — prevents flicker
  // near the threshold (esp. on mobile elastic/momentum scroll).
  useEffect(() => {
    let ticking = false;
    let rafHandle: number | undefined;

    const handleScroll = () => {
      if (!ticking) {
        rafHandle = requestAnimationFrame(() => {
          setIsScrolled((prev) => (prev ? window.scrollY > 30 : window.scrollY > 50));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafHandle) cancelAnimationFrame(rafHandle);
    };
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (newState) setMobileOpenDropdown(null);
      return newState;
    });
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setMobileOpenDropdown(null);
  }, []);

  const toggleMobileDropdown = useCallback((dropdown: NavigationDropdownKey) => {
    setMobileOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  }, []);

  const handleDesktopDropdownChange = useCallback(
    (dropdown: NavigationDropdownKey, isOpen: boolean) => {
      setDesktopOpenDropdown(isOpen ? dropdown : null);
    },
    []
  );

  const isPathActive = useCallback(
    (path: string, exact = false): boolean =>
      isRouteActive(currentPath, path, { exact, locale: router.locale }),
    [currentPath, router.locale]
  );

  return {
    isOpen,
    isScrolled,
    desktopOpenDropdown,
    mobileOpenDropdown,
    isPathActive,
    toggleMenu,
    closeMenu,
    toggleMobileDropdown,
    handleDesktopDropdownChange,
  };
};
