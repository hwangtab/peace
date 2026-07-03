import React from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import Image from 'next/image';
import { CampEvent } from '@/types/camp';
import Container from '@/components/layout/Container';
import { formatDateLocalized } from '@/utils/date';

interface CampHeroProps {
  camp: CampEvent;
  /** Featured mode: adds padding, lighter overlay, for current/upcoming camp */
  featured?: boolean;
  /** Date badge text (e.g., "2026.06.05 — 07") */
  dateBadge?: string;
  /** Override auto-formatted date display (e.g., "2026년 6월 5일(금) - 6월 7일(일)") */
  dateDisplay?: string;
  /** CTA buttons below info section */
  children?: React.ReactNode;
}

const CampHero: React.FC<CampHeroProps> = ({
  camp,
  featured,
  dateBadge,
  dateDisplay,
  children,
}) => {
  const { t, i18n } = useTranslation();

  // formatDateLocalized parses local Y/M/D parts to avoid the UTC-midnight drift
  // that would render the wrong day in western timezones.
  const formattedDate = dateDisplay || formatDateLocalized(camp.startDate, i18n.language);

  const backgroundImage = camp.images && camp.images.length > 0 ? camp.images[0] : null;

  return (
    <section
      className={`relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center text-center overflow-hidden ${
        featured ? 'bg-ocean-gradient pt-20 pb-16' : 'bg-hero-gradient'
      }`}
    >
      {backgroundImage && (
        // 장식용 배경 이미지 — 제목·부제가 텍스트로 의미를 전달하므로 빈 alt로 SR에서 숨김
        <Image
          src={backgroundImage}
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover"
          quality={60}
          priority
          fetchPriority="high"
        />
      )}

      <div
        className={`absolute inset-0 bg-gradient-to-b ${
          featured
            ? 'from-black/50 via-black/40 to-black/60'
            : 'from-black/60 via-black/50 to-black/70'
        }`}
      />

      <Container size="wide" className="relative z-10">
        <motion.div
          initial={{ y: 16 }}
          animate={{ y: 0 }}
          transition={{ duration: featured ? 0.4 : 0.6, ease: 'easeOut' }}
        >
          {dateBadge && (
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full mb-4 sm:mb-6 text-sm tracking-wider border border-white/30 max-w-full">
              {dateBadge}
            </span>
          )}

          <h1 className="typo-h1 !text-white mb-3 sm:mb-4">{camp.title}</h1>
          {camp.slogan && (
            <p className="typo-subtitle !text-cloud-white/90 mb-5 sm:mb-8">{camp.slogan}</p>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-6 text-white mb-5 sm:mb-8">
            <div>
              <p className="text-sm uppercase tracking-wide text-cloud-white/70 mb-1">
                {t('camp.label_period')}
              </p>
              <p className="text-lg font-medium">{formattedDate}</p>
            </div>
            <div className="hidden sm:block text-cloud-white/50">|</div>
            <div>
              <p className="text-sm uppercase tracking-wide text-cloud-white/70 mb-1">
                {t('camp.label_location')}
              </p>
              <p className="text-lg font-medium">{camp.location}</p>
            </div>
          </div>

          {children && (
            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              {children}
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
};

export default CampHero;
