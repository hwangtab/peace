import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useCountUp } from './useCountUp';

interface StatCardProps {
  valueKey: string;
  suffixKey: string;
  labelKey: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ valueKey, suffixKey, labelKey, delay = 0 }) => {
  const { t } = useTranslation();
  const raw = parseInt(t(valueKey), 10);
  const target = isNaN(raw) ? 0 : raw;
  const { ref, displayValue } = useCountUp({ target, duration: 2000, delay });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="text-center"
    >
      <p className="font-partial text-2xl sm:text-3xl md:text-4xl text-golden-sun whitespace-nowrap" aria-live="polite">
        {displayValue.toLocaleString()}
        <span className="text-base sm:text-xl md:text-2xl">{t(suffixKey)}</span>
      </p>
      <p className="font-caption text-xs sm:text-sm text-gray-400 mt-2 break-words">
        {t(labelKey)}
      </p>
    </motion.div>
  );
};

const stats = [
  { valueKey: 'gangjeong_story.stat_years_value', suffixKey: 'gangjeong_story.stat_years_suffix', labelKey: 'gangjeong_story.stat_years_label', delay: 0 },
  { valueKey: 'gangjeong_story.stat_days_value', suffixKey: 'gangjeong_story.stat_days_suffix', labelKey: 'gangjeong_story.stat_days_label', delay: 150 },
  { valueKey: 'gangjeong_story.stat_teams_value', suffixKey: 'gangjeong_story.stat_teams_suffix', labelKey: 'gangjeong_story.stat_teams_label', delay: 300 },
  { valueKey: 'gangjeong_story.stat_countries_value', suffixKey: 'gangjeong_story.stat_countries_suffix', labelKey: 'gangjeong_story.stat_countries_label', delay: 450 },
];

const ImpactNumbers: React.FC = () => {
  return (
    <div className="bg-deep-ocean py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-golden-sun/30 to-transparent mb-10 sm:mb-14" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <StatCard key={stat.valueKey} {...stat} />
          ))}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-golden-sun/30 to-transparent mt-10 sm:mt-14" />
      </div>
    </div>
  );
};

export default ImpactNumbers;
