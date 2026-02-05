import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation();
  const filters = useMemo((): FilterItem[] => {
    if (filterOrder === 'press') {
      return [
        { id: 'all', label: t('common.filter_all') },
        { id: 'album-2024', label: t('common.filter_album_2024') },
        { id: 'camp-2023', label: t('common.filter_camp_2023') },
        { id: 'camp-2025', label: t('common.filter_camp_2025') },
      ];
    }

    return [
      { id: 'all', label: t('common.filter_all') },
      { id: 'camp-2023', label: t('common.filter_camp_2023') },
      { id: 'album-2024', label: t('common.filter_album_2024') },
      { id: 'camp-2025', label: t('common.filter_camp_2025') },
    ];
  }, [filterOrder, t]);

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
      role="group"
      aria-label={t('common.aria_filter')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 justify-center mb-6 sm:mb-8"
    >
      {filters.map((filter) => {
        const isActive = selectedFilter === filter.id;

        return (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={isActive}
            aria-label={`${filter.label} ${isActive ? t('common.aria_filter_selected') : ''}`}
            className={`px-2.5 py-2 sm:px-4 sm:py-2.5 md:px-6 rounded-full text-xs sm:text-sm md:text-base font-medium transition-colors min-h-[44px] sm:min-h-0 text-center whitespace-normal text-balance ${getColorClasses(isActive)}`}
          >
            {filter.label}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default EventFilter;
