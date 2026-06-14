import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { VideoItem } from '@/types/video';
import { getVideos } from '@/api/videos';
import { getMusicians } from '@/api/musicians';
import { camps } from '@/data/camps';
import { isParticipantObject } from '@/types/camp';
import Container from '../layout/Container';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import VideoCard from '../videos/VideoCard';

type PaddingLevel = 'none' | 'tight' | 'normal' | 'loose';

interface CampVideosProps {
  /** 캠프 연도 — 해당 연도 camp 영상만 노출 */
  year: number;
  /** 미리보기로 보여줄 최대 개수 */
  limit?: number;
  paddingTop?: PaddingLevel;
  paddingBottom?: PaddingLevel;
}

interface DirectorRef {
  id: number;
  name: string;
}

const CAMP_2026_MUSICIAN_IDS = new Set(
  camps
    .find((c) => c.id === 'camp-2026')
    ?.participants?.filter(isParticipantObject)
    .filter((p) => p.musicianId !== undefined)
    .map((p) => p.musicianId as number) ?? []
);

const directorHref = (id: number): string =>
  CAMP_2026_MUSICIAN_IDS.has(id) ? `/camps/2026/musicians/${id}` : `/album/musicians/${id}`;

/**
 * 캠프 상세(후기) 페이지의 현장 영상 섹션.
 * videos.json 에서 해당 연도 camp 영상을 클라이언트에서 불러와 미리보기로 보여주고,
 * 전체는 /videos?filter=camp-{year} 로 연결한다. 영상이 없으면 렌더하지 않는다.
 * 영상감독(directorMusicianId)이 있으면 헤더에 크레딧을 노출하고 뮤지션 페이지로 연결.
 */
const CampVideos: React.FC<CampVideosProps> = ({
  year,
  limit = 6,
  paddingTop = 'normal',
  paddingBottom = 'normal',
}) => {
  const { t, i18n } = useTranslation();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [directors, setDirectors] = useState<DirectorRef[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getVideos(i18n.language), getMusicians(i18n.language)])
      .then(([allVideos, allMusicians]) => {
        if (cancelled) return;
        const campVideos = allVideos
          .filter((v) => v.eventType === 'camp' && v.eventYear === year)
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setVideos(campVideos);

        const directorIds = [
          ...new Set(
            campVideos
              .map((v) => v.directorMusicianId)
              .filter((id): id is number => typeof id === 'number')
          ),
        ];
        const resolved = directorIds
          .map((id) => {
            const m = allMusicians.find((mm) => mm.id === id);
            return m ? { id: m.id, name: m.name } : null;
          })
          .filter((d): d is DirectorRef => d !== null);
        setDirectors(resolved);
      })
      .catch((err) => console.warn('[CampVideos] load failed:', err));
    return () => {
      cancelled = true;
    };
  }, [i18n.language, year]);

  if (videos.length === 0) return null;

  const directorCredit =
    directors.length > 0 ? (
      <>
        {t('camp.video_director')}{' '}
        {directors.map((d, i) => (
          <React.Fragment key={d.id}>
            {i > 0 && ', '}
            <Link
              href={directorHref(d.id)}
              className="underline underline-offset-2 hover:text-jeju-ocean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean rounded-sm"
            >
              {d.name}
            </Link>
          </React.Fragment>
        ))}
      </>
    ) : undefined;

  return (
    <Section
      background="light-beige"
      id="videos"
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
    >
      <Container size="wide">
        <SectionHeader title={t('camp.section_videos')} subtitle={directorCredit} />
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
