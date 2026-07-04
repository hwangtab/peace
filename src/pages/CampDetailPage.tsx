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
import Container from '@/components/layout/Container';
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
import { useScrollReveal } from '@/hooks/useScrollReveal';

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
  const { item, viewport } = useScrollReveal();
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

  const tSchema = useCallback<SchemaT>((key, vars) => t(key, vars) as string, [t]);

  const structuredData = useMemo(() => {
    if (!camp) return [];
    return buildCampDetailSchemas({
      t: tSchema,
      lang: i18n.language,
      camp,
      ordinalLabel,
      breadcrumbs,
    });
  }, [camp, breadcrumbs, tSchema, i18n.language, ordinalLabel]);

  if (!camp) {
    return (
      <PageLayout title={t('camp.not_found')} description={t('camp.not_found_desc')}>
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-center">
            <h1 className="typo-h2 text-deep-ocean mb-4">{t('camp.not_found')}</h1>
            <p className="typo-body text-coastal-gray">{t('camp.not_found_desc')}</p>
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
        <Container size="prose">
          <motion.div variants={item} initial="hidden" whileInView="visible" viewport={viewport}>
            <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
              <SectionHeader title={t('camp.section_overview')} align="left" className="!mb-6" />
              <p className="typo-body mb-4 break-words">{camp.description}</p>
            </div>

            {camp.participants && camp.participants.length > 0 && (
              <motion.div
                variants={item}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                className="bg-white rounded-lg shadow-sm p-8 mb-8"
              >
                <SectionHeader title={t('camp.section_musicians')} align="left" className="!mb-6" />
                {musiciansResource.isLoading ? (
                  <p className="text-coastal-gray" role="status">
                    {t('common.loading')}
                  </p>
                ) : musiciansResource.error ? (
                  <p className="text-coastal-gray" role="alert">
                    {t('common.no_results')}
                  </p>
                ) : (
                  <CampParticipants participants={camp.participants} musicians={musicians} />
                )}
              </motion.div>
            )}

            {camp.staff && camp.staff.length > 0 && (
              <motion.div
                variants={item}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <SectionHeader title={t('camp.section_staff')} align="left" className="!mb-6" />
                <CampStaff staff={camp.staff} collaborators={camp.collaborators} />
              </motion.div>
            )}
          </motion.div>
        </Container>
      </Section>

      <SectionWave color="light-beige" flow="up" />

      <CampGallery camp={camp} />

      {/* Next Camp Banner — 현재 캠프가 최신이 아니고 fundingUrl이 있을 때만 표시 */}
      {(() => {
        const latestCamp = campList[campList.length - 1];
        return latestCamp && camp.id !== latestCamp.id && latestCamp.fundingUrl ? (
          <Section background="jeju-ocean" paddingTop="tight" paddingBottom="tight">
            <Container size="content" className="text-center">
              <h2 className="text-2xl font-bold text-white mb-3 break-words">
                {t(`camp.title_${latestCamp.year}`, { defaultValue: t('app.title') })}
              </h2>
              <p className="text-seafoam mb-6 text-sm break-words">
                {t(`camp.date_badge_${latestCamp.year}`, { defaultValue: '' })} ·{' '}
                {t(`camp.venue_${latestCamp.year}`, { defaultValue: '' })}
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
                  {t(`camp.ticketing_${latestCamp.year}`, {
                    defaultValue: t('camp.cta_final_button'),
                  })}
                </Button>
              </div>
            </Container>
          </Section>
        ) : null;
      })()}

      {/* 다른 연도 캠프 내비게이션 */}
      {(() => {
        const otherCamps = campList.filter((c) => c.id !== camp.id);
        if (otherCamps.length === 0) return null;
        return (
          <Section background="ocean-sand" paddingTop="tight" paddingBottom="tight">
            <Container size="content" className="text-center">
              <p className="text-sm font-medium text-coastal-gray uppercase tracking-wider mb-4">
                {t('camp.other_years')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {otherCamps.map((c) => (
                  <Button
                    key={c.id}
                    to={`/camps/${c.year}`}
                    variant="outline"
                    size="sm"
                    shape="rounded"
                  >
                    {c.year}
                  </Button>
                ))}
              </div>
            </Container>
          </Section>
        );
      })()}
    </PageLayout>
  );
};

export default CampDetailPage;
