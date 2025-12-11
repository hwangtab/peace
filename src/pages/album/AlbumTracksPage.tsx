import React from 'react';
import TracksSection from '../../components/home/TracksSection';
import SEOHelmet from '../../components/shared/SEOHelmet';

const AlbumTracksPage = () => (
  <div className="min-h-screen bg-ocean-sand">
    <SEOHelmet
      title="수록곡 - 이름을 모르는 먼 곳의 그대에게"
      description="강정피스앤뮤직캠프 음반의 전체 수록곡. 평화와 연대의 메시지를 담은 12곡의 음악."
      keywords="수록곡, 강정피스앤뮤직캠프, 평화음악, 음반"
    />
    <TracksSection />
  </div>
);

export default AlbumTracksPage;
