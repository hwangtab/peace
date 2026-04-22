import { useTranslation } from 'next-i18next';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, useCallback, useState } from 'react';
import Image from 'next/image';
import Button from '../common/Button';
import { useCamp } from '@/hooks/useCamps';

interface HeroSectionProps {
  imageUrl: string;
}

const HeroSection = ({ imageUrl }: HeroSectionProps) => {
  const { t } = useTranslation();
  const camp2026 = useCamp('camp-2026');
  const scrollIndicatorRef = useRef(null);
  const isScrollIndicatorInView = useInView(scrollIndicatorRef);
  const [imageFailed, setImageFailed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleScrollToAbout = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Slow Ken Burns background for subtle atmosphere */}
      {!imageFailed && (
        <motion.div
          className="absolute inset-0"
          initial={prefersReducedMotion ? { scale: 1 } : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 12, ease: 'easeOut' }}
          aria-hidden="true"
        >
          <Image
            src={imageUrl}
            alt={t('home.hero.image_alt')}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
            onError={() => setImageFailed(true)}
          />
        </motion.div>
      )}

      {/* Ocean gradient overlay — brand-consistent */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-jeju-ocean/70 via-ocean-mist/40 to-seafoam/20" />

      {/* LCP content renders visible on first paint — no JS-gated opacity. */}
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="typo-h1 text-cloud-white mb-6 drop-shadow-md max-w-5xl mx-auto">
          {t('home.hero.title')}
        </h1>
        <p className="typo-h2 !text-golden-sun mb-6 drop-shadow-sm max-w-4xl mx-auto">
          {t('home.hero.subtitle')}
        </p>
        <p className="typo-body !text-seafoam mb-12 drop-shadow-sm max-w-3xl mx-auto">
          {t('home.hero.message')}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button href="#about" variant="gold" onClick={handleScrollToAbout}>
            {t('home.hero.camp_intro')}
          </Button>
          <Button to="/camps/2026" variant="white-outline">
            {t('home.hero.camp_2026')}
          </Button>
          {camp2026?.fundingUrl && (
            <Button href={camp2026.fundingUrl} variant="white" external utmContent="home-hero">
              {t('camp.ticketing_2026')}
            </Button>
          )}
        </div>
      </div>

      {/* Scroll Indicator - Only animates when in view */}
      <motion.div
        ref={scrollIndicatorRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            animate={
              isScrollIndicatorInView && !prefersReducedMotion
                ? {
                  y: [0, 12, 0],
                }
                : { y: 0 }
            }
            transition={{
              duration: 1.5,
              repeat: isScrollIndicatorInView && !prefersReducedMotion ? 3 : 0,
              repeatType: 'reverse',
              repeatDelay: 0.5,
            }}
            className="w-2 h-2 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
