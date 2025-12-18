import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NavigationDropdown from './NavigationDropdown';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [desktopOpenDropdown, setDesktopOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const simpleMenuItems = [
    { name: '홈', path: '/' },
    { name: '갤러리', path: '/gallery' },
    { name: '비디오', path: '/videos' },
    { name: '언론보도', path: '/press' },
  ];

  const campItems = [
    { name: '2023 캠프', path: '/camps/2023' },
    { name: '2025 캠프', path: '/camps/2025' },
    { name: '2026 캠프', path: '/camps/2026' },
    { name: '모든 캠프', path: '/camps' },
  ];

  const albumItems = [
    { name: '앨범 소개', path: '/album/about' },
    { name: '뮤지션', path: '/album/musicians' },
    { name: '수록곡', path: '/album/tracks' },
  ];

  return (
    <nav className="fixed w-full bg-cloud-white/90 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold font-serif text-jeju-ocean hover:text-ocean-mist transition-colors">
            강정피스앤뮤직캠프
          </Link>

          {/* Desktop Menu */}
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
              onOpenChange={(isOpen) => setDesktopOpenDropdown(isOpen ? 'camps' : null)}
            />
            <NavigationDropdown
              label="앨범"
              items={albumItems}
              isOpen={desktopOpenDropdown === 'album'}
              onOpenChange={(isOpen) => setDesktopOpenDropdown(isOpen ? 'album' : null)}
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                if (isOpen) setMobileOpenDropdown(null);
              }}
              className="text-coastal-gray hover:text-jeju-ocean transition-colors"
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
      <div className="mobile-menu-wrapper">
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
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Dropdowns */}
                <div className="border-t border-coastal-gray/20 my-4 pt-4">
                  <button
                    onClick={() => setMobileOpenDropdown(mobileOpenDropdown === 'camps' ? null : 'camps')}
                    className="w-full text-left py-2 font-serif text-deep-ocean flex justify-between items-center"
                  >
                    캠프
                    <motion.span
                      animate={{ rotate: mobileOpenDropdown === 'camps' ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="pointer-events-none"
                    >
                      ▼
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {mobileOpenDropdown === 'camps' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 overflow-hidden"
                      >
                        {campItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="block py-2 text-deep-ocean hover:text-jeju-ocean font-serif text-sm"
                            onClick={() => {
                              setIsOpen(false);
                              setMobileOpenDropdown(null);
                            }}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => setMobileOpenDropdown(mobileOpenDropdown === 'album' ? null : 'album')}
                    className="w-full text-left py-2 font-serif text-deep-ocean flex justify-between items-center"
                  >
                    앨범
                    <motion.span
                      animate={{ rotate: mobileOpenDropdown === 'album' ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="pointer-events-none"
                    >
                      ▼
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {mobileOpenDropdown === 'album' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 overflow-hidden"
                      >
                        {albumItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="block py-2 text-deep-ocean hover:text-jeju-ocean font-serif text-sm"
                            onClick={() => {
                              setIsOpen(false);
                              setMobileOpenDropdown(null);
                            }}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
