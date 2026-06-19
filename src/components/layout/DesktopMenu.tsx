import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { m as motion } from 'framer-motion';
import NavigationDropdown from './NavigationDropdown';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { campItems, albumItems, simpleMenuItems } from './navigationData';
import { ROUTES } from '@/constants/routes';
import { NavigationDropdownKey } from '@/hooks/useNavigation';
import { useOptionalAuth } from '@/components/auth/AuthProvider';

interface DesktopMenuProps {
  isPathActive: (path: string, exact?: boolean) => boolean;
  desktopOpenDropdown: NavigationDropdownKey | null;
  onOpenChange: (dropdown: NavigationDropdownKey, isOpen: boolean) => void;
  isScrolled: boolean;
}

const DesktopMenu: React.FC<DesktopMenuProps> = React.memo(
  ({ isPathActive, desktopOpenDropdown, onOpenChange, isScrolled }) => {
    const { t } = useTranslation();
    const auth = useOptionalAuth();

    const getTextColor = (isActive: boolean) => {
      if (isScrolled) {
        return isActive ? 'text-jeju-ocean font-bold' : 'text-coastal-gray hover:text-jeju-ocean';
      }
      return isActive
        ? 'text-cloud-white font-bold drop-shadow-md'
        : 'text-cloud-white/90 hover:text-cloud-white drop-shadow-md';
    };

    return (
      <div className="hidden xl:flex items-center gap-x-3 2xl:gap-x-4">
        <Link
          href={ROUTES.HOME}
          className={`${getTextColor(isPathActive(ROUTES.HOME, true))} transition-colors duration-300 font-display font-bold relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-sm`}
          aria-current={isPathActive(ROUTES.HOME, true) ? 'page' : undefined}
        >
          {t('nav.home')}
          {isPathActive(ROUTES.HOME, true) && (
            <motion.span
              className={`absolute bottom-[-4px] left-0 w-full h-0.5 ${isScrolled ? 'bg-golden-sun' : 'bg-cloud-white'}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </Link>

        <NavigationDropdown
          label={t('nav.camp')}
          items={campItems}
          isOpen={desktopOpenDropdown === 'camps'}
          onOpenChange={(isOpen) => onOpenChange('camps', isOpen)}
          isScrolled={isScrolled}
        />
        <NavigationDropdown
          label={t('nav.album')}
          items={albumItems}
          isOpen={desktopOpenDropdown === 'album'}
          onOpenChange={(isOpen) => onOpenChange('album', isOpen)}
          isScrolled={isScrolled}
        />

        {simpleMenuItems
          .filter((item) => item.path !== ROUTES.HOME) // '홈'은 별도 처리
          .map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${getTextColor(isPathActive(item.path))} transition-colors duration-300 font-display font-bold relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-sm`}
              aria-current={isPathActive(item.path) ? 'page' : undefined}
            >
              {t(item.nameKey)}
              {isPathActive(item.path) && (
                <motion.span
                  className={`absolute bottom-[-4px] left-0 w-full h-0.5 ${isScrolled ? 'bg-golden-sun' : 'bg-cloud-white'}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          ))}

        <div className="pl-2 ml-2 sm:pl-4 sm:ml-4 border-l border-white/30 flex items-center gap-x-2">
          {auth?.user ? (
            <>
              <Link
                href="/account"
                className={`text-sm font-semibold transition-colors duration-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean ${
                  isScrolled
                    ? 'text-deep-ocean hover:text-jeju-ocean'
                    : 'text-cloud-white/90 hover:text-cloud-white drop-shadow-md'
                }`}
              >
                {auth.profile?.nickname ?? t('memberNav.account')}
              </Link>
              <button
                type="button"
                onClick={() => void auth.signOut()}
                className={`text-sm font-semibold transition-colors duration-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean ${
                  isScrolled
                    ? 'text-coastal-gray hover:text-sunset-coral'
                    : 'text-cloud-white/70 hover:text-cloud-white drop-shadow-md'
                }`}
              >
                {t('memberNav.signout')}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-semibold transition-colors duration-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean ${
                  isScrolled
                    ? 'text-deep-ocean hover:text-jeju-ocean'
                    : 'text-cloud-white/90 hover:text-cloud-white drop-shadow-md'
                }`}
              >
                {t('memberNav.login')}
              </Link>
              <Link
                href="/signup"
                className={`text-sm font-semibold rounded px-3 py-1.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean ${
                  isScrolled
                    ? 'bg-jeju-ocean text-white hover:bg-deep-ocean'
                    : 'bg-cloud-white/20 text-cloud-white hover:bg-cloud-white/30 border border-cloud-white/50'
                }`}
              >
                {t('memberNav.signup')}
              </Link>
            </>
          )}
          <LanguageSwitcher isScrolled={isScrolled} />
        </div>
      </div>
    );
  }
);

DesktopMenu.displayName = 'DesktopMenu';
export default DesktopMenu;
