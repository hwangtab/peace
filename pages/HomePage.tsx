import { motion } from 'framer-motion';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-light-beige">
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
