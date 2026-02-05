import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NavigationDropdown from './NavigationDropdown';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { campItems, albumItems, simpleMenuItems } from './navigationData';
import { ROUTES } from '../../constants/routes';

interface DesktopMenuProps {
    pathname: string;
    desktopOpenDropdown: string | null;
    onOpenChange: (dropdown: string, isOpen: boolean) => void;
    isScrolled: boolean;
}


// ... (other imports)

// ... (interface)

const DesktopMenu: React.FC<DesktopMenuProps> = React.memo(({
    pathname,
    desktopOpenDropdown,
    onOpenChange,
    isScrolled,
}) => {
    const { t } = useTranslation();

    // Dynamic text colors based on scroll position
    const getTextColor = (isActive: boolean) => {
        // ... (existing logic)
        if (isScrolled) {
            return isActive
                ? 'text-jeju-ocean font-bold'
                : 'text-coastal-gray hover:text-jeju-ocean';
        }
        return isActive
            ? 'text-cloud-white font-bold drop-shadow-md'
            : 'text-cloud-white/90 hover:text-cloud-white drop-shadow-md';
    };

    return (
        <div className="hidden md:flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
                href={ROUTES.HOME}
                className={`${getTextColor(pathname === ROUTES.HOME)} transition-colors duration-300 font-display relative`}
            >
                {t('nav.home')}
                {pathname === ROUTES.HOME && (
                    <motion.div
                        className={`absolute bottom-0 left-0 w-full h-0.5 ${isScrolled ? 'bg-golden-sun' : 'bg-cloud-white'}`}
                        layoutId="underline-home"
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
                .filter(item => item.path !== ROUTES.HOME) // '홈'은 별도 처리
                .map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`${getTextColor(pathname === item.path)} transition-colors duration-300 font-display relative`}
                    >
                        {t(item.nameKey)}
                        {pathname === item.path && (
                            <motion.div
                                className={`absolute bottom-0 left-0 w-full h-0.5 ${isScrolled ? 'bg-golden-sun' : 'bg-cloud-white'}`}
                                layoutId={`underline-${item.path}`}
                            />
                        )}
                    </Link>
                ))}

            <div className="pl-4 border-l border-white/30 ml-4">
                <LanguageSwitcher isScrolled={isScrolled} />
            </div>
        </div>
    );
});

DesktopMenu.displayName = 'DesktopMenu';
export default DesktopMenu;
