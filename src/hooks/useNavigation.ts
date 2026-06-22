import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { isRouteActive } from '@/utils/routeMatch';
import { useScrolled } from '@/hooks/useScrolled';
import { useHydrated } from '@/hooks/useHydrated';

export type NavigationDropdownKey = 'camps' | 'album' | 'community';

export const useNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [desktopOpenDropdown, setDesktopOpenDropdown] = useState<NavigationDropdownKey | null>(
    null
  );
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<NavigationDropdownKey | null>(null);
  const isScrolled = useScrolled();
  const router = useRouter();
  const currentPath = router.asPath;
  const hydrated = useHydrated();

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
      hydrated && isRouteActive(currentPath, path, { exact, locale: router.locale }),
    [currentPath, hydrated, router.locale]
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
