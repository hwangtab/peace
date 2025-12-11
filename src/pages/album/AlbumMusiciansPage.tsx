import React from 'react';
import MusiciansSection from '../../components/home/MusiciansSection';
import SEOHelmet from '../../components/shared/SEOHelmet';

const AlbumMusiciansPage = () => (
  <div className="min-h-screen bg-light-beige">
    <SEOHelmet
      title="참여 뮤지션 - 이름을 모르는 먼 곳의 그대에게"
      description="강정피스앤뮤직캠프 음반 프로젝트에 참여한 12팀의 뮤지션. 까르, 출장작곡가 김동산, 남수, 모레도토요일 등 평화를 노래하는 아티스트."
      keywords="참여 뮤지션, 강정피스앤뮤직캠프, 평화음악, 인디뮤지션"
    />
    <MusiciansSection />
  </div>
);

export default AlbumMusiciansPage;
