import { motion } from 'framer-motion';
import { musicians } from '../src/data/musicians';
import MusicianCard from '../src/components/musicians/MusicianCard';
import SEOHelmet from '../src/components/shared/SEOHelmet';
import { getBreadcrumbSchema, getCollectionPageSchema } from '../src/utils/structuredData';

const MusiciansPage = () => {
  // Breadcrumb Structured Data
  const breadcrumbs = [
    { name: "홈", url: "https://peaceandmusic.net/" },
    { name: "참여 뮤지션", url: "https://peaceandmusic.net/musicians" }
  ];

  const structuredData = [
    getBreadcrumbSchema(breadcrumbs),
    getCollectionPageSchema({
      name: "참여 뮤지션",
      description: "평화를 노래하는 12팀의 뮤지션들이 전하는 메시지",
      url: "https://peaceandmusic.net/musicians"
    })
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-light-beige">
      <SEOHelmet
        title="참여 뮤지션 | 이름을 모르는 먼 곳의 그대에게"
        description="평화를 노래하는 12팀의 뮤지션들이 전하는 메시지. 다양한 아티스트들의 음악으로 평화와 연대의 이야기를 만나보세요."
        keywords="뮤지션, 아티스트, 평화 음악, 참여 뮤지션, 평화 프로젝트 아티스트"
        canonicalUrl="https://peaceandmusic.net/musicians"
        structuredData={structuredData}
      />
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
