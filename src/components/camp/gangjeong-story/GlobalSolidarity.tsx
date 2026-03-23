import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

interface LocationCard {
  nameKey: string;
  descKey: string;
  emoji: string;
}

const locations: LocationCard[] = [
  { nameKey: 'gangjeong_story.solidarity_okinawa_name', descKey: 'gangjeong_story.solidarity_okinawa_desc', emoji: '🇯🇵' },
  { nameKey: 'gangjeong_story.solidarity_taiwan_name', descKey: 'gangjeong_story.solidarity_taiwan_desc', emoji: '🇹🇼' },
  { nameKey: 'gangjeong_story.solidarity_gangjeong_name', descKey: 'gangjeong_story.solidarity_gangjeong_desc', emoji: '🇰🇷' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const GlobalSolidarity: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-ocean-sand py-16 sm:py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h3 className="typo-h2 text-gray-900 mb-2">{t('gangjeong_story.solidarity_title')}</h3>
          <p className="typo-body text-gray-500">{t('gangjeong_story.solidarity_subtitle')}</p>
        </motion.div>

        {/* Cards with connecting line */}
        <div className="relative max-w-4xl mx-auto">
          {/* SVG connecting line — desktop */}
          <svg
            className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 w-full overflow-visible"
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
          >
            <motion.line
              x1="16.6"
              y1="1"
              x2="83.3"
              y2="1"
              stroke="#0A5F8A"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </svg>

          {/* SVG connecting line — mobile (vertical) */}
          <svg
            className="md:hidden absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 h-full overflow-visible"
            viewBox="0 0 2 100"
            preserveAspectRatio="none"
          >
            <motion.line
              x1="1"
              y1="16.6"
              x2="1"
              y2="83.3"
              stroke="#0A5F8A"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </svg>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10"
          >
            {locations.map((loc) => (
              <motion.div
                key={loc.nameKey}
                variants={cardVariants}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm text-center"
              >
                <span className="text-4xl mb-3 block" role="img" aria-label={t(loc.nameKey)}>{loc.emoji}</span>
                <h4 className="text-lg font-semibold text-jeju-ocean mb-2">{t(loc.nameKey)}</h4>
                <p className="text-sm text-gray-600 break-words">{t(loc.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Global note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-8 sm:mt-10 max-w-xl mx-auto break-words text-balance"
        >
          {t('gangjeong_story.solidarity_global_note')}
        </motion.p>

        {/* Closing slogan */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="font-partial text-2xl sm:text-3xl md:text-5xl text-jeju-ocean text-center mt-10 sm:mt-14 break-words text-balance"
        >
          {t('gangjeong_story.closing_slogan')}
        </motion.p>
      </div>
    </div>
  );
};

export default GlobalSolidarity;
