import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

interface StoryBlockProps {
  imageSrc: string;
  textKey: string;
  altKey: string;
  align?: 'left' | 'right';
  imageClassName?: string;
  variant?: 'camp' | 'home';
}

const StoryBlock: React.FC<StoryBlockProps> = ({ imageSrc, textKey, altKey, align = 'left', imageClassName, variant = 'camp' }) => {
  const { t } = useTranslation();
  const blockRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: blockRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);

  return (
    <div ref={blockRef} className="relative min-h-[60vh] md:min-h-[70vh] flex items-end overflow-hidden">
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={prefersReducedMotion ? undefined : { y: bgY }}
      >
        <Image
          src={imageSrc}
          alt={t(altKey)}
          fill
          sizes="100vw"
          className={`object-cover scale-[1.15] ${imageClassName || ''}`}
        />
      </motion.div>
      <div className={`absolute inset-0 bg-gradient-to-t ${variant === 'home' ? 'from-black/75 via-jeju-ocean/40 to-transparent' : 'from-black/80 via-black/30 to-transparent'}`} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-12 sm:pb-16 md:pb-20 pt-20">
        <motion.div
          initial={{ opacity: 0, x: align === 'right' ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className={`max-w-lg mx-auto ${align === 'right' ? 'md:ml-auto md:mr-0' : 'md:mx-0'}`}
        >
          <p className={`font-display font-bold text-lg sm:text-xl md:text-2xl text-white leading-relaxed break-words text-balance ${align === 'right' ? 'md:text-right' : ''}`}>
            {t(textKey)}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const blocks: Omit<StoryBlockProps, 'variant'>[] = [
  {
    imageSrc: '/images-webp/gangjeong/gurumbi-prayer.webp',
    textKey: 'gangjeong_story.story_block1_text',
    altKey: 'gangjeong_story.story_block1_alt',
    align: 'right',
    imageClassName: 'grayscale-[0.3] contrast-[0.9] brightness-[0.85] blur-[0.5px]',
  },
  {
    imageSrc: '/images-webp/gangjeong/gangjeong-memory.webp',
    textKey: 'gangjeong_story.story_block2_text',
    altKey: 'gangjeong_story.story_block2_alt',
    align: 'left',
    imageClassName: 'grayscale-[0.3] contrast-[0.9] brightness-[0.85] blur-[0.5px]',
  },
  {
    imageSrc: '/images-webp/camps/2023/20230610밤 우와악.webp',
    textKey: 'gangjeong_story.story_block3_text',
    altKey: 'gangjeong_story.story_block3_alt',
    align: 'right',
  },
];

interface Props {
  variant?: 'camp' | 'home';
}

const EmotionalStory: React.FC<Props> = ({ variant = 'camp' }) => {
  return (
    <div>
      {blocks.map((block) => (
        <StoryBlock key={block.textKey} {...block} variant={variant} />
      ))}
    </div>
  );
};

export default EmotionalStory;
