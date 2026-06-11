import React from 'react';
import { m as motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/common/SectionHeader';
import Button from '@/components/common/Button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const GuidelinesSummary: React.FC = () => {
  const { t } = useTranslation('camp_guidelines_2026');

  const topics = t('camp_guidelines_2026.summary_topics', {
    returnObjects: true,
  }) as unknown as string[];

  return (
    <Section background="light-beige" paddingTop="loose" paddingBottom="loose" id="guidelines">
      <Container size="prose">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={itemVariants}>
            <SectionHeader
              title={t('camp_guidelines_2026.summary_heading')}
              subtitle={t('camp_guidelines_2026.summary_intro')}
              align="center"
              className="!mb-8"
            />
          </motion.div>

          {/* Topic chips */}
          {Array.isArray(topics) && topics.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-2 mb-8"
            >
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="inline-block bg-white border border-seafoam/50 text-jeju-ocean text-sm font-medium px-3 py-1 rounded-full shadow-sm"
                >
                  {topic}
                </span>
              ))}
            </motion.div>
          )}

          {/* Report contacts callout */}
          <motion.div
            variants={itemVariants}
            className="bg-sky-horizon/60 border border-seafoam/40 rounded-xl p-4 sm:p-6 mb-8"
          >
            <p className="text-xs uppercase tracking-wide text-coastal-gray mb-3 font-semibold">
              {t('camp_guidelines_2026.summary_report_label')}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-deep-ocean">
                <span className="font-medium">
                  {t('camp_guidelines_2026.summary_report_contact1')}
                </span>{' '}
                <a href="tel:01081702188" className="text-jeju-ocean hover:underline">
                  010-8170-2188
                </a>
                {' / '}
                <a href="tel:01023790760" className="text-jeju-ocean hover:underline">
                  010-2379-0760
                </a>
              </p>
              <p className="text-sm text-deep-ocean">
                <span className="font-medium">
                  {t('camp_guidelines_2026.summary_report_contact2')}
                </span>{' '}
                <a href="tel:01036933971" className="text-jeju-ocean hover:underline">
                  010-3693-3971
                </a>
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <Button to="/camps/2026/guidelines" variant="secondary" size="sm">
              {t('camp_guidelines_2026.summary_cta')}
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default GuidelinesSummary;
