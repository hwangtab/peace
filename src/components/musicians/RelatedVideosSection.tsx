import { useTranslation } from 'next-i18next';
import { VideoItem } from '@/types/video';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/common/SectionHeader';
import VideoCard from '../videos/VideoCard';

interface RelatedVideosSectionProps {
  relatedVideos: VideoItem[];
}

export default function RelatedVideosSection({ relatedVideos }: RelatedVideosSectionProps) {
  const { t } = useTranslation();

  return (
    <Section background="ocean-sand" paddingTop="normal" paddingBottom="loose">
      <Container size="wide">
        <SectionHeader title={t('nav.video')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
