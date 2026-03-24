import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { getCamps } from '@/data/camps';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/common/SectionHeader';
import WaveDivider from '@/components/common/WaveDivider';
import CampLineup from '@/components/camp/CampLineup';
import dynamic from 'next/dynamic';

const GangjeongStorySection = dynamic(
  () => import('@/components/camp/GangjeongStorySection'),
  { ssr: false }
);
import { getEventSchema, getBreadcrumbSchema } from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';
import Button from '@/components/common/Button';
import { formatOrdinal } from '@/utils/format';
import { getMusicians } from '@/api/musicians';
import { Musician } from '@/types/musician';

interface CampPageProps {
  initialMusicians?: Musician[];
  initialLocale?: string;
}

const Camp2026Page: React.FC<CampPageProps> = ({ initialMusicians = [], initialLocale = 'ko' }) => {
  const { t, i18n } = useTranslation();
  const campList = getCamps(i18n.language);
  const camp2026 = campList.find(camp => camp.id === 'camp-2026');
  const ordinalLabel = formatOrdinal(3, i18n.language);
  const [musicians, setMusicians] = useState<Musician[]>(initialMusicians);
  const infoRef = useRef(null);
  const isInfoInView = useInView(infoRef, { once: true, margin: '-100px' });
  const lineupRef = useRef(null);
  const isLineupInView = useInView(lineupRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (i18n.language === initialLocale) {
      return;
    }
    let isCancelled = false;
    getMusicians(i18n.language).then((data) => {
      if (!isCancelled) setMusicians(data);
    }).catch(console.error);
    return () => { isCancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, initialLocale]);

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
  const translatedSlogan = t('camp.slogan_2026');

  const eventSchema = getEventSchema({
    name: translatedTitle,
    startDate: camp2026.startDate,
    endDate: camp2026.endDate || camp2026.startDate,
    description: translatedDescription,
    location: {
      name: t('camp.venue_2026'),
      address: t('camp.venue_2026')
    },
    image: camp2026.images && camp2026.images.length > 0 && camp2026.images[0] ? getFullUrl(camp2026.images[0]) : undefined,
    performers: camp2026.participants?.map(p => ({
      type: 'MusicGroup',
      name: typeof p === 'string' ? p : p.name
    })),
    ...(camp2026.fundingUrl ? {
      offers: {
        url: camp2026.fundingUrl,
        price: "0",
        priceCurrency: "KRW",
        availability: "https://schema.org/InStock"
      }
    } : {})
  }, i18n.language);

  const participantCount = camp2026.participants?.length || 0;

  return (
    <PageLayout
      title={`${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (2026)`}
      description={translatedDescription}
      keywords={`${t('app.title')}, ${t('camp.ordinal', { num: ordinalLabel })}, 2026, ${t('camp.keywords_base')}`}
      ogImage="/images-webp/camps/2026/2026poster1-og.webp"
      structuredData={[
        eventSchema,
        getBreadcrumbSchema([
          { name: t('nav.home'), url: "https://peaceandmusic.net/" },
          { name: t('nav.camp'), url: "https://peaceandmusic.net/camps/2026" },
          { name: "2026", url: "https://peaceandmusic.net/camps/2026" }
        ])
      ]}
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center text-center overflow-hidden bg-ocean-gradient pt-20 pb-16">
        <Image
          src={camp2026?.images?.[0] || '/images-webp/camps/2023/IMG_2064.webp'}
          alt={translatedTitle}
          fill
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ y: 16 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <span className="inline-block px-5 py-1.5 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full mb-4 sm:mb-6 text-sm tracking-wider border border-white/30 break-words max-w-full">
              {t('camp.date_badge_2026')}
            </span>

            <h1 className="typo-h1 text-white mb-3 sm:mb-4 hyphens-auto break-words">{translatedTitle}</h1>
            <p className="typo-subtitle text-gray-100 mb-5 sm:mb-8 hyphens-auto break-words">{translatedSlogan}</p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-6 text-white mb-5 sm:mb-8">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-300 mb-1">{t('camp.label_period')}</p>
                <p className="text-lg font-medium break-words">{t('camp.date_2026')}</p>
              </div>
              <div className="hidden sm:block text-gray-400">|</div>
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-300 mb-1">{t('camp.label_location')}</p>
                <p className="text-lg font-medium break-words">{t('camp.venue_2026')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <Button href="#lineup" variant="gold" size="sm">
                {t('camp.lineup_count', { count: participantCount })}
              </Button>
              {camp2026.fundingUrl && (
                <Button href={camp2026.fundingUrl} variant="white" size="sm" external utmContent="hero">
                  {t('camp.ticketing_2026')}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <Section background="ocean-sand" ref={infoRef} className="pb-24 md:pb-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
                <p className="typo-body mb-6 break-words">
                  {translatedDescription}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-ocean-sand rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t('camp.label_period')}</p>
                    <p className="text-sm font-bold text-jeju-ocean break-words">{t('camp.date_badge_2026')}</p>
                  </div>
                  <div className="bg-ocean-sand rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t('camp.label_location')}</p>
                    <p className="text-sm font-bold text-jeju-ocean break-words">{t('camp.venue_2026')}</p>
                  </div>
                  <div className="bg-ocean-sand rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t('camp.label_participants')}</p>
                    <p className="text-sm font-bold text-jeju-ocean break-words">{t('camp.participant_count', { count: participantCount })}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      <WaveDivider className="text-ocean-sand -mb-[60px] sm:-mb-[100px] relative z-10" direction="down" />

      {/* Gangjeong Story Section */}
      <GangjeongStorySection />

      <WaveDivider className="text-white -mt-[60px] sm:-mt-[100px] relative z-10" />

      {/* Lineup Section */}
      {camp2026.participants && camp2026.participants.length > 0 && (
        <Section background="white" ref={lineupRef} id="lineup" className="!pb-32 sm:!pb-40">
          <div className="container mx-auto px-4">
            <SectionHeader
              title={t('camp.section_musicians')}
              subtitle={t('camp.lineup_count', { count: participantCount })}
              inView={isLineupInView}
            />
            <div className="max-w-6xl mx-auto">
              <CampLineup participants={camp2026.participants} musicians={musicians} inView={isLineupInView} campYear={2026} />
            </div>
          </div>
        </Section>
      )}

      {/* Final CTA Section */}
      {camp2026.fundingUrl && (
        <>
          <WaveDivider className="text-jeju-ocean -mt-[60px] sm:-mt-[100px] relative z-10" />
          <section className="bg-jeju-ocean pt-28 pb-20 md:pt-36 md:pb-28">
            <div className="container mx-auto px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="typo-h2 text-white mb-4 break-words text-balance">{t('camp.cta_final_heading')}</h2>
                <p className="typo-body text-gray-200 mb-8 max-w-lg mx-auto break-words text-balance">{t('camp.cta_final_body')}</p>
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
