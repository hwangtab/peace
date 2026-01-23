import React from 'react';
import TracksSection from '../../components/home/TracksSection';
import PageLayout from '../../components/layout/PageLayout';
import PageHero from '../../components/common/PageHero';
import { getMusicPlaylistSchema } from '../../utils/structuredData';
import { musicians } from '../../data/musicians';

const AlbumTracksPage = () => {
  // Playlist Schema
  const playlistSchema = getMusicPlaylistSchema(
    musicians
      .filter(m => m.trackTitle && m.id !== 13) // Exclude non-tracks if any
      .map(m => ({
        name: m.trackTitle!,
        url: "https://peaceandmusic.net/album/tracks"
      }))
  );

  return (
    <PageLayout
      title="수록곡 - 이름을 모르는 먼 곳의 그대에게"
      description="강정피스앤뮤직캠프 음반의 전체 수록곡. 평화와 연대의 메시지를 담은 12곡의 음악."
      keywords="수록곡, 트랙리스트, 평화노래, 음악리스트, 강정피스앤뮤직캠프"
      background="sky-horizon"
      structuredData={playlistSchema}
      disableTopPadding={true}
    >
      <PageHero
        title="수록곡"
        subtitle="이름을 모르는 먼 곳의 그대에게"
        backgroundImage="/images-webp/gallery/152.webp"
      />
      <div className="pt-12">
        <TracksSection enableSectionWrapper={false} hideSectionHeader={true} />
      </div>
    </PageLayout>
  );
};

export default AlbumTracksPage;
