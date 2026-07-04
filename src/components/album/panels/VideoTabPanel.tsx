import React from 'react';
import { m as motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import Button from '../../common/Button';
import VideoCard from '../../videos/VideoCard';
import { VideoItem } from '@/types/video';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface VideoTabPanelProps {
  albumVideos: VideoItem[];
}

const VideoTabPanel: React.FC<VideoTabPanelProps> = ({ albumVideos }) => {
  const { t } = useTranslation();
  const { itemTransition } = useScrollReveal();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {albumVideos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={itemTransition(index)}
          >
            <VideoCard video={video} />
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-8">
        <Button to="/videos?filter=album-2024" variant="outline">
          {t('videos.all_videos')}
        </Button>
      </div>
    </>
  );
};

export default VideoTabPanel;
