import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { camps } from '../data/camps';
import PageLayout from '../components/layout/PageLayout';
import SectionHeader from '../components/common/SectionHeader';

const Camp2026Page = () => {
  const camp2026 = camps.find(camp => camp.id === 'camp-2026');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 이메일 제출 핸들러 (실제 기능은 백엔드 연동 필요)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail('');
    }
  };

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

  return (
    <PageLayout
      title="제3회 강정피스앤뮤직캠프 (2026) - Coming Soon"
      description="2026년 여름 개최 예정인 제3회 강정피스앤뮤직캠프. 평화를 노래하는 음악 축제에 함께하세요."
      keywords="강정피스앤뮤직캠프, 2026, 제3회 캠프, Coming Soon, 평화음악"
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
            subtitle="평화의 바람은 계속해서 불어옵니다. 세 번째 평화의 노래가 2026년 여름, 강정에서 울려 퍼집니다."
          />

          <div className="bg-ocean-sand/30 p-8 rounded-2xl mb-10">
            <h3 className="typo-h3 mb-4 text-jeju-ocean">뉴스레터 구독하기</h3>
            <p className="typo-body text-gray-600 mb-6 text-sm">
              가장 먼저 알림을 받고 싶으신가요? 이메일을 등록해주세요.
            </p>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-100 text-green-700 p-4 rounded-lg font-medium"
              >
                ✅ 구독 신청이 완료되었습니다! 평화의 소식을 기다려주세요.
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-5 py-3 rounded-full border border-gray-300 focus:border-jeju-ocean focus:ring-2 focus:ring-jeju-ocean/20 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-jeju-ocean text-white font-bold rounded-full hover:bg-ocean-mist transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  구독하기
                </button>
              </form>
            )}
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
