import React, { useRef, useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { VideoItem, videoItems } from '../../data/videos';
import VideoEventFilter from './EventFilter';
import SEOHelmet from '../shared/SEOHelmet';

const VideoCard: React.FC<{ video: VideoItem }> = ({ video }) => {
  const getYoutubeVideoId = (url: string) => url.split('/').pop();
  const getYoutubeWatchUrl = (url: string) => `https://www.youtube.com/watch?v=${getYoutubeVideoId(url)}`;

  const videoId = getYoutubeVideoId(video.youtubeUrl);
  const [imgSrc, setImgSrc] = useState(video.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <a
        href={getYoutubeWatchUrl(video.youtubeUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 block hover:bg-ocean-mist/10 transition-colors duration-300"
      >
        <div className="relative aspect-video overflow-hidden rounded-t-xl group">
          <img
            src={imgSrc}
            alt={video.title}
            onError={() => {
              if (imgSrc.includes('maxresdefault')) {
                setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
              }
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-6 h-6 text-jeju-ocean ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-6 h-full flex flex-col cursor-pointer">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 cursor-pointer">{video.location}</span>
            <span className="text-sm text-gray-500 cursor-pointer">{video.date}</span>
          </div>
          <h3 className="text-xl font-semibold text-deep-ocean mb-2 hover:text-jeju-ocean transition-colors duration-300 cursor-pointer line-clamp-2">
            {video.title}
          </h3>
          <p className="text-gray-600 flex-1 cursor-pointer line-clamp-3">{video.description}</p>
        </div>
      </a>
    </div>
  );
};

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

    // 연도순(오름차순) 정렬
    return [...result].sort((a, b) => {
      if (a.eventYear !== b.eventYear) return (a.eventYear || 0) - (b.eventYear || 0);
      return a.id - b.id;
    });
  }, [selectedFilter]);

  return (
    <section className="section bg-white" ref={ref}>
      <SEOHelmet
        title="비디오 - 강정피스앤뮤직캠프"
        description="강정피스앤뮤직캠프의 공연영상 모음. 평화를 노래하는 뮤지션들의 공연 영상을 만나보세요."
        keywords="공연영상, 강정피스앤뮤직캠프, 평화 공연, 뮤지션 공연, 유튜브 영상"
      />
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-medium text-gray-900 mb-4 font-serif">
            비디오
          </h2>
          <p className="text-lg text-gray-600 mb-12 subtitle">
            평화를 노래하는 우리들의 순간
          </p>
        </motion.div>
        <VideoEventFilter selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredVideos.map((video) => (
            <div key={video.id} className="h-full">
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
