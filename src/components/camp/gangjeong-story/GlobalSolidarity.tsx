import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
};

interface Props {
  variant?: 'camp' | 'home';
}

const GlobalSolidarity: React.FC<Props> = ({ variant = 'camp' }) => {
  const { t } = useTranslation();
  const isHome = variant === 'home';

  return (
    <div className={`${isHome ? 'bg-jeju-ocean' : 'bg-deep-ocean'} py-16 sm:py-20 md:py-28`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Declaration */}
          <motion.p
            variants={itemVariants}
            className={`font-display font-bold text-xl sm:text-2xl md:text-3xl ${isHome ? 'text-white' : 'text-gray-100'} leading-relaxed break-words text-balance`}
          >
            {t('gangjeong_story.solidarity_declaration')}
          </motion.p>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className={`h-px bg-gradient-to-r from-transparent ${isHome ? 'via-seafoam/30' : 'via-golden-sun/30'} to-transparent my-8 sm:my-10`}
          />

          {/* Closing slogan */}
          <motion.p
            variants={itemVariants}
            className={`font-partial font-normal text-2xl sm:text-3xl md:text-5xl ${isHome ? 'text-jeju-sky' : 'text-golden-sun'} break-words text-balance`}
          >
            {t('gangjeong_story.closing_slogan')}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default GlobalSolidarity;
