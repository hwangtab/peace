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

interface VariantColors {
  numberColor: string;
  labelColor: string;
  dividerVia: string;
}

const StatCard: React.FC<StatCardProps & { colors: VariantColors }> = ({ valueKey, suffixKey, labelKey, delay = 0, colors }) => {
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
      <p className={`font-partial font-normal text-2xl sm:text-3xl md:text-4xl ${colors.numberColor} whitespace-nowrap tabular-nums`} aria-live="polite">
        {displayValue.toLocaleString()}
        <span className="text-base sm:text-xl md:text-2xl">{t(suffixKey)}</span>
      </p>
      <p className={`font-caption font-light text-xs sm:text-sm ${colors.labelColor} mt-2 break-words`}>
        {t(labelKey)}
      </p>
    </motion.div>
  );
};

const stats = [
  { valueKey: 'gangjeong_story.stat_years_value', suffixKey: 'gangjeong_story.stat_years_suffix', labelKey: 'gangjeong_story.stat_years_label', delay: 0 },
  { valueKey: 'gangjeong_story.stat_days_value', suffixKey: 'gangjeong_story.stat_days_suffix', labelKey: 'gangjeong_story.stat_days_label', delay: 150 },
  { valueKey: 'gangjeong_story.stat_teams_value', suffixKey: 'gangjeong_story.stat_teams_suffix', labelKey: 'gangjeong_story.stat_teams_label', delay: 300 },
];

interface Props {
  variant?: 'camp' | 'home';
}

const variantColors: Record<'camp' | 'home', VariantColors> = {
  camp: { numberColor: 'text-golden-sun', labelColor: 'text-gray-400', dividerVia: 'via-golden-sun/30' },
  home: { numberColor: 'text-seafoam', labelColor: 'text-sky-horizon', dividerVia: 'via-seafoam/30' },
};

const ImpactNumbers: React.FC<Props> = ({ variant = 'camp' }) => {
  const colors = variantColors[variant];
  return (
    <div className={`${variant === 'home' ? 'bg-jeju-ocean' : 'bg-deep-ocean'} py-12 sm:py-16 md:py-20`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`h-px bg-gradient-to-r from-transparent ${colors.dividerVia} to-transparent mb-10 sm:mb-14`} />
        <div className="grid grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <StatCard key={stat.valueKey} {...stat} colors={colors} />
          ))}
        </div>
        <div className={`h-px bg-gradient-to-r from-transparent ${colors.dividerVia} to-transparent mt-10 sm:mt-14`} />
      </div>
    </div>
  );
};

export default ImpactNumbers;
