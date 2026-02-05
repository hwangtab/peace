import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { VideoItem } from '../../types/video';

interface VideoCardProps {
  video: VideoItem;
}

// 유틸리티 함수를 컴포넌트 외부로 이동 (매 렌더링마다 재생성 방지)
const getYoutubeVideoId = (url: string): string => {
  // embed 형식: https://www.youtube.com/embed/VIDEO_ID
  if (url.includes('/embed/')) {
    return url.split('/embed/')[1]?.split('?')[0] || '';
  }
  // watch 형식: https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1]?.split('&')[0] || '';
  }
  // 단축 형식: https://youtu.be/VIDEO_ID
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  return url.split('/').pop() || '';
};

const getYoutubeWatchUrl = (url: string) =>
  `https://www.youtube.com/watch?v=${getYoutubeVideoId(url)}`;

const VideoCard: React.FC<VideoCardProps> = React.memo(({ video }) => {
  const { i18n } = useTranslation();
  const videoId = getYoutubeVideoId(video.youtubeUrl);
  const [imgSrc, setImgSrc] = useState(
    video.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <a
        href={getYoutubeWatchUrl(video.youtubeUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-ocean-mist/10 transition-colors duration-300"
      >
        <div className="relative aspect-video overflow-hidden rounded-t-xl group">
          <Image
            src={imgSrc}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => {
              if (imgSrc.includes('maxresdefault')) {
                setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
              }
            }}
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
        <div className="pt-5 px-6 pb-4 flex flex-col cursor-pointer">
          <div className="flex justify-between items-center mb-3 text-xs font-medium text-ocean-mist uppercase tracking-tighter">
            <span>{video.location}</span>
            <span>
              {new Date(video.date).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <h3 className="typo-h3 text-xl mb-3 hover:text-jeju-ocean transition-colors duration-300 line-clamp-1 leading-snug break-words">
            {video.title}
          </h3>
          <p className="typo-body text-sm text-gray-600 line-clamp-3 leading-relaxed break-words">
            {video.description}
          </p>
        </div>
      </a>
    </div>
  );
});

VideoCard.displayName = 'VideoCard';

export default VideoCard;
