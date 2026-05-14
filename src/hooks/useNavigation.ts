import { useState, useCallback, useEffect } from 'react';
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

  // Scroll detection with requestAnimationFrame throttling
  // 단일 임계치 40px — 2개 임계치(40/50px)가 10px 간격이라 미세 스크롤 시
  // 네비 상태가 깜빡임. 모바일 약 120px (100vh 의 5~10%).
  useEffect(() => {
    let ticking = false;
    let rafHandle: number | undefined;

    const handleScroll = () => {
      if (!ticking) {
        rafHandle = requestAnimationFrame(() => {
          setIsScrolled((prev) => (prev ? window.scrollY <= 40 : window.scrollY > 40));
          ticking = false;
        });
        ticking = true;
      }
    };

    // Check initial state
    handleScroll();

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
