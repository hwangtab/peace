import { motion } from 'framer-motion';
import HeroSection from '../src/components/home/HeroSection';
import AboutSection from '../src/components/home/AboutSection';
import SEOHelmet from '../src/components/shared/SEOHelmet';
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getMusicGroupSchema,
  getFAQSchema
} from '../src/utils/structuredData';

const HomePage = () => {
  // FAQ 데이터 - AI 추천 확률 향상
  const faqs = [
    {
      question: "이름을 모르는 먼 곳의 그대에게는 어떤 프로젝트인가요?",
      answer: "전쟁과 폭력이 만연한 세상에서 음악으로 평화의 메시지를 전하는 뮤지션들의 프로젝트입니다. 서로의 이름을 모르지만, 같은 땅에서 살아가는 우리들의 이야기를 노래합니다."
    },
    {
      question: "어떤 뮤지션들이 참여하나요?",
      answer: "평화와 연대의 메시지를 음악으로 전하는 다양한 뮤지션들이 참여하고 있습니다. 뮤지션 페이지에서 참여 아티스트들을 만나보실 수 있습니다."
    },
    {
      question: "음악을 어디서 들을 수 있나요?",
      answer: "웹사이트의 수록곡 페이지에서 직접 음악을 감상하실 수 있습니다. 평화를 노래하는 다양한 곡들을 만나보세요."
    }
  ];

  // Structured Data 생성
  const structuredData = [
    getOrganizationSchema(),
    getWebSiteSchema(),
    getMusicGroupSchema(),
    getFAQSchema(faqs)
  ];

  return (
    <div className="min-h-screen bg-light-beige">
      <SEOHelmet
        title="이름을 모르는 먼 곳의 그대에게 | 평화를 노래하는 음악 프로젝트"
        description="전쟁과 폭력이 만연한 세상에서 음악으로 평화의 메시지를 전하는 뮤지션들의 프로젝트. 우리는 서로의 이름을 모르지만, 같은 땅에서 살아가는 우리들의 이야기를 노래합니다."
        keywords="평화, 음악, 프로젝트, 뮤지션, 연대, 평화운동, 음악운동, 사회운동, 평화와 음악, 평화 프로젝트, 평화 음악, 평화 메시지"
        canonicalUrl="https://peaceandmusic.net/"
        structuredData={structuredData}
      />
      <HeroSection />
      <AboutSection />

      {/* Call to Action Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="py-16 bg-deep-sage text-white text-center"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-medium mb-6 font-serif">
            평화를 향한 우리의 여정에 함께해주세요
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            뮤지션들의 이야기와 음악을 통해 평화의 메시지를 전합니다.<br />
            지금 바로 우리의 음악을 만나보세요.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <motion.a
              href="/musicians"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-deep-sage rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              참여 뮤지션
            </motion.a>
            <motion.a
              href="/tracks"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-deep-sage rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              수록곡 듣기
            </motion.a>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
