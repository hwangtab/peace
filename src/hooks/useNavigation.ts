import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const useNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [desktopOpenDropdown, setDesktopOpenDropdown] = useState<string | null>(null);
    const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
    const location = useLocation();

    const toggleMenu = useCallback(() => {
        setIsOpen((prev) => {
            const newState = !prev;
            if (newState) setMobileOpenDropdown(null);
            return newState;
        });
    }, []);

    const closeMenu = useCallback(() => {
        setIsOpen(false);
        setMobileOpenDropdown(null);
    }, []);

    const toggleMobileDropdown = useCallback((dropdown: string) => {
        setMobileOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
    }, []);

    const handleDesktopDropdownChange = useCallback((dropdown: string, isOpen: boolean) => {
        setDesktopOpenDropdown(isOpen ? dropdown : null);
    }, []);

    return {
        isOpen,
        desktopOpenDropdown,
        mobileOpenDropdown,
        location,
        toggleMenu,
        closeMenu,
        toggleMobileDropdown,
        handleDesktopDropdownChange,
    };
};
