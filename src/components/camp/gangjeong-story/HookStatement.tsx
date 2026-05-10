import React, { useRef } from 'react';
import { m as motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/useIsMobile';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

interface Props {
  variant?: 'camp' | 'home';
}

const HookStatement: React.FC<Props> = ({ variant = 'camp' }) => {
  const { t } = useTranslation('gangjeong');
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  // 모바일에서는 parallax 비활성 — rAF subscribe 가 main thread 차지해 INP 악화.
  const isMobile = useIsMobile();
  const parallaxDisabled = prefersReducedMotion || isMobile;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <div ref={sectionRef} className="relative min-h-[50vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={parallaxDisabled ? undefined : { y: bgY }}
      >
        <Image
          src="/images-webp/camps/2023/IMG_3565.webp"
          alt={t('hook_image_alt')}
          fill
          sizes="100vw"
          className="object-cover scale-[1.15]"
        />
      </motion.div>
      <div className={`absolute inset-0 backdrop-blur-[2px] bg-radial-[ellipse_at_center] ${variant === 'home' ? 'from-black/60 via-black/30 to-black/20' : 'from-black/60 via-black/30 to-transparent'}`} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 sm:py-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.h2
            variants={itemVariants}
            className={`font-partial font-normal text-4xl sm:text-5xl md:text-6xl ${variant === 'home' ? 'text-jeju-sky' : 'text-golden-sun'} mb-3 break-words`}
          >
            {t('hook_headline')}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="font-partial font-normal text-xl sm:text-2xl md:text-3xl text-white mb-6 sm:mb-8 break-words"
          >
            {t('hook_subline')}
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="typo-body text-gray-200 leading-relaxed text-base sm:text-lg"
          >
            {t('hook_intro')}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default HookStatement;
