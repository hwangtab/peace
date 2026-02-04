import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <Section id="about" background="sky-horizon" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-4xl mx-auto text-center"
        >
          <SectionHeader
            title={t('about.title')}
            subtitle={t('about.subtitle')}
            inView={isInView}
          />

          <motion.div variants={itemVariants} className="space-y-8 text-base sm:text-lg text-gray-700 leading-relaxed font-light">
            <p className="text-pretty">
              <Trans i18nKey="about.desc1">
                제주 강정마을, 거친 바람이 부는 구럼비 바위 앞에서 우리는 처음 노래를 불렀습니다.<br className="hidden md:block" />
                평화는 거창한 구호가 아니라, 서로의 목소리에 귀 기울이는 순간 시작된다는 것을 알았습니다.
              </Trans>
            </p>
            <p className="text-pretty">
              <Trans i18nKey="about.desc2">
                강정피스앤뮤직캠프는
                전쟁 없는 세상을 꿈꾸는 음악가들의 연대이자 축제입니다.<br className="hidden md:block" />
                국경과 언어를 넘어, 음악이라는 가장 아름다운 무기로 우리는 평화를 이야기합니다.
              </Trans>
            </p>
            <p className="text-gray-900 font-medium text-pretty">
              <Trans i18nKey="about.desc3">
                함께 노래하고, 춤추고, 서로를 안아줄 때,<br className="hidden sm:block" />
                전쟁은 멈추고 평화의 파도는 더 멀리 퍼져나갈 것입니다.
              </Trans>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mt-12 text-left">
            <motion.div variants={itemVariants} className="bg-ocean-sand/30 p-8 rounded-2xl hover:bg-ocean-sand/50 transition-colors duration-300">
              <h3 className="typo-h3 mb-4">{t('about.card1.title')}</h3>
              <p className="typo-body text-coastal-gray text-pretty">
                <Trans i18nKey="about.card1.desc">
                  2023년 여름, 첫 번째 화음이 시작되었습니다.<br className="hidden lg:block" />
                  우리의 축제는 일회성 이벤트가 아닌, 매년 강정의 여름을 지키는<br className="hidden lg:block" />
                  끈질기고 아름다운 평화의 의식(Ritual)으로 계속될 것입니다.
                </Trans>
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-ocean-sand/30 p-8 rounded-2xl hover:bg-ocean-sand/50 transition-colors duration-300">
              <h3 className="typo-h3 mb-4">{t('about.card2.title')}</h3>
              <p className="typo-body text-coastal-gray text-pretty">
                <Trans i18nKey="about.card2.desc">
                  팔레스타인 가자지구에서 우크라이나까지, 분쟁 지역을 기억합니다.<br className="hidden lg:block" />
                  강정피스앤뮤직캠프는 단순한 음악회를 넘어, 고통받는 이들과 함께하며<br className="hidden lg:block" />
                  평화를 염원하는 강력한 연대의 장입니다.
                </Trans>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};

export default AboutSection;
