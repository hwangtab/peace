import React, { useState } from 'react';
import { VideoItem } from '../../data/videos';

interface VideoCardProps {
    video: VideoItem;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
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
                    <h3 className="typo-h3 mb-2 hover:text-jeju-ocean transition-colors duration-300 cursor-pointer line-clamp-2">
                        {video.title}
                    </h3>
                    <p className="typo-body flex-1 cursor-pointer line-clamp-3">{video.description}</p>
                </div>
            </a>
        </div>
    );
};

export default VideoCard;
