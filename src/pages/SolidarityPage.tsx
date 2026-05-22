import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/common/PageHero';
import PageIntroSection from '@/components/common/PageIntroSection';
import Section from '@/components/layout/Section';
import Container from '@/components/layout/Container';
import SectionHeader from '@/components/common/SectionHeader';
import SectionWave from '@/components/layout/SectionWave';
import SolidarityEventFeature from '@/components/solidarity/SolidarityEventFeature';
import { getSolidarityEvents } from '@/data/solidarity';
import { getFullUrl } from '@/config/env';
import { getBreadcrumbSchema, getWebPageSchema } from '@/utils/structuredData';
import { buildSolidarityEventSchema } from '@/utils/buildSolidaritySchemas';
import { Musician } from '@/types/musician';
import { getMusicians } from '@/api/musicians';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';

interface Props {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const SolidarityPage: React.FC<Props> = ({
  initialMusicians = [],
  initialLocale = 'ko',
}) => {
  const { t, i18n } = useTranslation();

  const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);
  const musiciansResource = useLocalizedResource<Musician>({
    initialData: initialMusicians,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchMusicians,
  });
  const musicians = musiciansResource.isLoading ? initialMusicians : musiciansResource.data;

  const events = useMemo(() => getSolidarityEvents(t), [t]);

  const breadcrumbs = useMemo(
    () => [
      { name: t('nav.home'), url: getFullUrl('/') },
      { name: t('solidarity.breadcrumb'), url: getFullUrl('/solidarity') },
    ],
    [t],
  );

  const PAGE_URL = getFullUrl('/solidarity');

  const structuredData = useMemo(() => {
    const firstEvent = events[0];
    const primaryImageUrl = firstEvent ? getFullUrl(firstEvent.poster) : undefined;
    return [
      ...events.map(buildSolidarityEventSchema),
      getBreadcrumbSchema(breadcrumbs),
      getWebPageSchema({
        name: t('solidarity.page_title'),
        description: t('solidarity.page_desc'),
        url: PAGE_URL,
        ...(firstEvent ? { mainEntityId: `${PAGE_URL}#${firstEvent.id}` } : {}),
        ...(primaryImageUrl ? { primaryImageUrl } : {}),
        keywords: [
          '팔레스타인 해방', '연대 공연', 'WE SING FOR YOUR FREEDOM',
          '평화 문화제', '강정피스앤뮤직캠프', '팔레스타인 활동가 석방',
          'Palestine solidarity concert', 'Seoul peace event 2026',
        ],
      }),
    ];
  }, [t, breadcrumbs, events, PAGE_URL]);

  return (
    <PageLayout
      title={t('solidarity.page_title')}
      description={t('solidarity.page_desc')}
      ogImage={events[0]?.poster ?? '/images-webp/gangjeong/gangjeong-memory.webp'}
      ogImageAlt={events[0]?.posterAlt}
      structuredData={structuredData}
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
        <Container size="content">
          <SectionHeader
            title={t('solidarity.concerts_title')}
            subtitle={t('solidarity.concerts_subtitle')}
          />

          {events.length > 0 ? (
            <div className="space-y-12">
              {events.map((event, index) => (
                <SolidarityEventFeature
                  key={event.id}
                  event={event}
                  index={index}
                  musicians={musicians}
                  detailHref={`/solidarity/${event.id}`}
                  compact={true}
                />
              ))}
            </div>
          ) : (
            <p className="text-center typo-body text-coastal-gray py-16">
              {t('solidarity.empty_message')}
            </p>
          )}
        </Container>
      </Section>
    </PageLayout>
  );
};

export default SolidarityPage;
