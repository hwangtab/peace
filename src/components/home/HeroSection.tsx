import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/hero-bg.webp")' }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" />

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: 'url("/pattern.svg")' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-medium text-gray-900 mb-6 font-serif">
            강정피스앤뮤직캠프
          </h1>
          <p className="text-2xl text-gray-800 mb-12 subtitle">
            평화를 노래하는 음악가들의 만남<br />
            강정마을에서 시작되는 평화의 메시지
          </p>
          <div className="flex justify-center">
            <motion.button
              onClick={() => {
                const aboutSection = document.querySelector('section:nth-of-type(2)');
                aboutSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-deep-sage rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              프로젝트 소개
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-2 h-2 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
