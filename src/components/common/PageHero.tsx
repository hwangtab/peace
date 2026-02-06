import { motion } from 'framer-motion';
import Image from 'next/image';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage: string; // Required - no gradient fallback
}

/**
 * PageHero Component
 *
 * 재사용 가능한 페이지 히어로 섹션 (CampHero 스타일 기반).
 * 투명 네비게이션과 함께 사용하여 일관된 페이지 헤더 제공.
 */
const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, backgroundImage }) => {
  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center text-center overflow-hidden">
      {/* Background Image - use original as src, srcset as optimization */}
      <Image
        src={backgroundImage}
        alt={title}
        fill
        sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover"
        priority
      />

      {/* Dark Overlay - Same as CampHero */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      {/* Content - Same as CampHero */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="typo-h1 text-white mb-4 text-balance hyphens-auto">{title}</h1>
          {subtitle && <p className="typo-subtitle text-gray-100 mb-6 text-balance hyphens-auto">{subtitle}</p>}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
