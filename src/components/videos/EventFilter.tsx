import React from 'react';
import { motion } from 'framer-motion';

interface VideoEventFilterProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

const VideoEventFilter: React.FC<VideoEventFilterProps> = ({ selectedFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: '전체' },
    { id: 'camp-2023', label: '2023 캠프' },
    { id: 'album-2024', label: '2024 앨범' },
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
          className={`px-6 py-2 rounded-full font-medium transition-colors ${selectedFilter === filter.id
            ? 'bg-jeju-ocean text-white shadow-md'
            : 'bg-white text-jeju-ocean border-2 border-jeju-ocean hover:bg-jeju-ocean hover:text-white'
            }`}
        >
          {filter.label}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default VideoEventFilter;
