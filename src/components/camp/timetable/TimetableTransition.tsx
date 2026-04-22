import React from 'react';
import { useTranslation } from 'next-i18next';

interface TimetableTransitionProps {
  minutes: number;
}

const TimetableTransition: React.FC<TimetableTransitionProps> = ({ minutes }) => {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center justify-center py-1"
      role="presentation"
      aria-hidden="true"
    >
      <span className="inline-flex items-center gap-1 rounded-full bg-ocean-sand px-2.5 py-0.5 text-[11px] font-medium text-coastal-gray">
        <span aria-hidden="true" className="text-jeju-ocean/60">↓</span>
        {t('timetable.transition', { minutes })}
      </span>
    </div>
  );
};

export default TimetableTransition;
