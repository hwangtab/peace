import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CampHero from '../components/camp/CampHero';
import CampGallery from '../components/camp/CampGallery';
import CampParticipants from '../components/camp/CampParticipants';
import { camps } from '../data/camps';
import PageLayout from '../components/layout/PageLayout';
import Section from '../components/layout/Section';

const Camp2025Page = () => {
  const camp = camps.find(c => c.id === 'camp-2025')!;
  const infoRef = useRef(null);
  const isInfoInView = useInView(infoRef, { once: true, margin: "-100px" });

  return (
    <PageLayout
      title="제2회 강정피스앤뮤직캠프 (2025) - 노래하자, 춤추자"
      description="2025년 6월 14일 제주 강정마을에서 열린 제2회 강정피스앤뮤직캠프. 까르, 남수, 모레도토요일, HANASH 등 10팀의 뮤지션이 참여한 평화 음악 축제."
      keywords="강정피스앤뮤직캠프, 제2회 캠프, 2025, 강정마을, 평화음악, 반전운동"
      ogImage="/images-webp/camps/2025/DSC00393.webp"
      disableTopPadding={true}
    >
      <CampHero camp={camp} />

      {/* Camp Information Section */}
      <Section background="ocean-sand" ref={infoRef}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
              <h2 className="typo-h2 mb-6">
                행사 개요
              </h2>
              <p className="typo-body mb-4">
                {camp.description}
              </p>
            </div>

            {/* Participants Section */}
            {camp.participants && camp.participants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-8"
              >
                <h2 className="typo-h2 mb-6">
                  참여 뮤지션
                </h2>
                <CampParticipants participants={camp.participants} inView={isInfoInView} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </Section>

      {/* Gallery Section */}
      <CampGallery camp={camp} />
    </PageLayout>
  );
};

export default Camp2025Page;
