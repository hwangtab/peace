import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { m as motion } from 'framer-motion';
import NavigationDropdown from './NavigationDropdown';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { campItems, albumItems, simpleMenuItems } from './navigationData';
import { ROUTES } from '@/constants/routes';
import { NavigationDropdownKey } from '@/hooks/useNavigation';
import { useCommunityBoards } from '@/hooks/useCommunityBoards';
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
    const communityItems = useCommunityBoards();

    const getTextColor = (isActive: boolean) => {
      if (isScrolled) {
        return isActive ? 'text-jeju-ocean font-bold' : 'text-coastal-gray hover:text-jeju-ocean';
      }
      return isActive
        ? 'text-cloud-white font-bold drop-shadow-md'
        : 'text-cloud-white/90 hover:text-cloud-white drop-shadow-md';
    };

    // 인증 영역을 언어 선택기와 같은 명조체(font-display) 알약으로 통일한다.
    const pillBase =
      'font-display font-bold text-sm px-3 py-2 rounded border whitespace-nowrap transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean';
    const ghostPill = isScrolled
      ? 'bg-transparent text-jeju-ocean border-jeju-ocean hover:bg-jeju-ocean hover:text-white'
      : 'bg-transparent text-cloud-white border-cloud-white hover:bg-cloud-white hover:text-jeju-ocean';
    const filledPill = isScrolled
      ? 'bg-jeju-ocean text-white border-jeju-ocean hover:bg-deep-ocean hover:border-deep-ocean'
      : 'bg-cloud-white text-jeju-ocean border-cloud-white hover:bg-cloud-white/90';
    const mutedPill = isScrolled
      ? 'bg-transparent text-coastal-gray border-coastal-gray/40 hover:text-sunset-coral hover:border-sunset-coral'
      : 'bg-transparent text-cloud-white/80 border-cloud-white/50 hover:bg-cloud-white/10 hover:text-cloud-white';

    return (
      <div className="hidden nav:flex items-center gap-x-4 2xl:gap-x-6">
        <Link
          href={ROUTES.HOME}
          prefetch={false}
          className={`${getTextColor(isPathActive(ROUTES.HOME, true))} whitespace-nowrap transition-colors duration-300 font-display font-bold relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-sm`}
          aria-current={isPathActive(ROUTES.HOME, true) ? 'page' : undefined}
        >
          {t('nav.home')}
          {isPathActive(ROUTES.HOME, true) && (
            <motion.span
              className={`absolute bottom-[-4px] start-0 w-full h-0.5 ${isScrolled ? 'bg-golden-sun' : 'bg-cloud-white'}`}
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
              // 상단 메뉴는 뷰포트 안이라 gallery/videos/press 페이지 데이터를 방문 즉시
              // 내려받았다(videos.json 63KB + press.json 49KB + gallery.json 25KB).
              // Pages Router 에서 prefetch={false} 는 hover 시 프리페치를 유지하므로
              // 데스크톱 이동 체감은 그대로고, 첫 로드 트래픽만 사라진다.
              prefetch={false}
              className={`${getTextColor(isPathActive(item.path))} whitespace-nowrap transition-colors duration-300 font-display font-bold relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-sm`}
              aria-current={isPathActive(item.path) ? 'page' : undefined}
            >
              {t(item.nameKey)}
              {isPathActive(item.path) && (
                <motion.span
                  className={`absolute bottom-[-4px] start-0 w-full h-0.5 ${isScrolled ? 'bg-golden-sun' : 'bg-cloud-white'}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          ))}

        <NavigationDropdown
          label={t('nav.community')}
          items={communityItems}
          isOpen={desktopOpenDropdown === 'community'}
          onOpenChange={(isOpen) => onOpenChange('community', isOpen)}
          isScrolled={isScrolled}
        />

        <div
          className={`ps-2 ms-2 sm:ps-4 sm:ms-4 border-s flex shrink-0 items-center gap-x-2 ${
            isScrolled ? 'border-deep-ocean/15' : 'border-cloud-white/30'
          }`}
        >
          {auth?.user ? (
            <>
              <Link
                href="/account"
                prefetch={false}
                className={`${pillBase} ${ghostPill} block max-w-[10rem] truncate`}
              >
                {auth.profile?.nickname ?? t('memberNav.account')}
              </Link>
              <button
                type="button"
                onClick={() => void auth.signOut()}
                className={`${pillBase} ${mutedPill}`}
              >
                {t('memberNav.signout')}
              </button>
            </>
          ) : (
            <>
              {/* 익명 방문자 대부분은 로그인하지 않는다 — login.json(18KB)은 hover 때만. */}
              <Link href="/login" prefetch={false} className={`${pillBase} ${ghostPill}`}>
                {t('memberNav.login')}
              </Link>
              <Link href="/signup" className={`${pillBase} ${filledPill}`}>
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
