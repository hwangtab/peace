import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CampHero from '../components/camp/CampHero';
import CampGallery from '../components/camp/CampGallery';
import CampParticipants from '../components/camp/CampParticipants';
import CampStaff from '../components/camp/CampStaff';
import { camps } from '../data/camps';
import PageLayout from '../components/layout/PageLayout';
import Section from '../components/layout/Section';
import SectionHeader from '../components/common/SectionHeader';
import WaveDivider from '../components/common/WaveDivider';
import { getEventSchema } from '../utils/structuredData';
import { getFullUrl } from '../config/env';

interface CampDetailPageProps {
  campId: string;
}

const getOrdinalKorean = (year: number): string => {
  const campIndex = camps.findIndex(c => c.year === year);
  const ordinals = ['1', '2', '3', '4', '5'];
  return ordinals[campIndex] || `${campIndex + 1}`;
};

const CampDetailPage: React.FC<CampDetailPageProps> = ({ campId }) => {
  const camp = camps.find(c => c.id === campId);
  const infoRef = useRef(null);
  const isInfoInView = useInView(infoRef, { once: true, margin: "-100px" });

  if (!camp) {
    return (
      <PageLayout
        title="캠프를 찾을 수 없습니다"
        description="요청하신 캠프 정보를 찾을 수 없습니다."
      >
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-center">
            <h1 className="typo-h2 text-gray-900 mb-4">캠프를 찾을 수 없습니다</h1>
            <p className="typo-body text-gray-600">
              요청하신 캠프 정보가 존재하지 않습니다.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const ordinal = getOrdinalKorean(camp.year);

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
  });

  return (
    <PageLayout
      title={`제${ordinal}회 강정피스앤뮤직캠프 (${camp.year}) - ${camp.slogan || ''}`}
      description={camp.description}
      keywords={`강정피스앤뮤직캠프, 제${ordinal}회 캠프, ${camp.year}, 강정마을, 평화음악, 반전운동`}
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
              <SectionHeader title="행사 개요" align="left" className="!mb-6" />
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
                <SectionHeader title="참여 뮤지션" align="left" className="!mb-6" />
                <CampParticipants participants={camp.participants} inView={isInfoInView} />
              </motion.div>
            )}

            {camp.staff && camp.staff.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <SectionHeader title="함께 만든 사람들" align="left" className="!mb-6" />
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
