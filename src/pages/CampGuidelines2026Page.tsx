import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/layout/Section';
import Container from '@/components/layout/Container';
import GuidelineSection from '@/components/camp/guidelines/GuidelineSection';
import { getFullUrl } from '@/config/env';

interface Hotline {
  name: string;
  number: string;
  hours: string;
  desc: string;
}

interface MedicalFacility {
  name: string;
  number: string;
  address: string;
  hours: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CampGuidelines2026Page: React.FC = () => {
  const { t } = useTranslation(['camp_guidelines_2026', 'translation']);

  const g = useCallback(
    (key: string, opts?: Record<string, unknown>) =>
      t(`camp_guidelines_2026.${key}`, opts),
    [t],
  );

  const arr = useCallback(
    (key: string) =>
      t(`camp_guidelines_2026.${key}`, { returnObjects: true }) as string[],
    [t],
  );

  const breadcrumbs = useMemo(() => [
    { name: t('translation:nav.home'), url: getFullUrl('/') },
    { name: t('translation:nav.camp_2026'), url: getFullUrl('/camps/2026') },
    { name: g('breadcrumb_guidelines') as string, url: getFullUrl('/camps/2026/guidelines') },
  ], [t, g]);

  const hotlines = t('camp_guidelines_2026.response_hotlines', { returnObjects: true }) as Hotline[];
  const facilities = t('camp_guidelines_2026.medical_facilities', { returnObjects: true }) as MedicalFacility[];

  return (
    <PageLayout
      title={g('page_title') as string}
      description={g('seo_description') as string}
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
    >
      <PageHero
        title={g('page_subtitle') as string}
        subtitle={g('page_title') as string}
        backgroundImage="/images-webp/camps/2026/hero-gangjeong-2026.webp"
      />

      {/* Main content */}
      <Section background="white" paddingTop="loose" paddingBottom="loose">
        <Container size="prose">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {/* 1. 들어가며 */}
            <motion.div variants={itemVariants}>
              <GuidelineSection
                title={g('intro_title') as string}
                body={g('intro_body') as string}
              />
            </motion.div>

            <hr className="border-coastal-gray/20 my-8" />

            {/* 2. 금지행동 */}
            <motion.div variants={itemVariants}>
              <h2 className="typo-h3 mb-2">{g('prohibited_title')}</h2>
              <p className="typo-body text-coastal-gray mb-4">{g('prohibited_intro')}</p>
              <GuidelineSection
                title=""
                subtitle={g('prohibited_hate_title') as string}
                items={arr('prohibited_hate_items')}
              />
              <GuidelineSection
                title=""
                subtitle={g('prohibited_harassment_title') as string}
                items={arr('prohibited_harassment_items')}
              />
              <GuidelineSection
                title=""
                subtitle={g('prohibited_filming_title') as string}
                items={arr('prohibited_filming_items')}
                note={g('prohibited_filming_note') as string}
              />
            </motion.div>

            <hr className="border-coastal-gray/20 my-8" />

            {/* 3. 동의 */}
            <motion.div variants={itemVariants}>
              <GuidelineSection
                title={g('consent_title') as string}
                body={g('consent_body') as string}
              />
            </motion.div>

            <hr className="border-coastal-gray/20 my-8" />

            {/* 4. 불편한 상황 */}
            <motion.div variants={itemVariants}>
              <GuidelineSection
                title={g('bystander_title') as string}
                items={arr('bystander_items')}
              />
            </motion.div>

            <hr className="border-coastal-gray/20 my-8" />

            {/* 5. 신고 방법 */}
            <motion.div variants={itemVariants}>
              <h2 className="typo-h3 mb-2">{g('report_title')}</h2>
              <p className="typo-body text-coastal-gray mb-4">{g('report_intro')}</p>
              <ul className="space-y-2">
                {arr('report_items').map((item) => (
                  <li key={item.slice(0, 60)} className="flex gap-2 typo-body text-coastal-gray leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-jeju-ocean" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <hr className="border-coastal-gray/20 my-8" />

            {/* 6. 주최 측 대응 방향 */}
            <motion.div variants={itemVariants}>
              <h2 className="typo-h3 mb-6">{g('response_title')}</h2>

              {/* 성희롱 */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-jeju-ocean mb-2">
                  {g('response_harassment_subtitle')}
                </h3>
                <GuidelineSection title="" items={arr('response_harassment_items')} />
                <p className="typo-body text-coastal-gray mb-2">{g('response_options_label')}</p>
                <GuidelineSection title="" items={arr('response_options_items')} />
              </div>

              {/* 외부 기관 */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-jeju-ocean mb-3">
                  {g('response_hotlines_subtitle')}
                </h3>
                {Array.isArray(hotlines) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {hotlines.map((h) => (
                      <div
                        key={h.number}
                        className="bg-sky-horizon/40 border border-seafoam/30 rounded-lg p-3"
                      >
                        <p className="text-sm font-semibold text-deep-ocean">{h.name}</p>
                        <p className="text-xs text-coastal-gray mb-1">
                          {h.desc}
                          {h.hours && ` (${h.hours})`}
                        </p>
                        <a
                          href={`tel:${h.number.replace(/-/g, '')}`}
                          className="text-sm font-bold text-jeju-ocean hover:underline"
                        >
                          {h.number}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 성추행·성폭력 */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-jeju-ocean mb-2">
                  {g('response_assault_subtitle')}
                </h3>
                <GuidelineSection title="" items={arr('response_assault_items')} />
                <p className="typo-body text-coastal-gray font-medium mb-2">
                  {g('response_evidence_label')}
                </p>
                <GuidelineSection title="" items={arr('response_evidence_items')} />
              </div>

              {/* 기타 사건 */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-jeju-ocean mb-2">
                  {g('response_other_subtitle')}
                </h3>
                <GuidelineSection title="" items={arr('response_other_items')} />
              </div>

              {/* 가해지목인 */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-jeju-ocean mb-2">
                  {g('response_perpetrator_subtitle')}
                </h3>
                <GuidelineSection title="" items={arr('response_perpetrator_items')} />
              </div>

              {/* 비밀 보장 */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-jeju-ocean mb-2">
                  {g('response_confidentiality_subtitle')}
                </h3>
                <GuidelineSection title="" items={arr('response_confidentiality_items')} />
              </div>

              {/* 2차 피해 방지 */}
              <div className="mb-0">
                <h3 className="text-base font-semibold text-jeju-ocean mb-2">
                  {g('response_secondary_harm_subtitle')}
                </h3>
                <GuidelineSection title="" items={arr('response_secondary_harm_items')} />
              </div>
            </motion.div>

            <hr className="border-coastal-gray/20 my-8" />

            {/* 7. 의료·응급 */}
            <motion.div variants={itemVariants}>
              <GuidelineSection
                title={g('medical_title') as string}
                items={arr('medical_items')}
              />
              {Array.isArray(facilities) && facilities.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-base font-semibold text-jeju-ocean mb-1">
                    {g('medical_facilities_subtitle')}
                  </h3>
                  <p className="text-xs text-coastal-gray mb-3">
                    {g('medical_facilities_note')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {facilities.map((f) => (
                      <div
                        key={f.number}
                        className="bg-sky-horizon/40 border border-seafoam/30 rounded-lg p-3"
                      >
                        <p className="text-sm font-semibold text-deep-ocean">{f.name}</p>
                        <p className="text-xs text-coastal-gray">{f.address}</p>
                        <p className="text-xs text-coastal-gray mb-1">{f.hours}</p>
                        <a
                          href={`tel:${f.number.replace(/-/g, '')}`}
                          className="text-sm font-bold text-jeju-ocean hover:underline"
                        >
                          {f.number}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <hr className="border-coastal-gray/20 my-8" />

            {/* 8. 야외·캠핑 안전 */}
            <motion.div variants={itemVariants}>
              <GuidelineSection
                title={g('outdoor_title') as string}
                items={arr('outdoor_items')}
              />
            </motion.div>

            <hr className="border-coastal-gray/20 my-8" />

            {/* 9. 접근성 */}
            <motion.div variants={itemVariants}>
              <GuidelineSection
                title={g('accessibility_title') as string}
                items={arr('accessibility_items')}
              />
            </motion.div>

            <hr className="border-coastal-gray/20 my-8" />

            {/* 10. 환경·지속가능성 */}
            <motion.div variants={itemVariants}>
              <GuidelineSection
                title={g('environment_title') as string}
                body={g('environment_intro') as string}
                items={arr('environment_items')}
              />
            </motion.div>

            <hr className="border-coastal-gray/20 my-8" />

            {/* 11. 문의 */}
            <motion.div variants={itemVariants}>
              <h2 className="typo-h3 mb-3">{g('contact_title')}</h2>
              <div className="bg-sky-horizon/40 border border-seafoam/30 rounded-xl p-4 sm:p-6">
                <p className="text-sm font-semibold text-deep-ocean mb-1">
                  <a
                    href="tel:01023790760"
                    className="text-jeju-ocean hover:underline"
                  >
                    {g('contact_body')}
                  </a>
                </p>
                <p className="text-xs text-coastal-gray">{g('contact_note')}</p>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Back to camp */}
      <Section background="ocean-sand" paddingTop="normal" paddingBottom="normal">
        <Container size="content" className="text-center">
          <Link
            href="/camps/2026"
            className="inline-flex items-center gap-2 text-sm text-jeju-ocean hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean rounded"
          >
            <span aria-hidden="true">←</span>
            {t('translation:nav.camp_2026')}
          </Link>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default CampGuidelines2026Page;
