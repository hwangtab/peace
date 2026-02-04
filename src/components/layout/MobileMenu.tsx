import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Location } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { simpleMenuItems, campItems, albumItems } from './navigationData';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface MobileMenuProps {
    isOpen: boolean;
    location: Location;
    mobileOpenDropdown: string | null;
    onClose: () => void;
    onToggleDropdown: (dropdown: string) => void;
}



const MobileMenu: React.FC<MobileMenuProps> = React.memo(({
    isOpen,
    location,
    mobileOpenDropdown,
    onClose,
    onToggleDropdown,
}) => {
    const { t } = useTranslation();

    return (
        <div className="mobile-menu-wrapper" data-testid="mobile-menu">
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-cloud-white/95 backdrop-blur-md border-t border-seafoam"
                    >
                        <div className="container mx-auto px-4 py-4">
                            {simpleMenuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`block py-2 ${location.pathname === item.path
                                        ? 'text-jeju-ocean font-bold'
                                        : 'text-coastal-gray'
                                        } font-serif`}
                                    onClick={onClose}
                                >
                                    {t(item.nameKey)}
                                </Link>
                            ))}

                            {/* Mobile Dropdowns */}
                            <div className="border-t border-coastal-gray/20 my-4 pt-4">
                                <MobileDropdown
                                    label={t('nav.camp')}
                                    dropdownId="camps"
                                    items={campItems}
                                    isOpen={mobileOpenDropdown === 'camps'}
                                    onToggle={() => onToggleDropdown('camps')}
                                    onClose={onClose}
                                />

                                <MobileDropdown
                                    label={t('nav.album')}
                                    dropdownId="album"
                                    items={albumItems}
                                    isOpen={mobileOpenDropdown === 'album'}
                                    onToggle={() => onToggleDropdown('album')}
                                    onClose={onClose}
                                />
                            </div>

                            <div className="mt-4 flex justify-center">
                                <LanguageSwitcher className="border-coastal-gray text-coastal-gray hover:text-white" isScrolled={true} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

MobileMenu.displayName = 'MobileMenu';

interface MobileDropdownProps {
    label: string;
    dropdownId: string;
    items: { nameKey: string; path: string }[];
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

const MobileDropdown: React.FC<MobileDropdownProps> = React.memo(({
    label,
    dropdownId,
    items,
    isOpen,
    onToggle,
    onClose,
}) => {
    const { t } = useTranslation();

    return (
        <>
            <button
                onClick={onToggle}
                className="w-full text-left py-2 font-serif text-deep-ocean flex justify-between items-center"
                aria-expanded={isOpen}
            >
                {label}
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="pointer-events-none"
                >
                    ▼
                </motion.span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 overflow-hidden"
                    >
                        {items.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="block py-2 text-deep-ocean hover:text-jeju-ocean font-serif text-sm"
                                onClick={onClose}
                            >
                                {t(item.nameKey)}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
});

MobileDropdown.displayName = 'MobileDropdown';

export default MobileMenu;
