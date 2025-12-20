import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [desktopOpenDropdown, setDesktopOpenDropdown] = useState<string | null>(null);
    const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    // Scroll detection with requestAnimationFrame throttling
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Check initial state
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        isScrolled,
        desktopOpenDropdown,
        mobileOpenDropdown,
        location,
        toggleMenu,
        closeMenu,
        toggleMobileDropdown,
        handleDesktopDropdownChange,
    };
};
