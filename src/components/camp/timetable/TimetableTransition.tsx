import React from 'react';
import { useTranslation } from 'next-i18next';

interface TimetableTransitionProps {
  minutes: number;
}

const TimetableTransition: React.FC<TimetableTransitionProps> = ({ minutes }) => {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center gap-2 py-2 pl-4 text-xs text-coastal-gray/70"
      role="presentation"
      aria-hidden="true"
    >
      <span className="flex-1 border-t border-dashed border-coastal-gray/30" />
      <span className="whitespace-nowrap">{t('timetable.transition', { minutes })}</span>
      <span className="flex-1 border-t border-dashed border-coastal-gray/30" />
    </div>
  );
};

export default TimetableTransition;
