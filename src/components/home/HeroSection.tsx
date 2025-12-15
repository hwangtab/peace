import { motion } from 'framer-motion';

interface HeroSectionProps {
  imageUrl: string;
}

const HeroSection = ({ imageUrl }: HeroSectionProps) => {
  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      />

      {/* Gradient Overlay using Bright Ocean Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-jeju-ocean/70 via-ocean-mist/40 to-seafoam/20" />

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat opacity-10" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="typo-h1 text-cloud-white mb-6 drop-shadow-md">
            강정피스앤뮤직캠프
          </h1>
          <p className="typo-h2 text-golden-sun mb-6 drop-shadow-sm">
            전쟁을 끝내자! 노래하자, 춤추자
          </p>
          <p className="typo-subtitle text-seafoam mb-12 font-medium drop-shadow-sm">
            강정마을에서 시작되는 평화의 메시지
          </p>
          <div className="flex justify-center gap-4">
            <motion.a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-golden-sun text-jeju-ocean rounded-full font-bold hover:bg-opacity-90 transition-colors shadow-lg"
            >
              프로젝트 소개
            </motion.a>
            <motion.a
              href="/camps/2026"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border-2 border-cloud-white text-cloud-white rounded-full font-bold hover:bg-white/10 transition-colors"
            >
              2026 캠프 알림
            </motion.a>
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
