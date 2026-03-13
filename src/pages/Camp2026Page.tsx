import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { getCamps } from '../data/camps';
import PageLayout from '../components/layout/PageLayout';
import Section from '../components/layout/Section';
import SectionHeader from '../components/common/SectionHeader';
import WaveDivider from '../components/common/WaveDivider';
import CampLineup from '../components/camp/CampLineup';
import { getEventSchema } from '../utils/structuredData';
import { getFullUrl } from '../config/env';
import { formatOrdinal } from '../utils/format';
import { getMusicians } from '../api/musicians';
import { Musician } from '../types/musician';

interface CampPageProps {
  initialMusicians?: Musician[];
}

const Camp2026Page: React.FC<CampPageProps> = ({ initialMusicians = [] }) => {
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
    if (initialMusicians.length > 0) return;
    const loadMusicians = async () => {
      const data = await getMusicians(i18n.language);
      setMusicians(data);
    };
    loadMusicians();
  }, [i18n.language, initialMusicians.length]);

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
    }))
  }, i18n.language);

  const participantCount = camp2026.participants?.length || 0;

  return (
    <PageLayout
      title={`${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (2026)`}
      description={translatedDescription}
      keywords={`${t('app.title')}, ${t('camp.ordinal', { num: ordinalLabel })}, 2026, ${t('camp.keywords_base')}`}
      ogImage="/images-webp/camps/2026/2026poster1-og.jpg"
      structuredData={eventSchema}
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center text-center overflow-hidden bg-ocean-gradient">
        <Image
          src="/images-webp/camps/2023/20230610밤 전쟁을끝내자.webp"
          alt={translatedTitle}
          fill
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-5 py-1.5 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full mb-6 text-sm tracking-wider border border-white/30">
              {t('camp.date_badge_2026')}
            </span>

            <h1 className="typo-h1 text-white mb-4 hyphens-auto break-words">{translatedTitle}</h1>
            <p className="typo-subtitle text-gray-100 mb-8 hyphens-auto break-words">{translatedSlogan}</p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 text-white mb-8">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-300 mb-1">{t('camp.label_period')}</p>
                <p className="text-lg font-medium">{t('camp.date_2026')}</p>
              </div>
              <div className="hidden sm:block text-gray-400">|</div>
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-300 mb-1">{t('camp.label_location')}</p>
                <p className="text-lg font-medium">{t('camp.venue_2026')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <a
                href="#lineup"
                className="inline-block px-6 py-2.5 bg-golden-sun text-gray-900 font-bold rounded-full text-sm shadow-lg hover:bg-yellow-400 transition-colors cursor-pointer"
              >
                {t('camp.lineup_count', { count: participantCount })}
              </a>
              <a
                href="https://tumblbug.com/gpmc3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2.5 bg-white/15 backdrop-blur-sm text-white font-medium rounded-full text-sm border border-white/30 hover:bg-white/25 transition-colors"
              >
                {t('camp.ticketing_2026')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <Section background="ocean-sand" ref={infoRef}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Poster */}
              <a
                href="https://tumblbug.com/gpmc3"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-[360px] flex-shrink-0 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <Image
                  src="/images-webp/camps/2026/2026poster1.jpeg"
                  alt={translatedTitle}
                  width={360}
                  height={509}
                  className="w-full h-auto"
                />
              </a>
              {/* Info */}
              <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
                <SectionHeader title={t('camp.section_overview')} align="left" className="!mb-6" />
                <p className="typo-body mb-6">
                  {translatedDescription}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-ocean-sand rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t('camp.label_period')}</p>
                    <p className="text-sm font-semibold text-jeju-ocean">{t('camp.date_badge_2026')}</p>
                  </div>
                  <div className="bg-ocean-sand rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t('camp.label_location')}</p>
                    <p className="text-sm font-semibold text-jeju-ocean">{t('camp.venue_2026')}</p>
                  </div>
                  <div className="bg-ocean-sand rounded-xl p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t('camp.label_participants')}</p>
                    <p className="text-sm font-semibold text-jeju-ocean">{t('camp.participant_count', { count: participantCount })}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      <WaveDivider className="text-white -mt-[60px] sm:-mt-[100px] relative z-10" />

      {/* Lineup Section */}
      {camp2026.participants && camp2026.participants.length > 0 && (
        <Section background="white" ref={lineupRef} id="lineup">
          <div className="container mx-auto px-4">
            <SectionHeader
              title={t('camp.section_musicians')}
              subtitle={t('camp.lineup_count', { count: participantCount })}
              inView={isLineupInView}
            />
            <div className="max-w-4xl mx-auto">
              <CampLineup participants={camp2026.participants} musicians={musicians} inView={isLineupInView} />
            </div>
          </div>
        </Section>
      )}
    </PageLayout>
  );
};

export default Camp2026Page;
