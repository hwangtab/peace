import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import CampCard from '../components/camp/CampCard';
import { camps } from '../data/camps';
import SEOHelmet from '../components/shared/SEOHelmet';

const CampsPage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-light-beige pt-24 pb-16">
      <SEOHelmet
        title="강정피스앤뮤직캠프 아카이브 - 평화를 향한 여정"
        description="제주 강정마을에서 열리는 평화 음악 축제, 강정피스앤뮤직캠프의 역대 아카이브. 2023년 제1회부터 2026년 제3회까지의 기록."
        keywords="강정피스앤뮤직캠프, 아카이브, 강정마을, 평화음악, 음악축제"
      />
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUpVariants}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-serif font-medium text-gray-900 mb-6">
            강정피스앤뮤직캠프
          </h1>
          <p className="text-xl text-gray-600 subtitle max-w-2xl mx-auto">
            평화를 위한 음악 캠프의 역사와 미래
          </p>
        </motion.div>

        {/* Camps Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {camps.map((camp, index) => (
            <motion.div
              key={camp.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.1, duration: 0.6 }
                }
              }}
            >
              <CampCard camp={camp} />
            </motion.div>
          ))}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUpVariants}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 bg-white rounded-lg p-8 shadow-md"
        >
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
            강정피스앤뮤직캠프에 대해
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            강정피스앤뮤직캠프는 제주 강정마을에서 시작된 평화운동입니다. 음악가들이 함께 모여 평화의 메시지를 전 세계에 전하고 있습니다.
          </p>
          <p className="text-gray-600 leading-relaxed">
            매년 정해진 일시에 강정마을에서 개최되는 이 캠프는 세계 곳곳의 분쟁을 위해 음악가들의 연대를 보여주는 상징적인 행사입니다.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CampsPage;
