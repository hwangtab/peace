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
  useEffect(() => {
    let ticking = false;
    let rafHandle: number | undefined;

    const handleScroll = () => {
      if (!ticking) {
        rafHandle = requestAnimationFrame(() => {
          setIsScrolled((prev) => (prev ? window.scrollY > 40 : window.scrollY > 50));
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
