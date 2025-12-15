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
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHelmet
        title="이름을 모르는 먼 곳의 그대에게 - 앨범 소개"
        description="강정피스앤뮤직캠프의 2024년 음반 프로젝트. 전쟁을 끝내고 평화를 노래하는 12곡의 음악 여정."
        keywords="이름을 모르는 먼 곳의 그대에게, 강정피스앤뮤직캠프, 음반, 평화음악"
      />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        {/* Background Decorative Elements */}
        <div className="absolute top-[-20%] right-[-10%] w-2/3 h-[120%] bg-ocean-mist/20 rounded-full blur-3xl z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-2/3 bg-golden-sun/10 rounded-full blur-3xl z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jeju-ocean/5 rounded-full blur-3xl z-0" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
          >
            {/* Left: Album Art */}
            <motion.div
              variants={fadeUpVariants}
              className="w-full lg:w-5/12 max-w-lg"
            >
              <div className="relative aspect-square rounded-xl shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                <img
                  src="/images-webp/album/albumart.png"
                  alt="이름을 모르는 먼 곳의 그대에게 앨범 커버"
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                />
                {/* Vinyl Record Effect (Optional aesthetic touch) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none" />
              </div>
            </motion.div>

            {/* Right: Info */}
            <motion.div
              variants={fadeUpVariants}
              className="w-full lg:w-7/12 text-center lg:text-left"
            >
              <span className="inline-block px-3 py-1 bg-jeju-ocean text-white text-sm font-bold tracking-wider rounded-full mb-6">
                2024 OFFICIAL RELEASE
              </span>
              <h1 className="typo-h1 text-jeju-ocean mb-6 leading-tight">
                이름을 모르는<br />먼 곳의 그대에게
              </h1>
              <p className="typo-subtitle text-coastal-gray font-medium mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                전쟁과 폭력이 만연한 세상에서 보내는 평화의 편지.<br className="hidden md:block" />
                12팀의 뮤지션이 강정마을에서 쏘아 올린 음악의 파동.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/album/tracks"
                  className="px-8 py-4 bg-jeju-ocean text-white rounded-full font-bold hover:bg-ocean-mist transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  수록곡 듣기 →
                </Link>
                <Link
                  to="/album/musicians"
                  className="px-8 py-4 bg-white border-2 border-jeju-ocean text-jeju-ocean rounded-full font-bold hover:bg-ocean-mist/10 transition-all duration-300"
                >
                  참여 뮤지션 소개
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">

            {/* Card 1: Meaning */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-ocean-sand/30 p-10 rounded-3xl"
            >
              <h3 className="typo-h3 text-jeju-ocean mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-golden-sun flex items-center justify-center text-white text-sm">01</span>
                제목의 의미
              </h3>
              <p className="typo-body text-gray-700 leading-loose">
                "이름을 모르는 먼 곳의 그대에게"는 세계 곳곳의 분쟁 지역에서 고통받고 있는 이들에게 보내는 연대의 메시지입니다.
                우크라이나, 가자, 그리고 한반도. 우리는 서로의 얼굴도, 이름도 모르지만 같은 시대를 살아가며 평화를 염원하는 마음만은 하나로 연결되어 있습니다.
              </p>
            </motion.div>

            {/* Card 2: Participants */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-ocean-sand/30 p-10 rounded-3xl"
            >
              <h3 className="typo-h3 text-jeju-ocean mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-jeju-ocean flex items-center justify-center text-white text-sm">02</span>
                12팀의 목소리
              </h3>
              <p className="typo-body text-gray-700 leading-loose">
                록, 포크, 힙합, 일렉트로닉, 그리고 국악까지.
                강정마을의 평화운동에 공감하는 12팀의 뮤지션들이 각자의 음악 언어로 평화를 번역했습니다.
                다양한 장르가 모여 만든 이 앨범은 다양성이야말로 평화의 본질임을 증명합니다.
              </p>
            </motion.div>

          </div>

          {/* Credits Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-24 pt-12 border-t border-gray-100 text-center"
          >
            <p className="text-coastal-gray font-serif text-lg">
              Produced by <span className="text-jeju-ocean font-bold">강정피스앤뮤직캠프</span> · 2024
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AlbumAboutPage;
