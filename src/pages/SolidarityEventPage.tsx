import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import SectionWave from '@/components/layout/SectionWave';
import PageHero from '@/components/common/PageHero';
import SolidarityEventFeature from '@/components/solidarity/SolidarityEventFeature';
import { getSolidarityEvents } from '@/data/solidarity';
import { getFullUrl } from '@/config/env';
import { getBreadcrumbSchema, getWebPageSchema } from '@/utils/structuredData';
import { buildSolidarityEventSchema } from '@/utils/buildSolidaritySchemas';
import { Musician } from '@/types/musician';
import { getMusicians } from '@/api/musicians';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';

interface Props {
  slug: string;
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const SolidarityEventPage: React.FC<Props> = ({
  slug,
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

  const event = useMemo(
    () => getSolidarityEvents(t).find((e) => e.id === slug) ?? null,
    [t, slug],
  );

  const pageUrl = getFullUrl(`/solidarity/${slug}`);

  const breadcrumbs = useMemo(
    () => [
      { name: t('nav.home'), url: getFullUrl('/') },
      { name: t('solidarity.breadcrumb'), url: getFullUrl('/solidarity') },
      { name: event?.title ?? slug, url: pageUrl },
    ],
    [t, event, slug, pageUrl],
  );

  const structuredData = useMemo(() => {
    if (!event) return [];
    return [
      buildSolidarityEventSchema(event),
      getBreadcrumbSchema(breadcrumbs),
      getWebPageSchema({
        name: `${event.title} | ${t('solidarity.page_title')}`,
        description: (event.paragraphs[0] ?? '').slice(0, 160),
        url: pageUrl,
        mainEntityId: `${getFullUrl('/solidarity')}#${event.id}`,
        primaryImageUrl: getFullUrl(event.poster),
        keywords: [
          event.title,
          '연대 공연', '평화 문화제', '강정피스앤뮤직캠프',
          'Palestine solidarity', 'peace concert Seoul',
        ],
      }),
    ];
  }, [t, event, breadcrumbs, pageUrl]);

  if (!event) return null;

  const seoTitle = `${event.title} | ${t('solidarity.page_title')}`;
  const seoDescription = (event.paragraphs[0] ?? '').slice(0, 160);

  return (
    <PageLayout
      title={seoTitle}
      description={seoDescription}
      ogImage={event.poster}
      ogImageAlt={event.posterAlt}
      ogType="event"
      canonicalUrl={pageUrl}
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <PageHero
        title={event.title}
        backgroundImage={event.poster}
      />
      <SectionWave color="ocean-sand" flow="up" />

      <Section background="ocean-sand" paddingBottom="loose">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/solidarity"
              className="inline-flex items-center gap-1 text-sm text-jeju-ocean hover:text-ocean-mist transition-colors mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean rounded"
            >
              ← {t('solidarity.back_to_list')}
            </Link>

            <SolidarityEventFeature
              event={event}
              index={0}
              musicians={musicians}
            />
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default SolidarityEventPage;
