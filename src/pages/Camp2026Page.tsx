import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getCamps } from '@/data/camps';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/common/SectionHeader';
import WaveDivider from '@/components/common/WaveDivider';
import CampLineup from '@/components/camp/CampLineup';
import CampHero from '@/components/camp/CampHero';
import dynamic from 'next/dynamic';

const GangjeongStorySection = dynamic(() => import('@/components/camp/GangjeongStorySection'), {
  ssr: false,
});
import { getEventSchema, getBreadcrumbSchema, getHowToSchema } from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';
import Button from '@/components/common/Button';
import { formatOrdinal } from '@/utils/format';
import { getMusicians } from '@/api/musicians';
import { Musician } from '@/types/musician';
import { useLocalizedResource } from '@/hooks/useLocalizedResource';

interface CampPageProps {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const Camp2026Page: React.FC<CampPageProps> = ({ initialMusicians = [], initialLocale = 'ko' }) => {
  const { t, i18n } = useTranslation();
  const campList = getCamps(i18n.language, t);
  const camp2026 = campList.find((camp) => camp.id === 'camp-2026');
  const ordinalLabel = formatOrdinal(3, i18n.language);
  const fetchMusicians = useCallback((locale: string) => getMusicians(locale), []);
  const musiciansResource = useLocalizedResource<Musician>({
    initialData: initialMusicians,
    initialLocale,
    currentLocale: i18n.language,
    fetchResource: fetchMusicians,
  });
  const musicians = musiciansResource.isLoading ? [] : musiciansResource.data;

  if (!camp2026) {
    return (
      <PageLayout
        title={t('camp.ordinal', { num: ordinalLabel }) + ' ' + t('app.title') + ' (2026)'}
        description={t('camp.not_found_desc')}
      >
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-center">
            <h1 className="typo-h2 text-gray-900 mb-4">{t('camp.not_found')}</h1>
          </div>
        </div>
      </PageLayout>
    );
  }

  const translatedTitle = t('camp.title_2026');
  const translatedDescription = t('camp.description_2026');

  const eventSchema = getEventSchema(
    {
      name: translatedTitle,
      startDate: camp2026.startDate,
      endDate: camp2026.endDate || camp2026.startDate,
      description: translatedDescription,
      location: {
        name: t('camp.venue_2026'),
        address: t('camp.venue_2026'),
      },
      image:
        camp2026.images && camp2026.images.length > 0 && camp2026.images[0]
          ? getFullUrl(camp2026.images[0])
          : undefined,
      performers: camp2026.participants?.map((p) => ({
        type: 'MusicGroup',
        name: typeof p === 'string' ? p : p.name,
      })),
      ...(camp2026.fundingUrl
        ? {
            offers: {
              url: camp2026.fundingUrl,
              price: '0',
              priceCurrency: 'KRW',
              availability: 'https://schema.org/InStock',
            },
          }
        : {}),
    },
    i18n.language,
    t
  );

  const participantCount = camp2026.participants?.length || 0;

  const breadcrumbs = [
    { name: t('nav.home'), url: getFullUrl('/') },
    { name: `${t('nav.camp')} 2026`, url: getFullUrl('/camps/2026') },
  ];

  return (
    <PageLayout
      title={`${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (2026)`}
      description={translatedDescription}
      keywords={`${t('app.title')}, ${t('camp.ordinal', { num: ordinalLabel })}, 2026, ${t('camp.keywords_base')}`}
      ogImage={camp2026?.images?.[0] || '/images-webp/camps/2023/IMG_2064.webp'}
      structuredData={[eventSchema, getBreadcrumbSchema(breadcrumbs), getHowToSchema(i18n.language, t)]}
      breadcrumbs={breadcrumbs}
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
      <Section background="ocean-sand" className="pb-24 md:pb-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 items-stretch min-w-0">
              {/* Poster */}
              {camp2026.fundingUrl ? (
                <a
                  href={`${camp2026.fundingUrl}?utm_source=website&utm_medium=cta&utm_campaign=gpmc3&utm_content=poster`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-[360px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Image
                    src="/images-webp/camps/2026/2026poster1.webp"
                    alt={translatedTitle}
                    width={360}
                    height={509}
                    className="w-full h-auto"
                  />
                </a>
              ) : (
                <div className="w-full md:w-[360px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images-webp/camps/2026/2026poster1.webp"
                    alt={translatedTitle}
                    width={360}
                    height={509}
                    className="w-full h-auto"
                  />
                </div>
              )}
              {/* Info */}
              <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
                <SectionHeader title={t('camp.section_overview')} align="left" className="!mb-6" />
                <p className="typo-body mb-6 break-words">{translatedDescription}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-ocean-sand rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      {t('camp.label_period')}
                    </p>
                    <p className="text-sm font-bold text-jeju-ocean break-words">
                      {t('camp.date_badge_2026')}
                    </p>
                  </div>
                  <div className="bg-ocean-sand rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      {t('camp.label_location')}
                    </p>
                    <p className="text-sm font-bold text-jeju-ocean break-words">
                      {t('camp.venue_2026')}
                    </p>
                  </div>
                  <div className="bg-ocean-sand rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
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
        </div>
      </Section>

      <WaveDivider
        className="text-ocean-sand -mb-[60px] sm:-mb-[100px] relative z-10"
        direction="down"
      />

      {/* Gangjeong Story Section */}
      <GangjeongStorySection />

      <WaveDivider className="text-white -mt-[60px] sm:-mt-[100px] relative z-10" />

      {/* Lineup Section */}
      {camp2026.participants && camp2026.participants.length > 0 && (
        <Section background="white" id="lineup">
          <div className="container mx-auto px-4">
            <SectionHeader
              title={t('camp.section_musicians')}
              subtitle={t('camp.lineup_count', { count: participantCount })}
            />
            <div className="max-w-6xl mx-auto">
              {musiciansResource.isLoading ? (
                <p className="text-center text-gray-500 py-10" role="status">
                  {t('common.loading')}
                </p>
              ) : musiciansResource.error ? (
                <p className="text-center text-gray-500 py-10" role="alert">
                  {t('common.no_results')}
                </p>
              ) : (
                <CampLineup
                  participants={camp2026.participants}
                  musicians={musicians}
                  campYear={2026}
                />
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Final CTA Section */}
      {camp2026.fundingUrl && (
        <>
          <section
            className="relative py-20 md:py-28 bg-cover bg-center bg-deep-ocean"
            style={{ backgroundImage: "url('/images-webp/camps/2023/20230610밤 전쟁을끝내자.webp')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/70" aria-hidden="true" />
            <div className="container mx-auto px-4 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="typo-h2 text-white mb-4">{t('camp.cta_final_heading')}</h2>
                <p className="typo-body text-gray-200 mb-8 max-w-lg mx-auto">
                  {t('camp.cta_final_body')}
                </p>
                <Button href={camp2026.fundingUrl} variant="gold" external utmContent="final-cta">
                  {t('camp.cta_final_button')}
                </Button>
              </motion.div>
            </div>
          </section>
        </>
      )}
    </PageLayout>
  );
};

export default Camp2026Page;
