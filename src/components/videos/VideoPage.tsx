import React, { useRef, useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { VideoItem, videoItems } from '../../data/videos';
import EventFilter from '../common/EventFilter';
import PageLayout from '../layout/PageLayout';
import VideoCard from './VideoCard';

export default function VideoPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredVideos = useMemo(() => {
    let result = videoItems;

    if (selectedFilter !== 'all') {
      if (selectedFilter === 'album-2024') {
        result = videoItems.filter(video => video.eventType === 'album' && video.eventYear === 2024);
      } else if (selectedFilter === 'camp-2023') {
        result = videoItems.filter(video => video.eventType === 'camp' && video.eventYear === 2023);
      } else if (selectedFilter === 'camp-2025') {
        result = videoItems.filter(video => video.eventType === 'camp' && video.eventYear === 2025);
      }
    }

    // 날짜순(내림차순) 정렬
    return [...result].sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedFilter]);

  return (
    <PageLayout
      title="비디오 - 강정피스앤뮤직캠프"
      description="강정피스앤뮤직캠프의 공연영상 모음. 평화를 노래하는 뮤지션들의 공연 영상을 만나보세요."
      keywords="공연영상, 강정피스앤뮤직캠프, 평화 공연, 뮤지션 공연, 유튜브 영상"
      background="white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="typo-h2 mb-4">
            비디오
          </h2>
          <p className="typo-subtitle mb-12">
            평화를 노래하는 우리들의 순간
          </p>
        </motion.div>
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
