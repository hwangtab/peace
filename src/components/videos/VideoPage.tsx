import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useInView } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { videoItems } from '../../data/videos';
import { filterByEvent, isValidFilter } from '../../utils/filtering';
import { sortByDateDesc } from '../../utils/sorting';
import EventFilter from '../common/EventFilter';
import PageLayout from '../layout/PageLayout';
import PageHero from '../common/PageHero';
import VideoCard from './VideoCard';

export default function VideoPage() {
  const location = useLocation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Sync filter with query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam && isValidFilter(filterParam)) {
      setSelectedFilter(filterParam);
    }
  }, [location.search]);

  const filteredVideos = useMemo(() =>
    sortByDateDesc(filterByEvent(videoItems, selectedFilter)),
    [selectedFilter]
  );

  return (
    <PageLayout
      title="비디오 - 강정피스앤뮤직캠프"
      description="강정피스앤뮤직캠프의 공연영상 모음. 평화를 노래하는 뮤지션들의 공연 영상을 만나보세요."
      keywords="공연영상, 강정피스앤뮤직캠프, 평화 공연, 뮤지션 공연, 유튜브 영상"
      background="sunlight-glow"
      disableTopPadding={true}
    >
      <PageHero
        title="비디오"
        subtitle="평화를 노래하는 순간들"
        backgroundImage="/images-webp/camps/2023/IMG_2064.webp"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12" ref={ref}>
        <EventFilter
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          colorScheme="ocean"
          filterOrder="videos"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredVideos.map((video) => (
            <div key={video.id} className="h-full">
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
