import { useState, useCallback, useEffect } from 'react';
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

  // 링크 클릭 외 경로(브라우저 뒤로가기, programmatic navigation)로 라우팅되면
  // onMouseLeave/onDismiss가 호출되지 않아 열린 드롭다운 상태가 잔류한다.
  // 라우팅 완료 시 모든 메뉴/드롭다운을 닫아 상태를 정리한다.
  useEffect(() => {
    const closeAll = () => {
      setIsOpen(false);
      setMobileOpenDropdown(null);
      setDesktopOpenDropdown(null);
    };
    router.events.on('routeChangeComplete', closeAll);
    return () => router.events.off('routeChangeComplete', closeAll);
  }, [router.events]);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      // 모바일 메뉴를 열 때 데스크톱 드롭다운 상태도 비운다 — 1280px 경계를 resize로
      // 오갈 때 이전 desktopOpenDropdown 값이 복원되며 드롭다운이 즉시 열려 보이는 것 방지.
      if (newState) {
        setMobileOpenDropdown(null);
        setDesktopOpenDropdown(null);
      }
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
      // 닫기 요청은 현재 열려 있는 드롭다운이 그 자신일 때만 적용한다.
      // (캠프의 지연된 hover-close 가 이미 열린 앨범을 닫아버리는 것 방지)
      setDesktopOpenDropdown((prev) => (isOpen ? dropdown : prev === dropdown ? null : prev));
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
