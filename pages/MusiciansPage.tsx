import { motion } from 'framer-motion';
import { musicians } from '../data/musicians';
import MusicianCard from '../components/musicians/MusicianCard';

const MusiciansPage = () => {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-light-beige">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-medium text-gray-900 mb-4 font-serif">
            참여 뮤지션
          </h1>
          <p className="text-xl text-gray-600">
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
    </div>
  );
};

export default MusiciansPage;
