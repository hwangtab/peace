import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CampHero from '../components/camp/CampHero';
import CampGallery from '../components/camp/CampGallery';
import { camps } from '../data/camps';
import SEOHelmet from '../components/shared/SEOHelmet';

const Camp2023Page = () => {
  const camp = camps.find(c => c.id === 'camp-2023')!;
  const infoRef = useRef(null);
  const isInfoInView = useInView(infoRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-light-beige">
      <SEOHelmet
        title="제1회 강정피스앤뮤직캠프 (2023) - 전쟁을 끝내자!"
        description="2023년 6월 10일 제주 강정마을에서 열린 제1회 강정피스앤뮤직캠프. 리테스 마하르잔, 여유와 설빈, 출장작곡가 김동산 등 7팀의 뮤지션이 함께한 평화 음악 축제."
        keywords="강정피스앤뮤직캠프, 제1회 캠프, 2023, 강정마을, 평화음악, 반전운동"
        ogImage="/images-webp/camps/2023/20230610_195517.webp"
      />
      <CampHero camp={camp} />

      {/* Camp Information Section */}
      <section ref={infoRef} className="bg-light-beige py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
              <h2 className="text-3xl font-serif font-medium text-gray-900 mb-6">
                행사 개요
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
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
                <h3 className="text-2xl font-serif font-medium text-gray-900 mb-6">
                  참여 뮤지션
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {camp.participants.map((participant, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <span className="inline-block w-2 h-2 bg-deep-sage rounded-full" />
                      <span className="text-gray-700">{participant}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <CampGallery camp={camp} />
    </div>
  );
};

export default Camp2023Page;
