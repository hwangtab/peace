import React from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CampEvent } from '../../types/camp';

interface CampHeroProps {
  camp: CampEvent;
}

const CampHero: React.FC<CampHeroProps> = ({ camp }) => {
  const { t, i18n } = useTranslation();
  const eventDate = new Date(camp.startDate);
  const formattedDate = eventDate.toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const backgroundImage = camp.images && camp.images.length > 0 ? camp.images[0] : null;

  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center text-center overflow-hidden bg-hero-gradient">
      {/* Responsive Background Image */}
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt={camp.title}
          fill
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="typo-h1 text-white mb-4 hyphens-auto">{camp.title}</h1>
          {camp.slogan && <p className="typo-subtitle text-gray-100 mb-6 hyphens-auto">{camp.slogan}</p>}
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-white">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-300 mb-1">{t('album.label_date')}</p>
              <p className="text-lg font-medium">{formattedDate}</p>
            </div>
            <div className="hidden sm:block text-gray-400">|</div>
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-300 mb-1">{t('album.label_venue')}</p>
              <p className="text-lg font-medium">{camp.location}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CampHero;
