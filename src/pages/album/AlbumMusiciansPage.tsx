import React from 'react';
import MusiciansSection from '../../components/home/MusiciansSection';
import PageLayout from '../../components/layout/PageLayout';
import PageHero from '../../components/common/PageHero';

const AlbumMusiciansPage = () => (
  <PageLayout
    title="참여 뮤지션 - 이름을 모르는 먼 곳의 그대에게"
    description="강정피스앤뮤직캠프 음반 프로젝트에 참여한 12팀의 뮤지션. 까르, 출장작곡가 김동산, 남수, 모레도토요일 등 평화를 노래하는 아티스트."
    keywords="참여뮤지션, 음반참여, 평화뮤지션, 강정피스앤뮤직캠프, 아티스트"
    background="sunlight-glow"
    disableTopPadding={true}
  >
    <PageHero
      title="참여 뮤지션"
      subtitle="12팀의 목소리"
      backgroundImage="/images-webp/gallery/2.webp"
    />
    <div className="pt-12">
      <MusiciansSection enableSectionWrapper={false} />
    </div>
  </PageLayout>
);

export default AlbumMusiciansPage;
