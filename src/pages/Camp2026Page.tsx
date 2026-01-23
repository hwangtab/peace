import React from 'react';
import { motion } from 'framer-motion';
import { camps } from '../data/camps';
import PageLayout from '../components/layout/PageLayout';
import SectionHeader from '../components/common/SectionHeader';
import { getEventSchema } from '../utils/structuredData';
import { getFullUrl } from '../config/env';

const Camp2026Page = () => {
  const camp2026 = camps.find(camp => camp.id === 'camp-2026');

  if (!camp2026) {
    return (
      <PageLayout
        title="제3회 강정피스앤뮤직캠프 (2026)"
        description="2026년 예정된 제3회 강정피스앤뮤직캠프 정보."
      >
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-center">
            <h1 className="typo-h2 text-gray-900 mb-4">캠프를 찾을 수 없습니다</h1>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Event Schema construction
  const eventSchema = getEventSchema({
    name: camp2026.title,
    startDate: camp2026.startDate,
    endDate: camp2026.endDate || camp2026.startDate,
    description: camp2026.description,
    location: {
      name: camp2026.location.split('(')[0]?.trim() || camp2026.location,
      address: camp2026.location.includes('(') ? (camp2026.location.split('(')[1]?.replace(')', '') || camp2026.location) : camp2026.location
    },
    image: camp2026.images && camp2026.images.length > 0 && camp2026.images[0] ? getFullUrl(camp2026.images[0]) : undefined,
    performers: camp2026.participants?.map(p => ({
      type: 'MusicGroup',
      name: typeof p === 'string' ? p : p.name
    }))
  });

  return (
    <PageLayout
      title="제3회 강정피스앤뮤직캠프 (2026) - Coming Soon"
      description="2026년 6월 5일-7일 강정체육공원에서 개최 예정인 제3회 강정피스앤뮤직캠프. 32팀의 뮤지션 확정!"
      keywords="강정피스앤뮤직캠프, 2026, 제3회 캠프, Coming Soon, 평화음악, 강정체육공원"
      background="jeju-ocean"
      structuredData={eventSchema}
    >
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl w-full bg-white/90 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-white/50"
        >
          <span className="inline-block px-4 py-1 bg-jeju-ocean text-white font-bold rounded-full mb-6 text-sm tracking-wider">
            2026 COMING SOON
          </span>

          <SectionHeader
            title={camp2026.title}
            subtitle="평화의 바람은 계속해서 불어옵니다. 세 번째 평화의 노래가 2026년 6월, 강정에서 울려 퍼집니다."
          />

          <div className="bg-ocean-sand/30 p-10 rounded-2xl mb-10">
            <h3 className="typo-h3 mb-6 text-jeju-ocean">2026년 6월 5일(금) - 6월 7일(일)<br />강정체육공원</h3>
            <p className="typo-body text-gray-700 mb-0 leading-relaxed">
              현재 음악가 32팀 출연 확정<br />
              약 50-60팀 출연 예상
            </p>
          </div>

          <div className="text-gray-500 text-sm font-medium">
            Jeju Gangjeong Peace & Music Camp
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Camp2026Page;
