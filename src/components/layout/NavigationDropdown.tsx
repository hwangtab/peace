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
      <div className="relative group" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          className={`flex items-center gap-1 ${getTextColor()} whitespace-nowrap transition-colors duration-300 font-display font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-sm`}
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
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <IoChevronDown aria-hidden="true" className="w-4 h-4 ml-1" />
          </motion.div>
        </button>

        <AnimatePresence>
          {open && (
            <DropdownMenu
              items={items}
              currentPath={currentPath}
              router={router}
              onDismiss={() => setOpen(false)}
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
  t: (key: string) => string;
}> = ({ items, currentPath, router, onDismiss, t }) => {
  const isPresent = useIsPresent();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      // exit 애니메이션 중(isPresent=false)에는 aria-hidden='true' —
      // screen reader 가 사라지는 dropdown 을 읽지 않도록.
      aria-hidden={isPresent ? 'false' : 'true'}
      className="absolute top-full left-0 mt-2 min-w-[12rem] max-w-[18rem] w-max bg-white/95 backdrop-blur-md shadow-lg rounded-lg overflow-hidden py-2 border border-ocean-mist/20 z-50 text-left"
    >
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
    </motion.div>
  );
};

NavigationDropdown.displayName = 'NavigationDropdown';
export default NavigationDropdown;
