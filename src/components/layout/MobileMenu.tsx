import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { m as motion, AnimatePresence } from 'framer-motion';
import { simpleMenuItems, campItems, albumItems, communityItems } from './navigationData';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Container from './Container';
import { NavigationDropdownKey } from '@/hooks/useNavigation';
import { useOptionalAuth } from '@/components/auth/AuthProvider';

interface MobileMenuProps {
  isOpen: boolean;
  isPathActive: (path: string, exact?: boolean) => boolean;
  mobileOpenDropdown: NavigationDropdownKey | null;
  onClose: () => void;
  onToggleDropdown: (dropdown: NavigationDropdownKey) => void;
}

const menuReveal = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.18, ease: 'easeOut' },
} as const;

const MobileMenu: React.FC<MobileMenuProps> = React.memo(
  ({ isOpen, isPathActive, mobileOpenDropdown, onClose, onToggleDropdown }) => {
    const { t } = useTranslation();
    const auth = useOptionalAuth();

    return (
      <div id="mobile-menu" className="mobile-menu-wrapper" data-testid="mobile-menu">
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              {...menuReveal}
              // 내용이 화면보다 길어도(작은 폰 + 드롭다운 펼침) 아래 항목이 잘리지 않도록
              // 뷰포트 높이(내비 4rem 제외)로 제한하고 내부 스크롤을 둔다. nav가 fixed라
              // 페이지 스크롤로는 닿을 수 없기 때문에 메뉴 자체가 스크롤되어야 한다.
              className="xl:hidden origin-top max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-cloud-white/95 backdrop-blur-md border-t border-seafoam"
            >
              <Container size="wide" className="pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                {simpleMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`block py-3 break-words rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean ${
                      isPathActive(item.path) ? 'text-jeju-ocean font-bold' : 'text-coastal-gray'
                    } font-serif font-bold`}
                    aria-current={isPathActive(item.path) ? 'page' : undefined}
                    onClick={onClose}
                  >
                    {t(item.nameKey)}
                  </Link>
                ))}

                {/* Mobile Dropdowns */}
                <div className="border-t border-coastal-gray/20 my-4 pt-4">
                  <MobileDropdown
                    label={t('nav.camp')}
                    items={campItems}
                    isOpen={mobileOpenDropdown === 'camps'}
                    onToggle={() => onToggleDropdown('camps')}
                    isPathActive={isPathActive}
                    onClose={onClose}
                  />

                  <MobileDropdown
                    label={t('nav.album')}
                    items={albumItems}
                    isOpen={mobileOpenDropdown === 'album'}
                    onToggle={() => onToggleDropdown('album')}
                    isPathActive={isPathActive}
                    onClose={onClose}
                  />

                  <MobileDropdown
                    label={t('nav.community')}
                    items={communityItems}
                    isOpen={mobileOpenDropdown === 'community'}
                    onToggle={() => onToggleDropdown('community')}
                    isPathActive={isPathActive}
                    onClose={onClose}
                  />
                </div>

                <div className="border-t border-coastal-gray/20 my-4 pt-4">
                  {auth?.user ? (
                    <>
                      <Link
                        href="/account"
                        className="block py-3 font-serif font-bold text-deep-ocean hover:text-jeju-ocean break-words rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
                        onClick={onClose}
                      >
                        {auth.profile?.nickname ?? t('memberNav.account')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          void auth.signOut();
                          onClose();
                        }}
                        className="block w-full text-left py-3 font-serif font-bold text-coastal-gray hover:text-sunset-coral break-words rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
                      >
                        {t('memberNav.signout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block py-3 font-serif font-bold text-deep-ocean hover:text-jeju-ocean break-words rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
                        onClick={onClose}
                      >
                        {t('memberNav.login')}
                      </Link>
                      <Link
                        href="/signup"
                        className="block py-3 font-serif font-bold text-jeju-ocean hover:text-deep-ocean break-words rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
                        onClick={onClose}
                      >
                        {t('memberNav.signup')}
                      </Link>
                    </>
                  )}
                </div>

                <div className="mt-4 flex justify-center">
                  <LanguageSwitcher
                    className="border-coastal-gray text-coastal-gray hover:text-white"
                    isScrolled={true}
                  />
                </div>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

MobileMenu.displayName = 'MobileMenu';

interface MobileDropdownProps {
  label: string;
  items: { nameKey?: string; label?: string; path: string }[];
  isOpen: boolean;
  onToggle: () => void;
  isPathActive: (path: string, exact?: boolean) => boolean;
  onClose: () => void;
}

const MobileDropdown: React.FC<MobileDropdownProps> = React.memo(
  ({ label, items, isOpen, onToggle, isPathActive, onClose }) => {
    const { t } = useTranslation();

    return (
      <>
        <button
          type="button"
          onClick={onToggle}
          className="w-full text-left py-3 font-serif font-bold text-deep-ocean flex justify-between items-center break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-sm"
          aria-expanded={isOpen}
          aria-controls={`mobile-dropdown-${label}`}
        >
          {label}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none"
            aria-hidden="true"
          >
            ▼
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={`mobile-dropdown-${label}`}
              {...menuReveal}
              className="origin-top pl-4 overflow-hidden"
            >
              {items.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`block py-3 font-serif font-bold text-sm break-words rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean ${
                    isPathActive(item.path)
                      ? 'text-jeju-ocean bg-ocean-sand/70'
                      : 'text-deep-ocean hover:text-jeju-ocean'
                  }`}
                  aria-current={isPathActive(item.path) ? 'page' : undefined}
                  onClick={onClose}
                >
                  {item.label ?? (item.nameKey ? t(item.nameKey) : '')}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }
);

MobileDropdown.displayName = 'MobileDropdown';

export default MobileMenu;
