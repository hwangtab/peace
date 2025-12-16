import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { musicians } from '../../data/musicians';
import MusicianCard from '../musicians/MusicianCard';
import Section from '../layout/Section';

const MusiciansSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <Section id="musicians" background="white" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="typo-h2 mb-4 text-gray-900">참여 뮤지션</h2>
          <p className="typo-subtitle mb-12 text-gray-600">평화를 노래하는 12팀의 아티스트</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {musicians.map((musician, index) => (
            <MusicianCard key={musician.id} musician={musician} index={index} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default MusiciansSection;
