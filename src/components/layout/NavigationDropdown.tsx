import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface DropdownItem {
  name: string;
  path: string;
}

interface NavigationDropdownProps {
  label: string;
  items: DropdownItem[];
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const NavigationDropdown: React.FC<NavigationDropdownProps> = ({
  label,
  items,
  isOpen = false,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const open = onOpenChange !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

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

  const isActive = items.some(item => location.pathname === item.path || location.pathname.startsWith(item.path.split('/').slice(0, -1).join('/')));

  return (
    <div className="relative group" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 ${
          isActive || open
            ? 'text-jeju-ocean font-bold'
            : 'text-coastal-gray hover:text-jeju-ocean'
        } transition-colors duration-300 font-serif py-2`}
      >
        {label}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50"
          >
            <div className="py-2">
              {items.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 ${
                    location.pathname === item.path
                      ? 'bg-ocean-sand text-jeju-ocean font-semibold'
                      : 'text-deep-ocean hover:bg-ocean-sand/50'
                  } transition-colors duration-200 font-serif`}
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavigationDropdown;
