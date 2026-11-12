import React, { useRef } from 'react';
import { m as motion, useScroll, useTransform, useReducedMotion, useInView } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Container from '@/components/layout/Container';

interface Props {
  variant?: 'camp' | 'home';
}

/**
 * 데스크톱 전용 parallax 레이어.
 *
 * `useScroll` 은 스크롤 이벤트마다 대상의 offset/clientHeight 를 읽는다. 모바일에서는
 * 시각 효과를 끄더라도 훅은 계속 구독되므로, 이 컴포넌트를 모바일에서 아예
 * 마운트하지 않아 스크롤 구독 자체를 제거한다.
 */
const HookParallaxImage: React.FC<{
  sectionRef: React.RefObject<HTMLDivElement>;
  alt: string;
}> = ({ sectionRef, alt }) => {
  const isNearViewport = useInView(sectionRef);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <motion.div
      className="absolute inset-0 w-full h-full"
      style={isNearViewport ? { y: bgY } : undefined}
    >
      <Image
        src="/images-webp/camps/2023/IMG_3565.webp"
        alt={alt}
        fill
        sizes="100vw"
        quality={60}
        className="object-cover scale-[1.15]"
      />
    </motion.div>
  );
};

const HookStatement: React.FC<Props> = ({ variant = 'camp' }) => {
  const { t } = useTranslation('gangjeong');
  const { viewport, container, item } = useScrollReveal();
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  // 모바일에서는 parallax 비활성 — 스크롤 구독과 rAF 부담을 아예 만들지 않는다.
  const isMobile = useIsMobile();
  const parallaxDisabled = prefersReducedMotion || isMobile;

  // bg-deep-ocean: lazy 이미지 도착 전 바탕. 없으면 스크롤 진입 시 흰 블록이 먼저 번쩍인다.
  return (
    <div
      ref={sectionRef}
      className="relative min-h-[50vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden bg-deep-ocean"
    >
      {parallaxDisabled ? (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images-webp/camps/2023/IMG_3565.webp"
            alt={t('hook_image_alt')}
            fill
            sizes="100vw"
            quality={60}
            className="object-cover scale-[1.15]"
          />
        </div>
      ) : (
        <HookParallaxImage sectionRef={sectionRef} alt={t('hook_image_alt')} />
      )}
      <div
        className={`absolute inset-0 bg-radial-[ellipse_at_center] ${variant === 'home' ? 'from-black/60 via-black/30 to-black/20' : 'from-black/60 via-black/30 to-transparent'}`}
      />

      <Container size="prose" className="relative z-10 py-20 sm:py-28">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="text-center"
        >
          <motion.h2
            variants={item}
            className={`font-partial font-normal text-4xl sm:text-5xl md:text-6xl ${variant === 'home' ? 'text-jeju-sky' : 'text-golden-sun'} mb-3 break-words`}
          >
            {t('hook_headline')}
          </motion.h2>
          <motion.p
            variants={item}
            className="font-partial font-normal text-xl sm:text-2xl md:text-3xl text-white mb-6 sm:mb-8 break-words text-balance"
          >
            {t('hook_subline')}
          </motion.p>
          <motion.p
            variants={item}
            className="typo-body text-cloud-white/80 leading-relaxed text-base sm:text-lg"
          >
            {t('hook_intro')}
          </motion.p>
        </motion.div>
      </Container>
    </div>
  );
};

export default HookStatement;
