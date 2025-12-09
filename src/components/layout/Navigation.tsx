import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: '홈', path: '/' },
    { name: '뮤지션 (앨범)', path: '/musicians' },
    { name: '수록곡 (앨범)', path: '/tracks' },
    { name: '갤러리', path: '/gallery' },
    { name: '공연영상', path: '/videos' },
    { name: '언론보도', path: '/press' },
  ];

  return (
    <nav className="fixed w-full bg-light-beige/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold font-serif text-deep-sage hover:text-sage-gray transition-colors">
            이름을 모르는 먼 곳의 그대에게
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  location.pathname === item.path
                    ? 'text-deep-sage'
                    : 'text-text-dark hover:text-deep-sage'
                } transition-colors duration-300 font-serif`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-deep-sage"
                    layoutId="underline"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text-dark hover:text-deep-sage transition-colors"
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
              className="md:hidden bg-light-beige/80 backdrop-blur-md"
            >
              <div className="container mx-auto px-4 py-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block py-2 ${
                      location.pathname === item.path
                        ? 'text-deep-sage'
                        : 'text-text-dark'
                    } font-serif`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
