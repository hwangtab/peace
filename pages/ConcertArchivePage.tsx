import { motion } from 'framer-motion';
import { concerts } from '../data/concerts';

const ConcertArchivePage = () => {
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
            공연 아카이브
          </h1>
          <p className="text-xl text-gray-600">
            평화를 노래한 우리들의 기록
          </p>
        </motion.div>

        <div className="space-y-16">
          {concerts.map((concert, index) => (
            <motion.div
              key={concert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg overflow-hidden shadow-lg"
            >
              <div className="relative aspect-w-16 aspect-h-9">
                <img
                  src={concert.coverImage}
                  alt={concert.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-medium text-gray-900 mb-2 font-serif">
                  {concert.title}
                </h2>
                <p className="text-gray-600 mb-4">{concert.description}</p>
                <div className="flex flex-wrap gap-4 text-gray-500">
                  <div>
                    <span className="font-medium">일시:</span> {concert.date}
                  </div>
                  <div>
                    <span className="font-medium">장소:</span> {concert.venue}
                  </div>
                </div>
                {concert.setList && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">세트리스트</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {concert.setList.map((song, idx) => (
                        <li key={idx}>{song}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConcertArchivePage;
