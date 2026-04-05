import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, useInView } from 'framer-motion';
import CampHero from '@/components/camp/CampHero';
import CampGallery from '@/components/camp/CampGallery';
import CampParticipants from '@/components/camp/CampParticipants';
import CampStaff from '@/components/camp/CampStaff';
import { getCamps } from '@/data/camps';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/common/SectionHeader';
import WaveDivider from '@/components/common/WaveDivider';
import { getEventSchema, getBreadcrumbSchema } from '@/utils/structuredData';
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
  const campList = getCamps(i18n.language, t);
  const camp = campList.find((c) => c.id === campId);
  const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);
  const musiciansResource = useLocalizedResource<Musician>({
    initialData: initialMusicians,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchMusicians,
  });
  const musicians = musiciansResource.isLoading ? [] : musiciansResource.data;
  const infoRef = useRef(null);
  const isInfoInView = useInView(infoRef, { once: true, margin: '-100px' });

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

  const ordinal = getCampOrdinal(camp.year, campList);
  const ordinalLabel = formatOrdinal(ordinal, i18n.language);

  // Event Schema construction
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
    },
    i18n.language,
    t
  );

  const breadcrumbs = [
    { name: t('nav.home'), url: getFullUrl('/') },
    { name: `${t('nav.camp')} ${camp.year}`, url: getFullUrl(`/camps/${camp.year}`) },
  ];

  return (
    <PageLayout
      title={`${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (${camp.year}) - ${camp.slogan || ''}`}
      description={camp.description}
      ogImage={camp.images?.[0]}
      structuredData={[eventSchema, getBreadcrumbSchema(breadcrumbs)]}
      breadcrumbs={breadcrumbs}
      ogType="event"
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <CampHero camp={camp} />

      <Section background="ocean-sand" ref={infoRef} className="pb-24 md:pb-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
                animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
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
                    inView={isInfoInView}
                  />
                )}
              </motion.div>
            )}

            {camp.staff && camp.staff.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <SectionHeader title={t('camp.section_staff')} align="left" className="!mb-6" />
                <CampStaff
                  staff={camp.staff}
                  collaborators={camp.collaborators}
                  inView={isInfoInView}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </Section>

      <WaveDivider className="text-light-beige -mt-[60px] sm:-mt-[100px] relative z-10" />

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
