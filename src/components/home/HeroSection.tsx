import { useTranslation } from 'next-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef, useCallback, useState } from 'react';
import Image from 'next/image';
import Button from '../common/Button';

interface HeroSectionProps {
  imageUrl: string;
}

const HeroSection = ({ imageUrl }: HeroSectionProps) => {
  const { t } = useTranslation();
  const scrollIndicatorRef = useRef(null);
  const isScrollIndicatorInView = useInView(scrollIndicatorRef);
  const [imageFailed, setImageFailed] = useState(false);

  const handleScrollToAbout = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Responsive Background Image with fallback */}
      {!imageFailed && (
        <Image
          src={imageUrl}
          alt={t('home.hero.image_alt')}
          fill
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover object-center"
          priority
          onError={() => setImageFailed(true)}
        />
      )}

      {/* Gradient Overlay using Bright Ocean Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-jeju-ocean/70 via-ocean-mist/40 to-seafoam/20" />

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat opacity-10" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-[clamp(1.5rem,8vw,5.5rem)] font-partial leading-tight text-cloud-white mb-6 drop-shadow-md text-balance hyphens-auto break-words max-w-5xl mx-auto">
            {t('home.hero.title')}
          </h1>
          <p className="text-[clamp(1rem,4vw,2.25rem)] font-stone leading-tight text-golden-sun mb-6 drop-shadow-sm text-balance hyphens-auto break-words max-w-4xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
          <p className="text-[clamp(0.8125rem,2.2vw,1.25rem)] font-caption leading-relaxed text-seafoam mb-12 font-medium drop-shadow-sm text-balance hyphens-auto break-words max-w-3xl mx-auto">
            {t('home.hero.message')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button href="#about" variant="gold" onClick={handleScrollToAbout}>
              {t('home.hero.camp_intro')}
            </Button>
            <Button to="/camps/2026" variant="white-outline">
              {t('home.hero.camp_2026')}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Only animates when in view */}
      <motion.div
        ref={scrollIndicatorRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            animate={
              isScrollIndicatorInView
                ? {
                  y: [0, 12, 0],
                }
                : { y: 0 }
            }
            transition={{
              duration: 1.5,
              repeat: isScrollIndicatorInView ? 3 : 0,
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
