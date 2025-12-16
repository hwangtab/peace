import React from 'react';
import TracksSection from '../../components/home/TracksSection';
import PageLayout from '../../components/layout/PageLayout';

const AlbumTracksPage = () => (
  <PageLayout
    title="수록곡 - 이름을 모르는 먼 곳의 그대에게"
    description="강정피스앤뮤직캠프 음반의 전체 수록곡. 평화와 연대의 메시지를 담은 12곡의 음악."
    keywords="수록곡, 트랙리스트, 평화노래, 음악리스트, 강정피스앤뮤직캠프"
    background="sky-horizon"
  >
    <TracksSection enableSectionWrapper={false} />
  </PageLayout>
);

export default AlbumTracksPage;
