import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AnimatePresence, m as motion, useIsPresent } from 'framer-motion';
import { IoChevronDown } from '@/components/icons/SiteIcons';
import { useTranslation } from 'next-i18next';
import { isRouteActive } from '@/utils/routeMatch';
import { useHydrated } from '@/hooks/useHydrated';

interface DropdownItem {
  // 다국어 라벨은 nameKey(locale JSON), 고정 한국어 라벨(예: 게시판 이름)은 label로 직접 지정.
  nameKey?: string;
  label?: string;
  path: string;
}

interface NavigationDropdownProps {
  label: string;
  items: DropdownItem[];
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isScrolled?: boolean;
}

const NavigationDropdown: React.FC<NavigationDropdownProps> = React.memo(
  ({ label, items, isOpen, onOpenChange, isScrolled }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Controlled vs Uncontrolled state
    const isControlled = isOpen !== undefined && onOpenChange !== undefined;
    const open = isControlled ? isOpen : internalOpen;

    const setOpen = React.useCallback(
      (newOpen: boolean) => {
        if (isControlled) {
          if (onOpenChange) onOpenChange(newOpen);
        } else {
          setInternalOpen(newOpen);
        }
      },
      [isControlled, onOpenChange]
    );

    // hover 닫힘에 짧은 지연을 둬 인접 드롭다운(캠프↔앨범)으로 마우스를 옮길 때
    // 사이 여백·패널 경계를 지나며 leave/enter 가 연쇄로 발생해 깜빡이는 것을 방지.
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cancelClose = React.useCallback(() => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    }, []);
    const scheduleClose = React.useCallback(() => {
      cancelClose();
      closeTimer.current = setTimeout(() => setOpen(false), 150);
    }, [cancelClose, setOpen]);
    useEffect(() => cancelClose, [cancelClose]);

    // Escape 등으로 닫을 때 포커스를 트리거 버튼으로 되돌린다(WAI-ARIA disclosure 패턴).
    // 메뉴 항목에 포커스가 가 있는 상태에서 닫으면 포커스가 body로 유실되기 때문.
    const dismissAndFocus = React.useCallback(() => {
      setOpen(false);
      buttonRef.current?.focus();
    }, [setOpen]);

    // Close when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [open, setOpen]);

    const currentPath = router.asPath;
    const hydrated = useHydrated();

    // 404 페이지 SSR 시 router.asPath 가 '/404' 로 떨어져 클라이언트의 실제 URL 과
    // 어긋나던 회귀를 피하기 위해 hydration 이후에만 active 를 계산한다.
    const isActive =
      hydrated &&
      items.some((item) => isRouteActive(currentPath, item.path, { locale: router.locale }));

    const getTextColor = () => {
      if (isScrolled) {
        return isActive || open
          ? 'text-jeju-ocean font-bold'
          : 'text-coastal-gray hover:text-jeju-ocean';
      }
      return isActive || open
        ? 'text-cloud-white font-bold drop-shadow-md'
        : 'text-cloud-white/90 hover:text-cloud-white drop-shadow-md';
    };

    return (
      <div
        className="relative group"
        ref={dropdownRef}
        onMouseEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          className={`relative inline-flex items-center ${getTextColor()} whitespace-nowrap transition-colors duration-300 font-display font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-sm`}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <span className="relative">
            {label}
            {isActive && (
              <motion.span
                className={`absolute bottom-[-4px] left-0 w-full h-0.5 ${isScrolled ? 'bg-golden-sun' : 'bg-cloud-white'}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </span>
          {/* 화살표는 absolute 로 띄워 평소 레이아웃 폭을 차지하지 않게 한다 —
              드롭다운/일반 링크 간 간격을 텍스트 기준으로 균일하게 유지하면서
              hover(group-hover) 또는 열림(open) 시에만 텍스트 오른쪽에 fade-in. */}
          <IoChevronDown
            aria-hidden="true"
            className={`pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-0.5 w-3.5 h-3.5 transition-opacity duration-200 ${
              open
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
            }`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <DropdownMenu
              items={items}
              currentPath={currentPath}
              router={router}
              onDismiss={() => setOpen(false)}
              onEscape={dismissAndFocus}
              t={t}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }
);

// inner menu — useIsPresent 호출을 최상위로 분리 (rules of hooks 준수)
const DropdownMenu: React.FC<{
  items: DropdownItem[];
  currentPath: string;
  router: ReturnType<typeof useRouter>;
  onDismiss: () => void;
  onEscape: () => void;
  t: (key: string) => string;
}> = ({ items, currentPath, router, onDismiss, onEscape, t }) => {
  const isPresent = useIsPresent();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      // 메뉴 항목(Link)에 포커스가 있을 때 Escape 키가 버블링되어 여기서 잡힌다 —
      // 닫고 트리거 버튼으로 포커스를 되돌린다(키보드 접근성).
      onKeyDown={(e) => {
        if (e.key === 'Escape') onEscape();
      }}
      // exit 애니메이션 중(isPresent=false)에는 aria-hidden='true' —
      // screen reader 가 사라지는 dropdown 을 읽지 않도록.
      aria-hidden={!isPresent}
      // top-full 바로 아래 붙이되 갭(pt-2)을 컨테이너 안에 두어 버튼↔메뉴 hover 영역을
      // 끊김 없이 잇는다 — 갭에서 마우스가 빠져 드롭다운이 닫히는 깜빡임 방지.
      className="absolute top-full left-0 pt-2 z-50 text-left"
    >
      <div className="min-w-[12rem] max-w-[18rem] w-max bg-white/95 backdrop-blur-md shadow-lg rounded-lg overflow-hidden py-2 border border-ocean-mist/20">
        {items.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`block px-4 py-2 whitespace-normal break-words ${
              isRouteActive(currentPath, item.path, { locale: router.locale })
                ? 'bg-ocean-sand text-jeju-ocean font-bold'
                : 'text-deep-ocean hover:bg-ocean-sand/50'
            } transition-colors duration-200 font-serif font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-jeju-ocean`}
            aria-current={
              isRouteActive(currentPath, item.path, { locale: router.locale }) ? 'page' : undefined
            }
            onClick={onDismiss}
          >
            {item.label ?? (item.nameKey ? t(item.nameKey) : '')}
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

NavigationDropdown.displayName = 'NavigationDropdown';
export default NavigationDropdown;
