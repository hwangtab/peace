import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

interface TimetableTransitionProps {
  minutes: number;
}

const TimetableTransition: React.FC<TimetableTransitionProps> = ({ minutes }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="flex items-center justify-center py-1"
      role="presentation"
      aria-hidden="true"
    >
      <span className="inline-flex items-center gap-1 rounded-full bg-ocean-sand px-2.5 py-0.5 text-[11px] font-medium text-coastal-gray">
        <span aria-hidden="true" className="text-jeju-ocean/60">↓</span>
        {t('timetable.transition', { minutes })}
      </span>
    </motion.div>
  );
};

export default TimetableTransition;
