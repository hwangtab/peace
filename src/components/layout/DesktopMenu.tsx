import React from 'react';
import { Link, Location } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavigationDropdown from './NavigationDropdown';
import { campItems, albumItems } from './navigationData';

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
                to="/"
                className={`${location.pathname === '/'
                        ? 'text-jeju-ocean font-bold'
                        : 'text-coastal-gray hover:text-jeju-ocean'
                    } transition-colors duration-300 font-display relative`}
            >
                홈
                {location.pathname === '/' && (
                    <motion.div
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-golden-sun"
                        layoutId="underline"
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

            {[
                { name: '갤러리', path: '/gallery' },
                { name: '비디오', path: '/videos' },
                { name: '언론보도', path: '/press' },
            ].map((item) => (
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
                            layoutId="underline"
                        />
                    )}
                </Link>
            ))}
        </div>
    );
};

export default DesktopMenu;
