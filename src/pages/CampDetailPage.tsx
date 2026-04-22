import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import CampHero from '@/components/camp/CampHero';
import CampGallery from '@/components/camp/CampGallery';
import CampParticipants from '@/components/camp/CampParticipants';
import CampStaff from '@/components/camp/CampStaff';
import { useCamps } from '@/hooks/useCamps';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/common/SectionHeader';
import SectionWave from '@/components/layout/SectionWave';
import { getEventSchema, getBreadcrumbSchema, getHowToSchema, getWebPageSchema } from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';
import { getMusicians } from '@/api/musicians';
import { Musician } from '@/types/musician';
import { formatOrdinal } from '@/utils/format';
import Button from '@/components/common/Button';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';

interface CampDetailPageProps {
  campId: string;
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const getCampOrdinal = (year: number, campList: Array<{ year: number }>): number => {
  const campIndex = campList.findIndex((c) => c.year === year);
  return campIndex >= 0 ? campIndex + 1 : 0;
};

const CampDetailPage: React.FC<CampDetailPageProps> = ({
  campId,
  initialMusicians = [],
  initialLocale = 'ko',
}) => {
  const { t, i18n } = useTranslation();
  const campList = useCamps();
  const camp = campList.find((c) => c.id === campId);
  const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);
  const musiciansResource = useLocalizedResource<Musician>({
    initialData: initialMusicians,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchMusicians,
  });
  const musicians = musiciansResource.isLoading ? [] : musiciansResource.data;

  const ordinalLabel = useMemo(() => {
    if (!camp) return '';
    return formatOrdinal(getCampOrdinal(camp.year, campList), i18n.language);
  }, [camp, campList, i18n.language]);

  const breadcrumbs = useMemo(() => {
    if (!camp) return [];
    return [
      { name: t('nav.home'), url: getFullUrl('/') },
      { name: `${t('nav.camp')} ${camp.year}`, url: getFullUrl(`/camps/${camp.year}`) },
    ];
  }, [camp, t]);

  const structuredData = useMemo(() => {
    if (!camp) return [];

    const getKeywordsForCamp = (year: number): string[] => {
      if (year === 2023) {
        return [
          '제1회 강정피스앤뮤직캠프',
          '1st Gangjeong Peace Music Camp 2023',
          '강정 평화음악제',
          'Gangjeong peace festival',
          '2023 캠프',
          'Jeju music 2023',
          '첫 번째 캠프',
          'first camp',
        ];
      } else if (year === 2025) {
        return [
          '제2회 강정피스앤뮤직캠프',
          '2nd Gangjeong Peace Music Camp 2025',
          '강정 평화음악제',
          'Gangjeong peace festival',
          '2025 캠프',
          'Jeju music 2025',
          '두 번째 캠프',
          'second camp',
        ];
      }
      return [];
    };

    const eventSchema = getEventSchema(
      {
        name: camp.title,
        startDate: camp.startDate,
        endDate: camp.endDate || camp.startDate,
        description: camp.description,
        location: {
          name: camp.location.split('(')[0]?.trim() || camp.location,
          address: camp.location.includes('(')
            ? camp.location.split('(')[1]?.replace(')', '') || camp.location
            : camp.location,
        },
        image:
          camp.images && camp.images.length > 0 && camp.images[0]
            ? getFullUrl(camp.images[0])
            : undefined,
        performers: camp.participants?.map((p) => ({
          type: 'MusicGroup',
          name: typeof p === 'string' ? p : p.name,
        })),
        eventStatus: camp.year < 2026
          ? "https://schema.org/EventCompleted"
          : "https://schema.org/EventScheduled",
        offers: {
          url: getFullUrl(`/camps/${camp.year}`),
          price: '0',
          priceCurrency: 'KRW',
          availability: camp.year < 2026
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/InStock',
        },
        url: getFullUrl(`/camps/${camp.year}`),
        id: `https://peaceandmusic.net/camps/${camp.year}#event`,
        superEventId: 'https://peaceandmusic.net/#event-series',
      },
      i18n.language,
      t
    );

    return [
      eventSchema,
      getBreadcrumbSchema(breadcrumbs),
      ...(camp.year >= 2026 ? [getHowToSchema(i18n.language, t)] : []),
      getWebPageSchema({
        name: `${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (${camp.year})`,
        description: camp.description,
        url: getFullUrl(`/camps/${camp.year}`),
        datePublished: camp.startDate,
        ...(camp.year < 2026 && { keywords: getKeywordsForCamp(camp.year) }),
      }),
    ];
  }, [camp, breadcrumbs, i18n.language, t, ordinalLabel]);

  if (!camp) {
    return (
      <PageLayout title={t('camp.not_found')} description={t('camp.not_found_desc')}>
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-center">
            <h1 className="typo-h2 text-gray-900 mb-4">{t('camp.not_found')}</h1>
            <p className="typo-body text-gray-600">{t('camp.not_found_desc')}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (${camp.year}) - ${camp.slogan || ''}`}
      description={camp.description}
      ogImage={camp.images?.[0]}
      ogImageAlt={`${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (${camp.year})`}
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      ogType="event"
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <CampHero camp={camp} />

      <Section background="ocean-sand" paddingBottom="loose">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
              <SectionHeader title={t('camp.section_overview')} align="left" className="!mb-6" />
              <p className="typo-body mb-4 break-words">{camp.description}</p>
            </div>

            {camp.participants && camp.participants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-lg shadow-sm p-8 mb-8"
              >
                <SectionHeader title={t('camp.section_musicians')} align="left" className="!mb-6" />
                {musiciansResource.isLoading ? (
                  <p className="text-gray-600" role="status">
                    {t('common.loading')}
                  </p>
                ) : musiciansResource.error ? (
                  <p className="text-gray-600" role="alert">
                    {t('common.no_results')}
                  </p>
                ) : (
                  <CampParticipants
                    participants={camp.participants}
                    musicians={musicians}
                  />
                )}
              </motion.div>
            )}

            {camp.staff && camp.staff.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <SectionHeader title={t('camp.section_staff')} align="left" className="!mb-6" />
                <CampStaff
                  staff={camp.staff}
                  collaborators={camp.collaborators}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </Section>

      <SectionWave color="light-beige" flow="up" />

      <CampGallery camp={camp} />

      {/* Next Camp Banner — 현재 캠프가 최신이 아니고 fundingUrl이 있을 때만 표시 */}
      {(() => {
        const latestCamp = campList[campList.length - 1];
        return latestCamp && camp.id !== latestCamp.id && latestCamp.fundingUrl ? (
          <div className="bg-jeju-ocean py-12">
            <div className="container mx-auto px-4 text-center">
              <h3 className="text-2xl font-bold text-white mb-3 break-words">
                {t(`camp.title_${latestCamp.year}`)}
              </h3>
              <p className="text-seafoam mb-6 text-sm break-words">
                {t(`camp.date_badge_${latestCamp.year}`)} · {t(`camp.venue_${latestCamp.year}`)}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button to={`/camps/${latestCamp.year}`} variant="ghost-white" size="sm">
                  {t('camp.view_detail')}
                </Button>
                <Button
                  href={latestCamp.fundingUrl}
                  variant="gold"
                  size="sm"
                  external
                  utmContent="past-camp"
                >
                  {t(`camp.ticketing_${latestCamp.year}`)}
                </Button>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* 다른 연도 캠프 내비게이션 */}
      {(() => {
        const otherCamps = campList.filter((c) => c.id !== camp.id);
        if (otherCamps.length === 0) return null;
        return (
          <div className="bg-ocean-sand py-8">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm font-medium text-coastal-gray uppercase tracking-wider mb-4">
                {t('camp.other_years')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {otherCamps.map((c) => (
                  <Button key={c.id} to={`/camps/${c.year}`} variant="outline" size="sm" shape="rounded">
                    {c.year}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </PageLayout>
  );
};

export default CampDetailPage;
