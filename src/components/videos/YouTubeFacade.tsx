import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

interface YouTubeFacadeProps {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
}

const YouTubeFacade: React.FC<YouTubeFacadeProps> = ({ videoId, title, thumbnailUrl }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoId) {
    return (
      <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black">
        <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
          {t('common.video_unavailable') || 'Video unavailable'}
        </div>
      </div>
    );
  }

  // hqdefault(480x360)는 모든 동영상에 존재. maxresdefault는 없는 경우 404.
  const thumb =
    thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  if (isPlaying) {
    return (
      <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black">
      {/* YouTube CDN에서 직접 로드 — Next.js 프록시 우회로 지연 방지 */}
      <Image
        src={thumb}
        alt={title}
        fill
        className="object-cover"
        unoptimized
        priority
      />
      <button
        type="button"
        className="absolute inset-0 w-full h-full flex items-center justify-center group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
        onClick={() => setIsPlaying(true)}
        aria-label={`${t('common.play')} ${title}`}
      >
        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-all duration-200 group-hover:bg-white group-hover:scale-110 group-focus-visible:bg-white group-focus-visible:scale-110">
          <svg
            className="w-7 h-7 text-black ml-1"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default YouTubeFacade;
