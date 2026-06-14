import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { VideoItem } from '@/types/video';
import { getVideos } from '@/api/videos';
import Container from '../layout/Container';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import VideoCard from '../videos/VideoCard';

interface CampVideosProps {
  /** 캠프 연도 — 해당 연도 camp 영상만 노출 */
  year: number;
  /** 미리보기로 보여줄 최대 개수 */
  limit?: number;
}

/**
 * 캠프 상세(후기) 페이지의 현장 영상 섹션.
 * videos.json 에서 해당 연도 camp 영상을 클라이언트에서 불러와 미리보기로 보여주고,
 * 전체는 /videos?filter=camp-{year} 로 연결한다. 영상이 없으면 렌더하지 않는다.
 */
const CampVideos: React.FC<CampVideosProps> = ({ year, limit = 6 }) => {
  const { t, i18n } = useTranslation();
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    getVideos(i18n.language)
      .then((all) => {
        if (cancelled) return;
        const campVideos = all
          .filter((v) => v.eventType === 'camp' && v.eventYear === year)
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setVideos(campVideos);
      })
      .catch((err) => console.warn('[CampVideos] load failed:', err));
    return () => {
      cancelled = true;
    };
  }, [i18n.language, year]);

  if (videos.length === 0) return null;

  return (
    <Section background="light-beige" id="videos">
      <Container size="wide">
        <SectionHeader title={t('camp.section_videos')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.slice(0, limit).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Button to={`/videos?filter=camp-${year}`} variant="outline">
            {t('camp.more')}
          </Button>
        </div>
      </Container>
    </Section>
  );
};

export default CampVideos;
