import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IoChevronDown } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

interface DropdownItem {
  nameKey: string;
  path: string;
}

interface NavigationDropdownProps {
  label: string;
  items: DropdownItem[];
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isScrolled?: boolean;
}

const NavigationDropdown: React.FC<NavigationDropdownProps> = React.memo(({
  label,
  items,
  isOpen,
  onOpenChange,
  isScrolled
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [internalOpen, setInternalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Controlled vs Uncontrolled state
  const isControlled = isOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? isOpen : internalOpen;

  const setOpen = React.useCallback((newOpen: boolean) => {
    if (isControlled) {
      if (onOpenChange) onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  }, [isControlled, onOpenChange]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  // Check if any item is active
  const isActive = items.some(item => location.pathname === item.path);

  const getTextColor = () => {
    if (isScrolled) {
      return isActive || open
        ? 'text-jeju-ocean font-bold'
        : 'text-coastal-gray hover:text-jeju-ocean';
    }
    return isActive || open
      ? 'text-cloud-white font-bold drop-shadow-md'
      : 'text-cloud-white/90 hover:text-cloud-white drop-shadow-md';
  };

  return (
    <div className="relative group" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center space-x-1 ${getTextColor()} transition-colors duration-300 font-display focus:outline-none`}
        aria-expanded={open}
      >
        <span>{label}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <IoChevronDown className="w-4 h-4 ml-1" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-md shadow-lg rounded-lg overflow-hidden py-2 border border-ocean-mist/20 z-50 text-left"
          >
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 ${location.pathname === item.path
                  ? 'bg-ocean-sand text-jeju-ocean font-semibold'
                  : 'text-deep-ocean hover:bg-ocean-sand/50'
                  } transition-colors duration-200 font-serif`}
                onClick={() => setOpen(false)}
              >
                {t(item.nameKey)}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

NavigationDropdown.displayName = 'NavigationDropdown';
export default NavigationDropdown;
