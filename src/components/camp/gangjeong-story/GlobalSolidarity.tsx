import React from 'react';
import { m as motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';

interface Props {
  variant?: 'camp' | 'home';
}

const GlobalSolidarity: React.FC<Props> = ({ variant = 'camp' }) => {
  const { t } = useTranslation('gangjeong');
  const { viewport, container, item } = useScrollReveal();
  const isHome = variant === 'home';

  return (
    <Section
      background={isHome ? 'jeju-ocean' : 'deep-ocean'}
      paddingTop="loose"
      paddingBottom="loose"
    >
      <Container size="prose">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="text-center"
        >
          {/* Declaration */}
          <motion.p
            variants={item}
            className={`font-display font-bold text-xl sm:text-2xl md:text-3xl ${isHome ? 'text-white' : 'text-cloud-white/90'} leading-relaxed break-words text-balance`}
          >
            {t('solidarity_declaration')}
          </motion.p>

          {/* Divider */}
          <motion.div
            variants={item}
            className={`h-px bg-gradient-to-r from-transparent ${isHome ? 'via-seafoam/30' : 'via-golden-sun/30'} to-transparent my-8 sm:my-10`}
          />

          {/* Closing slogan */}
          <motion.p
            variants={item}
            className={`font-partial font-normal text-2xl sm:text-3xl md:text-5xl ${isHome ? 'text-jeju-sky' : 'text-golden-sun'} break-words text-balance`}
          >
            {t('closing_slogan')}
          </motion.p>
        </motion.div>
      </Container>
    </Section>
  );
};

export default GlobalSolidarity;
