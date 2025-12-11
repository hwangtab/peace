import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <section id="about" className="section bg-white" ref={ref}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.2 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <motion.h2
            variants={fadeIn}
            className="font-serif text-5xl font-medium text-gray-900 mb-8"
          >
            강정피스앤뮤직캠프
          </motion.h2>
          <motion.p
            variants={fadeIn}
            className="text-2xl font-medium text-gray-800 mb-16 subtitle"
          >
            강정마을에서 시작되는 평화를 위한 음악 운동
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          <motion.div variants={fadeIn} className="space-y-12">
            <div>
              <h3 className="font-serif text-3xl font-medium text-gray-900 mb-6">강정에서 시작되다</h3>
              <p className="text-lg leading-relaxed text-gray-600">
                제주 강정마을에서 시작된 평화음악캠프는 해군기지 건설로 인한 갈등과 상처를 음악으로 치유하고, 평화의 메시지를 전 세계에 전하는 운동입니다. 강정마을의 평화운동가들과 전국의 음악가들이 함께 모여 평화를 위한 목소리를 높입니다.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-3xl font-medium text-gray-900 mb-6">매년 되풀이되다</h3>
              <p className="text-lg leading-relaxed text-gray-600">
                2023년의 첫 캠프부터 시작하여, 2025년, 그리고 미래로 계속될 강정피스앤뮤직캠프는 정해진 날짜에 강정마을에서 해마다 개최됩니다. 이는 평화를 향한 우리의 변치 않는 의지와, 계속되어야 할 평화운동의 상징입니다.
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-12">
            <div>
              <h3 className="font-serif text-3xl font-medium text-gray-900 mb-6">음악으로 평화를 말하다</h3>
              <p className="text-lg leading-relaxed text-gray-600">
                다양한 장르의 뮤지션들이 강정피스앤뮤직캠프에서 함께 만나 평화의 메시지를 음악으로 표현합니다. 『이름을 모르는 먼 곳의 그대에게』 앨범에는 12팀의 뮤지션들이 각자의 음악 언어로 평화를 노래했으며, 이러한 다양한 목소리들이 모여 하나의 강력한 메시지를 만듭니다.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-3xl font-medium text-gray-900 mb-6">연대의 힘을 믿다</h3>
              <p className="text-lg leading-relaxed text-gray-600">
                우크라이나, 가자, 한반도 - 세계 곳곳의 분쟁 지역을 위해 음악가들이 연대하고, 평화를 노래하는 강정피스앤뮤직캠프는 평화운동의 새로운 형태입니다. 이 캠프를 통해 우리는 언어와 국경을 넘어 평화를 향한 간절한 염원을 함께할 수 있습니다.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
