import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import MusicianCard from '../musicians/MusicianCard';
import { musicians } from '../../data/musicians';

const MusiciansSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="musicians" className="section bg-light-beige" ref={ref}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-medium text-gray-900 mb-4 font-serif">
            참여 뮤지션
          </h2>
          <p className="text-lg text-gray-600 subtitle">
            12팀의 뮤지션들이 전하는 평화의 메시지
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {musicians.map((musician, index) => (
            <MusicianCard
              key={musician.id}
              musician={musician}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MusiciansSection;
