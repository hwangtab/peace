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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
          <motion.div variants={fadeIn} className="bg-ocean-sand/30 p-8 rounded-2xl hover:bg-ocean-sand/50 transition-colors duration-300">
            <h3 className="font-serif text-2xl font-bold text-deep-ocean mb-4">강정, 평화의 물결이 시작되는 곳</h3>
            <p className="text-base leading-relaxed text-coastal-gray">
              제주 강정마을의 구럼비 바위가 품었던 평화의 기억을 되살립니다.
              해군기지 건설의 아픔을 넘어, 우리는 이곳에서 치유와 회복을 노래합니다.
              강정의 작은 평화가 전 세계로 퍼져나가는 나비효과를 꿈꿉니다.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="bg-ocean-sand/30 p-8 rounded-2xl hover:bg-ocean-sand/50 transition-colors duration-300">
            <h3 className="font-serif text-2xl font-bold text-deep-ocean mb-4">함께 걷는 평화의 여정</h3>
            <h3 className="font-serif text-2xl font-bold text-deep-ocean mb-4">함께 걷는 평화의 여정</h3>
            <p className="text-base leading-relaxed text-coastal-gray">
              강정의 자연 속에서 뮤지션과 관객이 경계 없이 어우러집니다.
              평화를 노래하는 무대 위에서 우리는 서로의 존재를 확인하며,
              음악을 통해 연대의 가능성을 확장해 나갑니다.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="bg-ocean-sand/30 p-8 rounded-2xl hover:bg-ocean-sand/50 transition-colors duration-300">
            <h3 className="font-serif text-2xl font-bold text-deep-ocean mb-4">매년 이어지는 평화의 약속</h3>
            <p className="text-base leading-relaxed text-coastal-gray">
              2023년 여름, 첫 번째 화음이 시작되었습니다.
              우리의 축제는 일회성 이벤트가 아닌, 매년 강정의 여름을 지키는
              끈질기고 아름다운 평화의 의식(Ritual)으로 계속될 것입니다.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="bg-ocean-sand/30 p-8 rounded-2xl hover:bg-ocean-sand/50 transition-colors duration-300">
            <h3 className="font-serif text-2xl font-bold text-deep-ocean mb-4">경계를 넘어선 연대의 울림</h3>
            <p className="text-base leading-relaxed text-coastal-gray">
              팔레스타인 가자지구에서 우크라이나까지, 세계 곳곳의 분쟁 지역을 기억합니다.
              강정피스앤뮤직캠프는 단순한 음악회를 넘어, 고통받는 이들과 함께하며
              평화를 염원하는 강력한 연대의 장입니다.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
