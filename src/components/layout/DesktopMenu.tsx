import React from 'react';
import { Link, Location } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavigationDropdown from './NavigationDropdown';
import { campItems, albumItems, simpleMenuItems } from './navigationData';
import { ROUTES } from '../../constants/routes';

interface DesktopMenuProps {
    location: Location;
    desktopOpenDropdown: string | null;
    onOpenChange: (dropdown: string, isOpen: boolean) => void;
    isScrolled: boolean;
}

const DesktopMenu: React.FC<DesktopMenuProps> = React.memo(({
    location,
    desktopOpenDropdown,
    onOpenChange,
    isScrolled,
}) => {
    // Dynamic text colors based on scroll position
    const getTextColor = (isActive: boolean) => {
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
        <div className="hidden md:flex items-center space-x-8">
            <Link
                to={ROUTES.HOME}
                className={`${getTextColor(location.pathname === ROUTES.HOME)} transition-colors duration-300 font-display relative`}
            >
                홈
                {location.pathname === ROUTES.HOME && (
                    <motion.div
                        className={`absolute bottom-0 left-0 w-full h-0.5 ${isScrolled ? 'bg-golden-sun' : 'bg-cloud-white'}`}
                        layoutId="underline-home"
                    />
                )}
            </Link>

            <NavigationDropdown
                label="캠프"
                items={campItems}
                isOpen={desktopOpenDropdown === 'camps'}
                onOpenChange={(isOpen) => onOpenChange('camps', isOpen)}
                isScrolled={isScrolled}
            />
            <NavigationDropdown
                label="앨범"
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
                        to={item.path}
                        className={`${getTextColor(location.pathname === item.path)} transition-colors duration-300 font-display relative`}
                    >
                        {item.name}
                        {location.pathname === item.path && (
                            <motion.div
                                className={`absolute bottom-0 left-0 w-full h-0.5 ${isScrolled ? 'bg-golden-sun' : 'bg-cloud-white'}`}
                                layoutId={`underline-${item.path}`}
                            />
                        )}
                    </Link>
                ))}
        </div>
    );
});

DesktopMenu.displayName = 'DesktopMenu';
export default DesktopMenu;
