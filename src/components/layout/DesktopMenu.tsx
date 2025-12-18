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
}

const DesktopMenu: React.FC<DesktopMenuProps> = ({
    location,
    desktopOpenDropdown,
    onOpenChange,
}) => {
    return (
        <div className="hidden md:flex items-center space-x-8">
            <Link
                to={ROUTES.HOME}
                className={`${location.pathname === ROUTES.HOME
                    ? 'text-jeju-ocean font-bold'
                    : 'text-coastal-gray hover:text-jeju-ocean'
                    } transition-colors duration-300 font-display relative`}
            >
                홈
                {location.pathname === ROUTES.HOME && (
                    <motion.div
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-golden-sun"
                        layoutId="underline-home"
                    />
                )}
            </Link>

            <NavigationDropdown
                label="캠프"
                items={campItems}
                isOpen={desktopOpenDropdown === 'camps'}
                onOpenChange={(isOpen) => onOpenChange('camps', isOpen)}
            />
            <NavigationDropdown
                label="앨범"
                items={albumItems}
                isOpen={desktopOpenDropdown === 'album'}
                onOpenChange={(isOpen) => onOpenChange('album', isOpen)}
            />

            {simpleMenuItems
                .filter(item => item.path !== ROUTES.HOME) // '홈'은 별도 처리
                .map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`${location.pathname === item.path
                            ? 'text-jeju-ocean font-bold'
                            : 'text-coastal-gray hover:text-jeju-ocean'
                            } transition-colors duration-300 font-display relative`}
                    >
                        {item.name}
                        {location.pathname === item.path && (
                            <motion.div
                                className="absolute bottom-0 left-0 w-full h-0.5 bg-golden-sun"
                                layoutId={`underline-${item.path}`}
                            />
                        )}
                    </Link>
                ))}
        </div>
    );
};

export default DesktopMenu;
