import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEOHelmet from '../../components/shared/SEOHelmet';

const AlbumAboutPage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <SEOHelmet
        title="이름을 모르는 먼 곳의 그대에게 - 앨범 소개"
        description="강정피스앤뮤직캠프의 2024년 음반 프로젝트. 전쟁을 끝내고 평화를 노래하는 12곡의 음악 여정."
        keywords="이름을 모르는 먼 곳의 그대에게, 강정피스앤뮤직캠프, 음반, 평화음악"
      />
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUpVariants}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-5xl font-serif font-medium text-gray-900 mb-6">
            이름을 모르는 먼 곳의 그대에게
          </h1>
          <p className="text-xl text-gray-600 subtitle mb-4">
            강정피스앤뮤직캠프의 첫 번째 음악 프로젝트
          </p>
          <p className="text-gray-600">2024년 발매</p>
        </motion.div>

        {/* Album Info Section */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto mb-16"
        >
          {/* Album Cover Placeholder */}
          <motion.div
            variants={fadeUpVariants}
            className="bg-light-beige rounded-lg aspect-square flex items-center justify-center shadow-lg"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-gray-600 font-serif text-lg">Album Cover</p>
            </div>
          </motion.div>

          {/* Album Info */}
          <motion.div
            variants={containerVariants}
            className="flex flex-col justify-center"
          >
            <motion.h2
              variants={fadeUpVariants}
              className="text-3xl font-serif font-medium text-gray-900 mb-6"
            >
              앨범 정보
            </motion.h2>

            <motion.div
              variants={fadeUpVariants}
              className="space-y-4 mb-8"
            >
              <div className="border-b border-light-beige pb-4">
                <p className="text-sm text-gray-600 font-semibold mb-1">발매일</p>
                <p className="text-lg text-gray-900">2024년</p>
              </div>
              <div className="border-b border-light-beige pb-4">
                <p className="text-sm text-gray-600 font-semibold mb-1">참여 뮤지션</p>
                <p className="text-lg text-gray-900">12팀</p>
              </div>
              <div className="border-b border-light-beige pb-4">
                <p className="text-sm text-gray-600 font-semibold mb-1">수록곡</p>
                <p className="text-lg text-gray-900">13곡</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">앨범 컨셉</p>
                <p className="text-lg text-gray-900">
                  강정마을에서 시작된 평화운동을 음악으로 표현
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUpVariants}
              className="space-y-3"
            >
              <Link
                to="/album/tracks"
                className="block bg-golden-sun text-white py-3 rounded font-medium text-center hover:bg-sunset-coral transition-colors"
              >
                뮤지션 보기 →
              </Link>
              <Link
                to="/album/tracks"
                className="block border-2 border-deep-sage text-deep-sage py-3 rounded font-medium text-center hover:bg-light-beige transition-colors"
              >
                수록곡 보기 →
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* About Album */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-3xl mx-auto mb-16"
        >
          <motion.h2
            variants={fadeUpVariants}
            className="text-3xl font-serif font-medium text-gray-900 mb-8"
          >
            앨범 소개
          </motion.h2>

          <motion.div
            variants={containerVariants}
            className="space-y-6"
          >
            <motion.div variants={fadeUpVariants}>
              <h3 className="text-2xl font-serif font-medium text-gray-900 mb-3">
                제목의 의미
              </h3>
              <p className="text-gray-700 leading-relaxed">
                "이름을 모르는 먼 곳의 그대에게"는 세계 곳곳의 분쟁 지역에서 고통받고 있는 이들에게 보내는 평화의 메시지입니다.
                우크라이나, 가자, 한반도 등 지구 반대편에서 일어나고 있는 전쟁과 폭력에 맞서,
                음악가들은 자신들의 목소리로 평화를 노래합니다.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVariants}>
              <h3 className="text-2xl font-serif font-medium text-gray-900 mb-3">
                참여 뮤지션들
              </h3>
              <p className="text-gray-700 leading-relaxed">
                12팀의 뮤지션들은 각각 다른 장르와 스타일을 가지고 있지만,
                평화라는 하나의 주제로 모여 이 앨범을 만들었습니다.
                록, 포크, 힙합, 국악 등 다양한 음악 언어로 표현된 평화의 메시지를 만나보세요.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVariants}>
              <h3 className="text-2xl font-serif font-medium text-gray-900 mb-3">
                앨범의 의미
              </h3>
              <p className="text-gray-700 leading-relaxed">
                이 앨범은 강정피스앤뮤직캠프의 공식 음악 프로젝트입니다.
                판매 수익금의 일부는 강정마을의 평화운동과 전 세계의 평화 관련 단체를 지원합니다.
                앨범을 통해 당신도 평화운동에 함께할 수 있습니다.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUpVariants}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-deep-sage to-sage-gray rounded-lg p-8 text-white text-center max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-serif font-medium mb-4">
            앨범에 참여한 뮤지션들을 만나보세요
          </h3>
          <p className="mb-6">
            각 뮤지션의 음악과 평화에 대한 생각을 알아보세요
          </p>
          <Link
            to="/album/musicians"
            className="inline-block bg-white text-deep-sage px-8 py-3 rounded font-semibold hover:bg-light-beige transition-colors"
          >
            뮤지션 보기 →
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default AlbumAboutPage;
