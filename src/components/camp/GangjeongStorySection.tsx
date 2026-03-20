import React from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface GangjeongStorySectionProps {
  backgroundImage?: string;
}

const GangjeongStorySection: React.FC<GangjeongStorySectionProps> = ({
  backgroundImage = '/images-webp/camps/2023/DSC00267.webp',
}) => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[400px] md:min-h-[500px] flex items-center overflow-hidden">
      <Image
        src={backgroundImage}
        alt=""
        fill
        sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 md:pt-24 pb-24 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="typo-h2 text-white mb-8 sm:mb-10 break-words text-balance">
            {t('gangjeong_story.section_title')}
          </h2>

          <div className="space-y-5 sm:space-y-6">
            <p className="typo-body text-gray-200 leading-relaxed break-words text-pretty">
              {t('gangjeong_story.paragraph1')}
            </p>
            <p className="typo-body text-gray-200 leading-relaxed break-words text-pretty">
              {t('gangjeong_story.paragraph2')}
            </p>
            <p className="typo-body text-gray-100 leading-relaxed break-words text-pretty font-medium">
              {t('gangjeong_story.paragraph3')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GangjeongStorySection;
