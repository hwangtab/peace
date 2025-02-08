import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
            className="font-serif text-5xl font-medium text-gray-900 mb-8 whitespace-pre-line"
          >
            {'이름을 모르는\n먼 곳의 그대에게'}
          </motion.h2>
          <motion.p
            variants={fadeIn}
            className="text-2xl font-medium text-gray-800 mb-16 subtitle"
          >
            음악으로 평화를, 평화로 세상을
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          <motion.div variants={fadeIn} className="space-y-12">
            <div>
              <h3 className="font-serif text-3xl font-medium text-gray-900 mb-6">평화를 노래하다</h3>
              <p className="text-lg leading-relaxed text-gray-600">
                우리는 전쟁과 분쟁이 끊이지 않는 혼란한 시대를 살아가고 있습니다. 세계 곳곳에서 들려오는 전쟁의 소식은 우리의 일상을 불안과 공포로 채웁니다. 이런 때일수록 우리에게 절실히 필요한 것은 전쟁이 아닌 평화를 선택하는 것, 분쟁과 폭력의 악순환을 끊고 서로 존중하며 화해하는 것입니다.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-3xl font-medium text-gray-900 mb-6">하나의 메시지</h3>
              <p className="text-lg leading-relaxed text-gray-600">
                『이름을 모르는 먼 곳의 그대에게』는 평화를 갈망하는 12팀의 뮤지션들이 하나 된 마음으로 전쟁에 반대하고 평화를 노래하는 프로젝트입니다. 각기 다른 음악적 색깔과 개성을 지닌 이들이 전쟁으로 인한 고통과 상처, 그리고 평화를 향한 간절한 염원이라는 공통의 메시지를 노래합니다.
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-12">
            <div>
              <h3 className="font-serif text-3xl font-medium text-gray-900 mb-6">음악의 힘을 믿다</h3>
              <p className="text-lg leading-relaxed text-gray-600">
                우리는 음악이 가진 놀라운 힘을 믿습니다. 음악은 사람과 사람, 마음과 마음을 이어주고, 언어와 국경을 뛰어넘어 공감과 연대의 메시지를 전합니다. 작은 촛불들이 모여 어둠을 밝히듯, 한 사람 한 사람의 평화를 향한 마음이 모여 세상을 움직이는 힘이 될 것입니다.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-3xl font-medium text-gray-900 mb-6">함께 만드는 평화</h3>
              <p className="text-lg leading-relaxed text-gray-600">
                평화는 결코 이상향이 아닙니다. 우리 모두의 간절한 염원이자 지향점이며, 한 걸음 한 걸음 우리의 노력으로 만들어가야 할 소중한 가치입니다. 이 프로젝트를 통해 더 많은 이들이 평화의 소중함을 되새기고, 평화를 위한 작은 발걸음을 함께 내딛기를 희망합니다.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
