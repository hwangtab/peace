import React, { useMemo, useCallback } from 'react';
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
import { getBreadcrumbSchema, getWebPageSchema } from '@/utils/structuredData';
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

  const POSTER_URL = getFullUrl('/images-webp/solidarity/we-are-sail-for-your-freedom.webp');
  const PAGE_URL = getFullUrl('/solidarity');

  const structuredData = useMemo(() => {
    const eventSchema = {
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      "@id": `${PAGE_URL}#event-sail`,
      "name": t('solidarity.event_sail.title'),
      "startDate": "2026-05-23T19:00:00+09:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "isAccessibleForFree": true,
      "location": {
        "@type": "Place",
        "name": t('solidarity.event_sail.venue'),
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "종로 26",
          "addressLocality": "서울특별시",
          "addressRegion": "종로구",
          "addressCountry": "KR"
        }
      },
      "image": POSTER_URL,
      "description": t('solidarity.event_sail.para_1'),
      "performer": [
        { "@type": "MusicGroup", "name": "강가히말라야" },
        { "@type": "MusicGroup", "name": "길가는밴드" },
        { "@type": "MusicGroup", "name": "모레도토요일" },
        { "@type": "MusicGroup", "name": "삼각전파사" },
        { "@type": "Person", "name": "이서영" },
      ],
      "organizer": {
        "@type": "Organization",
        "name": "팔레스타인해방을위한항해한국본부 × 강정피스앤뮤직캠프조직위원회"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KRW",
        "availability": "https://schema.org/InStock",
        "url": PAGE_URL
      },
      "url": PAGE_URL
    };

    return [
      eventSchema,
      getBreadcrumbSchema(breadcrumbs),
      getWebPageSchema({
        name: t('solidarity.page_title'),
        description: t('solidarity.page_desc'),
        url: PAGE_URL,
        mainEntityId: `${PAGE_URL}#event-sail`,
        primaryImageUrl: POSTER_URL,
        keywords: [
          '팔레스타인 해방', '연대 공연', 'WE SING FOR YOUR FREEDOM',
          '평화 문화제', '강정피스앤뮤직캠프', '팔레스타인 활동가 석방',
          'Palestine solidarity concert', 'Seoul peace event 2026',
        ],
      }),
    ];
  }, [t, breadcrumbs, PAGE_URL, POSTER_URL]);

  return (
    <PageLayout
      title={t('solidarity.page_title')}
      description={t('solidarity.page_desc')}
      ogImage="/images-webp/solidarity/we-are-sail-for-your-freedom.webp"
      ogImageAlt={t('solidarity.event_sail.poster_alt')}
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
                  musicians={musicians}
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
