import { useTranslation } from 'next-i18next';
import { VideoItem } from '@/types/video';
import Container from '@/components/layout/Container';
import VideoCard from '../videos/VideoCard';

interface RelatedVideosSectionProps {
  relatedVideos: VideoItem[];
}

export default function RelatedVideosSection({ relatedVideos }: RelatedVideosSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-ocean-sand pt-16 pb-24 sm:pb-36">
      <Container size="wide">
        <h2 className="typo-h2 text-jeju-ocean text-center mb-10">{t('nav.video')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </Container>
    </div>
  );
}
