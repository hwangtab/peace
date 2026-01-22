import { motion, useInView } from 'framer-motion';
import { useRef, useCallback, useMemo, useState } from 'react';
import Button from '../common/Button';
import { getResponsiveImagePath } from '../../utils/images';

interface HeroSectionProps {
  imageUrl: string;
}

const HeroSection = ({ imageUrl }: HeroSectionProps) => {
  const scrollIndicatorRef = useRef(null);
  const isScrollIndicatorInView = useInView(scrollIndicatorRef);
  const [imageFailed, setImageFailed] = useState(false);

  const handleScrollToAbout = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Memoize to prevent unnecessary recalculation
  const responsiveImages = useMemo(() => getResponsiveImagePath(imageUrl), [imageUrl]);

  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Responsive Background Image with fallback */}
      <img
        src={responsiveImages.desktop}
        srcSet={
          !imageFailed
            ? `
          ${responsiveImages.mobile} 800w,
          ${responsiveImages.tablet} 1200w,
          ${responsiveImages.desktop} 1920w
        `
            : undefined
        }
        sizes="100vw"
        alt="강정마을 해변에서 열린 피스앤뮤직캠프 공연 무대"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        fetchPriority="high"
        onError={(e) => {
          // 반응형 이미지 로드 실패 시 원본으로 fallback
          if (imageFailed) return;
          const img = e.target as HTMLImageElement;
          // Fallback to a placeholder or empty string if even the original fails to prevent infinite loops
          if (img.src !== imageUrl) {
            img.src = imageUrl;
            img.removeAttribute('srcset');
            setImageFailed(true);
          } else {
            // If original URL also fails, stop trying
            img.style.display = 'none';
          }
        }}
      />

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
          <h1 className="text-[clamp(1.5rem,8vw,5.5rem)] font-partial leading-tight text-cloud-white mb-6 drop-shadow-md whitespace-nowrap">
            강정피스앤뮤직캠프
          </h1>
          <p className="text-[clamp(1rem,4vw,2.25rem)] font-stone leading-tight text-golden-sun mb-6 drop-shadow-sm whitespace-nowrap">
            전쟁을 끝내자! 노래하자, 춤추자
          </p>
          <p className="text-[clamp(0.8125rem,2.2vw,1.25rem)] font-caption leading-relaxed text-seafoam mb-12 font-medium drop-shadow-sm whitespace-nowrap">
            강정마을에서 시작되는 평화의 메시지
          </p>
          <div className="flex justify-center gap-4">
            <Button href="#about" variant="gold" onClick={handleScrollToAbout}>
              캠프 소개
            </Button>
            <Button to="/camps/2026" variant="white-outline">
              2026 캠프
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
