import { useTranslation } from 'next-i18next';
import { m as motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Button from '../common/Button';
import Container from '../layout/Container';
import { useCamp } from '@/hooks/useCamps';
import { useIsMobile } from '@/hooks/useIsMobile';

interface HeroSectionProps {
  imageUrl: string;
}

// 히어로는 사이트에서 가장 눈에 띄는 단일 이미지라, 일시적인 네트워크 실패(약한 모바일
// 신호 등)로 한 번 실패하면 재시도 없이 그라디언트만 남아 이후로도 색이 돌아오지 않았다.
// 짧은 지연을 두고 몇 차례 재시도한 뒤에만 최종적으로 포기한다.
const MAX_IMAGE_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

const HeroSection = ({ imageUrl }: HeroSectionProps) => {
  const { t } = useTranslation();
  const camp2026 = useCamp('camp-2026');
  const scrollIndicatorRef = useRef(null);
  const isScrollIndicatorInView = useInView(scrollIndicatorRef);
  const [imageAttempt, setImageAttempt] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const shouldReduceMotion = Boolean(prefersReducedMotion || isMobile);

  useEffect(
    () => () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    },
    []
  );

  const handleImageError = useCallback(() => {
    if (imageAttempt >= MAX_IMAGE_RETRIES) {
      setImageFailed(true);
      return;
    }
    retryTimeoutRef.current = setTimeout(() => setImageAttempt((a) => a + 1), RETRY_DELAY_MS);
  }, [imageAttempt]);

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
          initial={shouldReduceMotion ? { scale: 1 } : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 12, ease: 'easeOut' }}
          aria-hidden="true"
        >
          <Image
            key={imageAttempt}
            src={imageUrl}
            alt={t('home.hero.image_alt')}
            fill
            sizes="100vw"
            className="object-cover object-center"
            quality={60}
            priority
            fetchPriority="high"
            onError={handleImageError}
          />
        </motion.div>
      )}

      {/* Ocean gradient overlay — brand-consistent */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-jeju-ocean/70 via-ocean-mist/40 to-seafoam/20"
      />

      {/* LCP content renders visible on first paint — no JS-gated opacity. */}
      <Container size="wide" className="relative z-10">
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
      </Container>

      {/* Scroll Indicator - Only animates when in view */}
      <motion.div
        ref={scrollIndicatorRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 1.6, duration: shouldReduceMotion ? 0 : 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            animate={
              isScrollIndicatorInView && !shouldReduceMotion
                ? {
                    y: [0, 12, 0],
                  }
                : { y: 0 }
            }
            transition={{
              duration: 1.5,
              repeat: isScrollIndicatorInView && !shouldReduceMotion ? 3 : 0,
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
