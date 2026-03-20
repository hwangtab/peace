import { useTranslation } from 'next-i18next';
import { VideoItem } from '@/types/video';
import VideoCard from '../videos/VideoCard';

interface RelatedVideosSectionProps {
  relatedVideos: VideoItem[];
}

export default function RelatedVideosSection({ relatedVideos }: RelatedVideosSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-ocean-sand pt-16 pb-24 sm:pb-36">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="typo-h2 text-jeju-ocean text-center mb-10">{t('nav.video')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
