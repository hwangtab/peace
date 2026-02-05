import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import CampHero from '../components/camp/CampHero';
import CampGallery from '../components/camp/CampGallery';
import CampParticipants from '../components/camp/CampParticipants';
import CampStaff from '../components/camp/CampStaff';
import { getCamps } from '../data/camps';
import PageLayout from '../components/layout/PageLayout';
import Section from '../components/layout/Section';
import SectionHeader from '../components/common/SectionHeader';
import WaveDivider from '../components/common/WaveDivider';
import { getEventSchema } from '../utils/structuredData';
import { getFullUrl } from '../config/env';
import { getMusicians } from '../api/musicians';
import { Musician } from '../types/musician';
import { formatOrdinal } from '../utils/format';

interface CampDetailPageProps {
  campId: string;
}

const getCampOrdinal = (year: number, campList: Array<{ year: number }>): number => {
  const campIndex = campList.findIndex(c => c.year === year);
  return campIndex >= 0 ? campIndex + 1 : 0;
};

const CampDetailPage: React.FC<CampDetailPageProps> = ({ campId }) => {
  const { t, i18n } = useTranslation();
  const campList = getCamps(i18n.language);
  const camp = campList.find(c => c.id === campId);
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const infoRef = useRef(null);
  const isInfoInView = useInView(infoRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const loadMusicians = async () => {
      const data = await getMusicians(i18n.language);
      setMusicians(data);
    };
    loadMusicians();
  }, [i18n.language]);

  if (!camp) {
    return (
      <PageLayout
        title={t('camp.not_found')}
        description={t('camp.not_found_desc')}
      >
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-center">
            <h1 className="typo-h2 text-gray-900 mb-4">{t('camp.not_found')}</h1>
            <p className="typo-body text-gray-600">
              {t('camp.not_found_desc')}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const ordinal = getCampOrdinal(camp.year, campList);
  const ordinalLabel = formatOrdinal(ordinal, i18n.language);

  // Event Schema construction
  const eventSchema = getEventSchema({
    name: camp.title,
    startDate: camp.startDate,
    endDate: camp.endDate || camp.startDate,
    description: camp.description,
    location: {
      name: camp.location.split('(')[0]?.trim() || camp.location,
      address: camp.location.includes('(') ? (camp.location.split('(')[1]?.replace(')', '') || camp.location) : camp.location
    },
    image: camp.images && camp.images.length > 0 && camp.images[0] ? getFullUrl(camp.images[0]) : undefined,
    performers: camp.participants?.map(p => ({
      type: 'MusicGroup', // Default to MusicGroup for simplicity
      name: typeof p === 'string' ? p : p.name
    }))
  }, i18n.language);

  return (
    <PageLayout
      title={`${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (${camp.year}) - ${camp.slogan || ''}`}
      description={camp.description}
      keywords={`${t('app.title')}, ${t('camp.ordinal', { num: ordinalLabel })}, ${camp.year}, ${t('camp.keywords_base')}`}
      ogImage={camp.images[0]}
      structuredData={eventSchema}
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <CampHero camp={camp} />

      <Section background="ocean-sand" ref={infoRef}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
              <SectionHeader title={t('camp.section_overview')} align="left" className="!mb-6" />
              <p className="typo-body mb-4">
                {camp.description}
              </p>
            </div>

            {camp.participants && camp.participants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-8 mb-8"
              >
                <SectionHeader title={t('camp.section_musicians')} align="left" className="!mb-6" />
                <CampParticipants participants={camp.participants} musicians={musicians} inView={isInfoInView} />
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
                <CampStaff staff={camp.staff} collaborators={camp.collaborators} inView={isInfoInView} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </Section>

      <WaveDivider className="text-light-beige -mt-[60px] sm:-mt-[100px] relative z-10" />

      <CampGallery camp={camp} />
    </PageLayout>
  );
};

export default CampDetailPage;
