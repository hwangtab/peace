import Link from 'next/link';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useNavigation } from '@/hooks/useNavigation';
import DesktopMenu from './DesktopMenu';
import MobileMenu from './MobileMenu';

import { useTranslation } from 'next-i18next';
// ...
const Navigation = () => {
  const { t } = useTranslation();
  const {
    isScrolled,
    isOpen,
    isPathActive,
    desktopOpenDropdown,
    mobileOpenDropdown,
    toggleMenu,
    closeMenu,
    handleDesktopDropdownChange,
    toggleMobileDropdown,
  } = useNavigation();

  return (
    <>
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-jeju-ocean focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        {t('nav.skip_to_main')}
      </a>
      <nav
        aria-label="Main"
        className={`fixed w-full z-50 transition-[background-color,box-shadow] duration-300 ${
          isScrolled ? 'bg-cloud-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center min-h-[4rem] py-2 gap-4">
            <Link
              href="/"
              className={`text-lg sm:text-xl lg:text-2xl font-bold font-serif transition-colors duration-300 text-balance min-w-0 break-words rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean ${
                isScrolled
                  ? 'text-jeju-ocean hover:text-ocean-mist'
                  : 'text-cloud-white hover:text-seafoam drop-shadow-md'
              }`}
            >
              {t('nav.logo')}
            </Link>

            {/* Desktop Menu */}
            <DesktopMenu
              isPathActive={isPathActive}
              desktopOpenDropdown={desktopOpenDropdown}
              onOpenChange={handleDesktopDropdownChange}
              isScrolled={isScrolled}
            />

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={toggleMenu}
                className={`transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded ${
                  isScrolled
                    ? 'text-coastal-gray hover:text-jeju-ocean'
                    : 'text-cloud-white hover:text-seafoam'
                }`}
                aria-label={isOpen ? t('nav.close_menu') : t('nav.open_menu')}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                {isOpen ? (
                  <HiOutlineX aria-hidden="true" className="h-6 w-6" />
                ) : (
                  <HiOutlineMenu aria-hidden="true" className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isOpen}
          isPathActive={isPathActive}
          mobileOpenDropdown={mobileOpenDropdown}
          onClose={closeMenu}
          onToggleDropdown={toggleMobileDropdown}
        />
      </nav>

      {/* Backdrop — closes menu when tapping outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={closeMenu} aria-hidden="true" />
      )}
    </>
  );
};

export default Navigation;
