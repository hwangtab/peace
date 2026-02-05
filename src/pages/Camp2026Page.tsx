import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getCamps } from '../data/camps';
import PageLayout from '../components/layout/PageLayout';
import SectionHeader from '../components/common/SectionHeader';
import { getEventSchema } from '../utils/structuredData';
import { getFullUrl } from '../config/env';
import { formatOrdinal } from '../utils/format';

const Camp2026Page = () => {
  const { t, i18n } = useTranslation();
  const campList = getCamps(i18n.language);
  const camp2026 = campList.find(camp => camp.id === 'camp-2026');
  const ordinalLabel = formatOrdinal(3, i18n.language);

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

  // Event Schema construction
  const eventSchema = getEventSchema({
    name: camp2026.title,
    startDate: camp2026.startDate,
    endDate: camp2026.endDate || camp2026.startDate,
    description: camp2026.description,
    location: {
      name: camp2026.location.split('(')[0]?.trim() || camp2026.location,
      address: camp2026.location.includes('(') ? (camp2026.location.split('(')[1]?.replace(')', '') || camp2026.location) : camp2026.location
    },
    image: camp2026.images && camp2026.images.length > 0 && camp2026.images[0] ? getFullUrl(camp2026.images[0]) : undefined,
    performers: camp2026.participants?.map(p => ({
      type: 'MusicGroup',
      name: typeof p === 'string' ? p : p.name
    }))
  }, i18n.language);

  return (
    <PageLayout
      title={`${t('camp.ordinal', { num: ordinalLabel })} ${t('app.title')} (2026) - ${t('camp.coming_soon')}`}
      description={t('seo.default.description')}
      keywords={t('seo.default.keywords')}
      background="jeju-ocean"
      structuredData={eventSchema}
    >
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl w-full bg-white/90 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-white/50"
        >
          <span className="inline-block px-4 py-1 bg-jeju-ocean text-white font-bold rounded-full mb-6 text-sm tracking-wider">
            2026 {t('camp.coming_soon')}
          </span>

          <SectionHeader
            title={camp2026.title}
            subtitle={t('camp.description_2026')}
          />

          <div className="bg-ocean-sand/30 p-10 rounded-2xl mb-10">
            <h3 className="typo-h3 mb-6 text-jeju-ocean">
              {t('camp.date_2026')}<br />{t('camp.venue_2026')}
            </h3>
            <p className="typo-body text-gray-700 mb-0 leading-relaxed">
              {t('camp.expected_2026')}
            </p>
          </div>

          <div className="text-gray-500 text-sm font-medium">
            {t('camp.brand_line')}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Camp2026Page;
