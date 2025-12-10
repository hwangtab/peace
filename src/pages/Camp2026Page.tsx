import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CampHero from '../components/camp/CampHero';
import { camps } from '../data/camps';

const Camp2026Page = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const camp2026 = camps.find(c => c.year === 2026);

  if (!camp2026) {
    return (
      <div className="min-h-screen bg-light-beige pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-medium text-gray-900 mb-4">캠프를 찾을 수 없습니다</h1>
        </div>
      </div>
    );
  }

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-light-beige pt-24 pb-16">
      <CampHero camp={camp2026} />

      <div className="container mx-auto px-4 py-16" ref={ref}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: { staggerChildren: 0.2 }
            }
          }}
          className="max-w-3xl mx-auto"
        >
          {/* Coming Soon Message */}
          <motion.div
            variants={fadeUpVariants}
            className="bg-white rounded-lg p-12 shadow-md text-center mb-12"
          >
            <div className="inline-block bg-gradient-to-r from-deep-sage to-sage-gray rounded-full p-6 mb-8">
              <svg
                className="h-16 w-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h2 className="text-4xl font-serif font-medium text-gray-900 mb-4">
              Coming Soon
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              강정피스앤뮤직캠프 2026은 계획 중입니다
            </p>
            <p className="text-gray-600 leading-relaxed">
              매년 같은 정신으로 계속되는 강정피스앤뮤직캠프. 2026년의 캠프도 더 많은 음악가들과 함께 평화를 노래할 수 있기를 기대합니다.
            </p>
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div
            variants={fadeUpVariants}
            className="bg-gradient-to-r from-deep-sage to-sage-gray rounded-lg p-8 text-center text-white"
          >
            <h3 className="text-2xl font-serif font-medium mb-4">
              소식을 받아보세요
            </h3>
            <p className="mb-6">
              2026년 캠프 소식이 나올 때까지 뉴스레터를 구독하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="이메일 주소"
                className="flex-1 px-4 py-3 rounded text-gray-900 placeholder-gray-500"
                disabled
              />
              <button
                disabled
                className="px-6 py-3 bg-white text-deep-sage font-semibold rounded hover:bg-light-beige transition-colors opacity-50 cursor-not-allowed"
              >
                구독
              </button>
            </div>
            <p className="text-sm text-white/70 mt-4">
              * 이 기능은 준비 중입니다
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Camp2026Page;
