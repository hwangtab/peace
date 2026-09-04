import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { VideoItem } from '@/types/video';
import { camps } from '@/data/camps';
import { isParticipantObject } from '@/types/camp';
import Container from '../layout/Container';
import Section from '../layout/Section';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import VideoCard from '../videos/VideoCard';

type PaddingLevel = 'none' | 'tight' | 'normal' | 'loose';

/** VideoCard 렌더에 실제로 쓰이는 필드만 추린 형태 (getStaticProps 에서 생성) */
export type CampVideoItem = Pick<
  VideoItem,
  'id' | 'title' | 'description' | 'youtubeUrl' | 'date' | 'location'
> &
  Pick<VideoItem, 'thumbnailUrl' | 'musicianIds'>;

export interface CampVideoDirector {
  id: number;
  name: string;
}

interface CampVideosProps {
  /** 캠프 연도 — 전체보기 링크(/videos?filter=camp-{year}) 구성에 사용 */
  year: number;
  /** getStaticProps 에서 미리 필터·정렬된 해당 연도 camp 영상 */
  videos: CampVideoItem[];
  /** 영상감독 크레딧 (id·name 만) */
  directors?: CampVideoDirector[];
  /** 미리보기로 보여줄 최대 개수 */
  limit?: number;
  paddingTop?: PaddingLevel;
  paddingBottom?: PaddingLevel;
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
 * 표시할 영상·영상감독은 getStaticProps(pages/camps/[year].tsx)에서 로케일별로
 * 필터·정렬해 props 로 내려온다. 과거에는 마운트 후 videos.json(66KB)+musicians.json(51KB)
 * 전체를 클라이언트에서 다시 받아 3개를 걸러냈는데, 빌드 시점에 확정되는 정적 데이터라
 * 서버에서 계산해 넘긴다(런타임 fetch 0, CLS 플레이스홀더 불필요).
 * 전체 목록은 /videos?filter=camp-{year} 로 연결한다.
 */
const CampVideos: React.FC<CampVideosProps> = ({
  year,
  videos,
  directors = [],
  limit = 6,
  paddingTop = 'normal',
  paddingBottom = 'normal',
}) => {
  const { t } = useTranslation();

  // 영상이 없으면 섹션 자체를 렌더하지 않는다 (빌드 시점에 이미 확정된 값)
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
