import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

interface EventFilterProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  colorScheme?: 'ocean' | 'orange';
  filterOrder?: 'gallery' | 'press' | 'videos';
}

interface FilterItem {
  id: string;
  label: string;
}

const EventFilter: React.FC<EventFilterProps> = ({
  selectedFilter,
  onFilterChange,
  colorScheme = 'ocean',
  filterOrder = 'gallery',
}) => {
  const filters = useMemo((): FilterItem[] => {
    if (filterOrder === 'press') {
      return [
        { id: 'all', label: '전체' },
        { id: 'album-2024', label: '2024 앨범' },
        { id: 'camp-2023', label: '2023 캠프' },
        { id: 'camp-2025', label: '2025 캠프' },
      ];
    }

    return [
      { id: 'all', label: '전체' },
      { id: 'camp-2023', label: '2023 캠프' },
      { id: 'album-2024', label: '2024 앨범' },
      { id: 'camp-2025', label: '2025 캠프' },
    ];
  }, [filterOrder]);

  const getColorClasses = useCallback((isActive: boolean): string => {
    if (colorScheme === 'orange') {
      return isActive
        ? 'bg-orange-600 text-white shadow-md'
        : 'bg-white text-orange-600 border-2 border-orange-600 hover:bg-orange-600 hover:text-white';
    }

    return isActive
      ? 'bg-jeju-ocean text-white shadow-md'
      : 'bg-white text-jeju-ocean border-2 border-jeju-ocean hover:bg-jeju-ocean hover:text-white';
  }, [colorScheme]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-nowrap gap-1.5 sm:gap-2 md:gap-3 justify-center mb-6 sm:mb-8"
    >
      {filters.map((filter) => {
        const isActive = selectedFilter === filter.id;

        return (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-2.5 py-2 sm:px-4 sm:py-2.5 md:px-6 rounded-full text-xs sm:text-sm md:text-base font-medium transition-colors min-h-[44px] sm:min-h-0 ${getColorClasses(isActive)}`}
          >
            {filter.label}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default EventFilter;
