import React from 'react';
import { useTranslation } from 'next-i18next';
import { Scale } from './types';

interface ScaleBadgeProps {
  scale: Scale;
  className?: string;
}

const STYLE_MAP: Record<Scale, string> = {
  'solo': 'bg-seafoam text-jeju-ocean',
  'band': 'bg-ocean-mist text-white',
  'big-band': 'bg-jeju-ocean text-white',
  'ensemble': 'bg-sunset-gradient text-white',
};

const I18N_KEY: Record<Scale, string> = {
  'solo': 'timetable.scale.solo',
  'band': 'timetable.scale.band',
  'big-band': 'timetable.scale.big_band',
  'ensemble': 'timetable.scale.ensemble',
};

const ScaleBadge: React.FC<ScaleBadgeProps> = ({ scale, className = '' }) => {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold tracking-wide ${STYLE_MAP[scale]} ${className}`}
    >
      {t(I18N_KEY[scale])}
    </span>
  );
};

export default ScaleBadge;
