import React from 'react';
import { Link, Location } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { simpleMenuItems, campItems, albumItems } from './navigationData';

interface MobileMenuProps {
    isOpen: boolean;
    location: Location;
    mobileOpenDropdown: string | null;
    onClose: () => void;
    onToggleDropdown: (dropdown: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen,
    location,
    mobileOpenDropdown,
    onClose,
    onToggleDropdown,
}) => {
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
                                    {item.name}
                                </Link>
                            ))}

                            {/* Mobile Dropdowns */}
                            <div className="border-t border-coastal-gray/20 my-4 pt-4">
                                <MobileDropdown
                                    label="캠프"
                                    dropdownId="camps"
                                    items={campItems}
                                    isOpen={mobileOpenDropdown === 'camps'}
                                    onToggle={() => onToggleDropdown('camps')}
                                    onClose={onClose}
                                />
                                <MobileDropdown
                                    label="앨범"
                                    dropdownId="album"
                                    items={albumItems}
                                    isOpen={mobileOpenDropdown === 'album'}
                                    onToggle={() => onToggleDropdown('album')}
                                    onClose={onClose}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface MobileDropdownProps {
    label: string;
    dropdownId: string;
    items: { name: string; path: string }[];
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

const MobileDropdown: React.FC<MobileDropdownProps> = ({
    label,
    dropdownId,
    items,
    isOpen,
    onToggle,
    onClose,
}) => (
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
                            {item.name}
                        </Link>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    </>
);

export default MobileMenu;
