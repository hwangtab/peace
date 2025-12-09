import React from 'react';
import { motion } from 'framer-motion';

interface PressEventFilterProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

const PressEventFilter: React.FC<PressEventFilterProps> = ({ selectedFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: '전체' },
    { id: 'album-2024', label: '2024 앨범' },
    { id: 'camp-2023', label: '2023 캠프' },
    { id: 'camp-2025', label: '2025 캠프' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap gap-3 justify-center mb-8"
    >
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            selectedFilter === filter.id
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-orange-600 border-2 border-orange-600 hover:bg-orange-600 hover:text-white'
          }`}
        >
          {filter.label}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default PressEventFilter;
