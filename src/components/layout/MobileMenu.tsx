import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { simpleMenuItems, campItems, albumItems } from './navigationData';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface MobileMenuProps {
    isOpen: boolean;
    pathname: string;
    mobileOpenDropdown: string | null;
    onClose: () => void;
    onToggleDropdown: (dropdown: string) => void;
}



const MobileMenu: React.FC<MobileMenuProps> = React.memo(({
    isOpen,
    pathname,
    mobileOpenDropdown,
    onClose,
    onToggleDropdown,
}) => {
    const { t } = useTranslation();

    return (
        <div id="mobile-menu" className="mobile-menu-wrapper" data-testid="mobile-menu">
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
                                    href={item.path}
                                    className={`block py-2 break-words rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean ${pathname === item.path
                                        ? 'text-jeju-ocean font-bold'
                                        : 'text-coastal-gray'
                                        } font-serif font-bold`}
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
                                    onClose={onClose}
                                />

                                <MobileDropdown
                                    label={t('nav.album')}
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
    items: { nameKey: string; path: string }[];
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

const MobileDropdown: React.FC<MobileDropdownProps> = React.memo(({
    label,
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
                className="w-full text-left py-2 font-serif font-bold text-deep-ocean flex justify-between items-center break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-sm"
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
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id={`mobile-dropdown-${label}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 overflow-hidden"
                    >
                        {items.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className="block py-2 text-deep-ocean hover:text-jeju-ocean font-serif font-bold text-sm break-words rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean"
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
