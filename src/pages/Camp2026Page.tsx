import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import Image from 'next/image';
import { useCamp } from '@/hooks/useCamps';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import Container from '@/components/layout/Container';
import SectionHeader from '@/components/common/SectionHeader';
import SectionWave from '@/components/layout/SectionWave';
import { CampTimetable } from '@/components/camp/timetable';
import { timetable2026 } from '@/data/timetable-2026';
import CampHero from '@/components/camp/CampHero';
import dynamic from 'next/dynamic';

const GangjeongStorySection = dynamic(() => import('@/components/camp/GangjeongStorySection'));
const GuidelinesSummary = dynamic(() => import('@/components/camp/guidelines/GuidelinesSummary'));
import { getFullUrl } from '@/config/env';
import { buildUtmUrl } from '@/utils/utm';
import Button from '@/components/common/Button';
import { formatOrdinal } from '@/utils/format';
import { getMusicians } from '@/api/musicians';
import { Musician } from '@/types/musician';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';
import { buildCamp2026Schemas } from '@/utils/buildCamp2026Schemas';

interface CampPageProps {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const Camp2026Page: React.FC<CampPageProps> = ({
  initialMusicians = [],
  initialLocale = 'ko',
}) => {
  const { t, i18n } = useTranslation();
  const camp2026 = useCamp('camp-2026');
  const ordinalLabel = formatOrdinal(3, i18n.language);
  const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);
  const musiciansResource = useLocalizedResource<Musician>({
    initialData: initialMusicians,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchMusicians,
  });
  const musicians = useMemo(
    () => (musiciansResource.isLoading ? [] : musiciansResource.data),
    [musiciansResource.isLoading, musiciansResource.data],
  );

  const breadcrumbs = useMemo(() => [
    { name: t('nav.home'), url: getFullUrl('/') },
    { name: `${t('nav.camp')} 2026`, url: getFullUrl('/camps/2026') },
  ], [t]);

  const tSchema = useCallback(
    (key: string, vars?: Record<string, string | number>): string =>
      t(key, vars as Record<string, unknown>) as string,
    [t],
  );

  const structuredData = useMemo(() => {
    if (!camp2026) return [];
    return buildCamp2026Schemas({
      t: tSchema,
      lang: i18n.language,
      camp: camp2026,
      musicians,
      ordinalLabel,
    });
  }, [camp2026, musicians, tSchema, i18n.language, ordinalLabel]);

  if (!camp2026) {
    return (
      <PageLayout
        title={t('camp.ordinal', { num: ordinalLabel }) + ' ' + t('app.title') + ' (2026)'}
        description={t('camp.not_found_desc')}
      >
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-center">
            <h1 className="typo-h2 text-deep-ocean mb-4">{t('camp.not_found')}</h1>
          </div>
        </div>
      </PageLayout>
    );
  }

  const translatedTitle = t('camp.title_2026');
  const translatedDescription = t('camp.description_2026');
  const seoTitle = t('camp.seo_title_2026');
  const seoDescription = t('camp.seo_description_2026');
  const participantCount = camp2026.participants?.length || 0;

  return (
    <PageLayout
      title={seoTitle}
      description={seoDescription}
      ogImage="/images/og/peace-camp-og.jpg"
      ogImageAlt={translatedTitle}
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      ogType="event"
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <CampHero
        camp={camp2026}
        featured
        dateBadge={t('camp.date_badge_2026')}
        dateDisplay={t('camp.date_2026')}
      >
        <Button href="#lineup" variant="gold" size="sm">
          {t('camp.lineup_count', { count: participantCount })}
        </Button>
        {camp2026.fundingUrl && (
          <Button
            href={camp2026.fundingUrl}
            variant="white"
            size="sm"
            external
            utmContent="hero"
          >
            {t('camp.ticketing_2026')}
          </Button>
        )}
      </CampHero>

      {/* Overview Section */}
      <Section background="ocean-sand" paddingBottom="loose">
        <Container size="content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 items-stretch min-w-0">
              {/* Poster */}
              {camp2026.fundingUrl ? (
                <a
                  href={buildUtmUrl(camp2026.fundingUrl, 'poster')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-[360px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Image
                    src="/images-webp/camps/2026/2026poster1.webp"
                    alt={t('camp.poster_alt_2026')}
                    width={360}
                    height={509}
                    sizes="(max-width: 768px) 100vw, 360px"
                    quality={65}
                    className="w-full h-auto"
                  />
                </a>
              ) : (
                <div className="w-full md:w-[360px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images-webp/camps/2026/2026poster1.webp"
                    alt={t('camp.poster_alt_2026')}
                    width={360}
                    height={509}
                    sizes="(max-width: 768px) 100vw, 360px"
                    quality={65}
                    className="w-full h-auto"
                  />
                </div>
              )}
              {/* Info */}
              <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
                <SectionHeader
                  title={t('camp.section_overview')}
                  subtitle={t('camp.section_overview_subtitle')}
                  align="left"
                  className="!mb-6"
                />
                <p className="typo-body mb-6 break-words">{translatedDescription}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-sky-horizon/60 border border-seafoam/40 rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-coastal-gray mb-1">
                      {t('camp.label_period')}
                    </p>
                    <p className="text-sm font-bold text-jeju-ocean break-words">
                      {t('camp.date_badge_2026')}
                    </p>
                  </div>
                  <div className="bg-sky-horizon/60 border border-seafoam/40 rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-coastal-gray mb-1">
                      {t('camp.label_location')}
                    </p>
                    <p className="text-sm font-bold text-jeju-ocean break-words">
                      {t('camp.venue_2026')}
                    </p>
                  </div>
                  <div className="bg-sky-horizon/60 border border-seafoam/40 rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-coastal-gray mb-1">
                      {t('camp.label_participants')}
                    </p>
                    <p className="text-sm font-bold text-jeju-ocean break-words">
                      {t('camp.participant_count', { count: participantCount })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </Section>

      <SectionWave color="ocean-sand" />

      {/* Lineup / Timetable Section */}
      {camp2026.participants && camp2026.participants.length > 0 && (
        <Section
          background="sky-horizon"
          id="lineup"
          paddingTop="loose"
          paddingBottom="loose"
        >
          <Container size="content">
            <SectionHeader
              title={t('camp.section_musicians')}
              subtitle={t('camp.lineup_count', { count: participantCount })}
            />
            <div>
              {musiciansResource.isLoading ? (
                <p className="text-center text-coastal-gray py-10" role="status">
                  {t('common.loading')}
                </p>
              ) : musiciansResource.error ? (
                <p className="text-center text-coastal-gray py-10" role="alert">
                  {t('common.no_results')}
                </p>
              ) : (
                <CampTimetable
                  data={timetable2026}
                  musicians={musicians}
                  campYear={2026}
                />
              )}
            </div>
          </Container>
        </Section>
      )}

      <SectionWave color="sky-horizon" />

      {/* Gangjeong Story Section */}
      <GangjeongStorySection />

      {/* Guidelines Summary Section */}
      <>
        <SectionWave color="deep-ocean" />
        <GuidelinesSummary />
        <SectionWave color="light-beige" />
      </>

      {/* Final CTA Section */}
      {camp2026.fundingUrl && (
        <>
          <Section background="deep-ocean" paddingTop="loose" paddingBottom="loose" className="relative overflow-hidden">
            <Image
              src="/images-webp/camps/2026/cta-end-the-war-2026.webp"
              alt={t('camp.cta_final_image_alt')}
              fill
              sizes="100vw"
              quality={60}
              loading="lazy"
              className="absolute inset-0 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/70" aria-hidden="true" />
            <Container size="content" className="text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="typo-h2 text-white mb-4">{t('camp.cta_final_heading')}</h2>
                <p className="typo-body text-cloud-white/80 mb-8 max-w-lg mx-auto">
                  {t('camp.cta_final_body')}
                </p>
                <Button href={camp2026.fundingUrl} variant="gold" external utmContent="final-cta">
                  {t('camp.cta_final_button')}
                </Button>
              </motion.div>
            </Container>
          </Section>
        </>
      )}
    </PageLayout>
  );
};

export default Camp2026Page;
