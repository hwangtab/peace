import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

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

const HookStatement: React.FC = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <div ref={sectionRef} className="relative min-h-[50vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={prefersReducedMotion ? undefined : { y: bgY }}
      >
        <Image
          src="/images-webp/camps/2023/20230610밤 전쟁을끝내자.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover scale-110"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/70" />

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
            className="font-partial text-4xl sm:text-5xl md:text-6xl text-golden-sun font-bold mb-3 break-words"
          >
            {t('gangjeong_story.hook_headline')}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="font-partial text-xl sm:text-2xl md:text-3xl text-white mb-6 sm:mb-8 break-words"
          >
            {t('gangjeong_story.hook_subline')}
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="typo-body text-gray-200 leading-relaxed text-base sm:text-lg break-words text-balance"
          >
            {t('gangjeong_story.hook_intro')}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default HookStatement;
