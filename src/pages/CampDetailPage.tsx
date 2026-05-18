import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import CampHero from '@/components/camp/CampHero';
import CampGallery from '@/components/camp/CampGallery';
import CampParticipants from '@/components/camp/CampParticipants';
import CampStaff from '@/components/camp/CampStaff';
import { useCamps } from '@/hooks/useCamps';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/common/SectionHeader';
import SectionWave from '@/components/layout/SectionWave';
import { getFullUrl } from '@/config/env';
import { getMusicians } from '@/api/musicians';
import { Musician } from '@/types/musician';
import { formatOrdinal } from '@/utils/format';
import Button from '@/components/common/Button';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';
import { buildCampDetailSchemas } from '@/utils/buildCampDetailSchemas';
import type { SchemaT } from '@/utils/buildCamp2026Schemas';

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
    // t 는 매 렌더 새 reference. i18n.language 만으로 충분 (홈 페이지와 동일 패턴).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camp, i18n.language]);

  const structuredData = useMemo(() => {
    if (!camp) return [];
    return buildCampDetailSchemas({
      t: t as unknown as SchemaT,
      lang: i18n.language,
      camp,
      ordinalLabel,
      breadcrumbs,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camp, breadcrumbs, i18n.language, ordinalLabel]);

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
              <h2 className="text-2xl font-bold text-white mb-3 break-words">
                {t(`camp.title_${latestCamp.year}`, { defaultValue: t('app.title') })}
              </h2>
              <p className="text-seafoam mb-6 text-sm break-words">
                {t(`camp.date_badge_${latestCamp.year}`, { defaultValue: '' })} · {t(`camp.venue_${latestCamp.year}`, { defaultValue: '' })}
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
                  {t(`camp.ticketing_${latestCamp.year}`, { defaultValue: t('camp.cta_final_button') })}
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
