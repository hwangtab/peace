import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CampHero from '../components/camp/CampHero';
import CampGallery from '../components/camp/CampGallery';
import CampParticipants from '../components/camp/CampParticipants';
import { camps } from '../data/camps';
import PageLayout from '../components/layout/PageLayout';
import Section from '../components/layout/Section';
import SectionHeader from '../components/common/SectionHeader';

const Camp2023Page = () => {
  const camp = camps.find(c => c.id === 'camp-2023')!;
  const infoRef = useRef(null);
  const isInfoInView = useInView(infoRef, { once: true, margin: "-100px" });

  return (
    <PageLayout
      title="제1회 강정피스앤뮤직캠프 (2023) - 전쟁을 끝내자!"
      description="2023년 6월 10일 제주 강정마을에서 열린 제1회 강정피스앤뮤직캠프. 리테스 마하르잔, 여유와 설빈, 출장작곡가 김동산 등 7팀의 뮤지션이 함께한 평화 음악 축제."
      keywords="강정피스앤뮤직캠프, 제1회 캠프, 2023, 강정마을, 평화음악, 반전운동"
      ogImage="/images-webp/camps/2023/20230610_195517.webp"
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
              <SectionHeader title="행사 개요" align="left" className="!mb-6" />
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
                <SectionHeader title="참여 뮤지션" align="left" className="!mb-6" />
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

export default Camp2023Page;
