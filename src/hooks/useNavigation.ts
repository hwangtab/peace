import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { isRouteActive } from '@/utils/routeMatch';
import { useScrolled } from '@/hooks/useScrolled';

export type NavigationDropdownKey = 'camps' | 'album';

export const useNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [desktopOpenDropdown, setDesktopOpenDropdown] = useState<NavigationDropdownKey | null>(
    null
  );
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<NavigationDropdownKey | null>(null);
  const isScrolled = useScrolled();
  const router = useRouter();
  const currentPath = router.asPath;

  // 404 페이지 SSR 시 router.asPath = '/404' 로 떨어져 클라이언트의 실제 URL 과
  // 어긋나면서 active underline 이 SSR(false) ↔ client(true) hydration mismatch 를
  // 일으키던 회귀. mount 이후에만 active 계산하도록 지연.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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
      mounted && isRouteActive(currentPath, path, { exact, locale: router.locale }),
    [mounted, currentPath, router.locale]
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
