import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { VideoItem, videoItems } from '../../data/videos';

const VideoCard: React.FC<{ video: VideoItem }> = ({ video }) => {
  const getYoutubeVideoUrl = (embedUrl: string) => {
    const videoId = embedUrl.split('/').pop();
    return `https://www.youtube.com/watch?v=${videoId}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <div className="relative w-full pb-[56.25%]">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={video.youtubeUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          frameBorder="0"
        ></iframe>
      </div>
      <a 
        href={getYoutubeVideoUrl(video.youtubeUrl)} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex-1 block hover:bg-gray-50/80 transition-colors duration-300"
      >
        <div className="p-6 h-full flex flex-col cursor-pointer">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 cursor-pointer">{video.location}</span>
            <span className="text-sm text-gray-500 cursor-pointer">{video.date}</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors duration-300 cursor-pointer">
            {video.title}
          </h3>
          <p className="text-gray-600 flex-1 cursor-pointer">{video.description}</p>
        </div>
      </a>
    </div>
  );
};

export default function VideoPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section bg-white" ref={ref}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-medium text-gray-900 mb-4 font-serif">
            공연영상
          </h2>
          <p className="text-lg text-gray-600 mb-12 subtitle">
            평화를 노래하는 우리들의 순간
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videoItems.map((video) => (
            <div key={video.id} className="h-full">
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
