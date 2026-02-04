import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigation } from '../../hooks/useNavigation';
import DesktopMenu from './DesktopMenu';
import MobileMenu from './MobileMenu';

import { useTranslation } from 'react-i18next';
// ...
const Navigation = () => {
  const { t } = useTranslation();
  const {
    isScrolled,
    isOpen,
    location,
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
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-cloud-white/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className={`text-2xl font-bold font-serif transition-colors duration-300 ${isScrolled
                ? 'text-jeju-ocean hover:text-ocean-mist'
                : 'text-cloud-white hover:text-seafoam drop-shadow-md'
                }`}
            >
              {t('nav.logo')}
            </Link>

            {/* Desktop Menu */}
            <DesktopMenu
              location={location}
              desktopOpenDropdown={desktopOpenDropdown}
              onOpenChange={handleDesktopDropdownChange}
              isScrolled={isScrolled}
            />

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className={`transition-colors duration-300 ${isScrolled
                  ? 'text-coastal-gray hover:text-jeju-ocean'
                  : 'text-cloud-white hover:text-seafoam'
                  }`}
                aria-label={isOpen ? t('nav.close_menu') : t('nav.open_menu')}
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isOpen}
          location={location}
          mobileOpenDropdown={mobileOpenDropdown}
          onClose={closeMenu}
          onToggleDropdown={toggleMobileDropdown}
        />
      </nav>
    </>
  );
};

export default Navigation;
