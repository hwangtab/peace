import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/common/PageHero';
import PageIntroSection from '@/components/common/PageIntroSection';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/common/SectionHeader';
import SectionWave from '@/components/layout/SectionWave';
import SolidarityEventFeature from '@/components/solidarity/SolidarityEventFeature';
import { getSolidarityEvents } from '@/data/solidarity';
import { getFullUrl } from '@/config/env';

const SolidarityPage: React.FC = () => {
  const { t } = useTranslation();

  const events = useMemo(() => getSolidarityEvents(t), [t]);

  const breadcrumbs = useMemo(
    () => [
      { name: t('nav.home'), url: getFullUrl('/') },
      { name: t('solidarity.breadcrumb'), url: getFullUrl('/solidarity') },
    ],
    [t],
  );

  return (
    <PageLayout
      title={t('solidarity.page_title')}
      description={t('solidarity.page_desc')}
      ogImage="/images-webp/gangjeong/gangjeong-memory.webp"
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <PageHero
        title={t('solidarity.hero_title')}
        subtitle={t('solidarity.hero_subtitle')}
        backgroundImage="/images-webp/gangjeong/gangjeong-memory.webp"
      />

      <SectionWave color="white" flow="up" />

      <PageIntroSection
        eyebrow={t('solidarity.breadcrumb')}
        heading={t('solidarity.intro_heading')}
        paragraphs={[t('solidarity.intro_paragraph')]}
      />

      <SectionWave color="ocean-sand" flow="up" />

      <Section background="ocean-sand" paddingBottom="loose">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('solidarity.concerts_title')}
            subtitle={t('solidarity.concerts_subtitle')}
          />

          {events.length > 0 ? (
            <div className="max-w-5xl mx-auto space-y-12">
              {events.map((event, index) => (
                <SolidarityEventFeature
                  key={event.id}
                  event={event}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className="text-center typo-body text-coastal-gray py-16">
              {t('solidarity.empty_message')}
            </p>
          )}
        </div>
      </Section>
    </PageLayout>
  );
};

export default SolidarityPage;
