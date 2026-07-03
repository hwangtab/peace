import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import VideoDetailPage from '@/pages/VideoDetailPage';
import { VideoItem } from '@/types/video';
import { Musician } from '@/types/musician';
import { loadLocalizedData } from '@/utils/dataLoader';
import { loadPublishedVideos } from '@/lib/archivePublicData';

interface VideoDetailWrappedProps {
  video: VideoItem;
  relatedMusicians: Musician[];
  moreVideos: VideoItem[];
  director: Musician | null;
}

export default function WrappedPage(props: VideoDetailWrappedProps) {
  return <VideoDetailPage {...props} />;
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const koVideos = (await loadPublishedVideos('ko')).items;
  const paths = (locales || ['ko']).flatMap((locale) =>
    koVideos.map((v) => ({ params: { id: String(v.id) }, locale }))
  );
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params, locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';
  const id = params?.id as string;

  // ko 는 항상 필요(정본 목록·id·관계). 로케일이 ko 면 동일 쿼리를 두 번 돌리지 않는다.
  const koVideos = (await loadPublishedVideos('ko')).items;
  const localizedVideos =
    resolvedLocale === 'ko' ? koVideos : (await loadPublishedVideos(resolvedLocale)).items;
  const localizedMap = new Map(localizedVideos.map((v) => [v.id, v]));

  const baseVideo = koVideos.find((v) => String(v.id) === id);
  if (!baseVideo) {
    return { notFound: true };
  }

  const video = localizedMap.get(baseVideo.id) ?? baseVideo;

  const musicians = loadLocalizedData<Musician>(resolvedLocale, 'musicians.json');
  const musicianIds = baseVideo.musicianIds ?? [];
  const missingIds = musicianIds.filter((mid) => !musicians.some((m) => m.id === mid));
  if (missingIds.length > 0) {
    console.warn(`[videos/${id}] unknown musicianId(s): ${missingIds.join(', ')}`);
  }
  const relatedMusicians = musicianIds
    .map((mid) => musicians.find((m) => m.id === mid))
    .filter((m): m is Musician => Boolean(m));

  const director =
    baseVideo.directorMusicianId != null
      ? (musicians.find((m) => m.id === baseVideo.directorMusicianId) ?? null)
      : null;

  const moreVideos = koVideos
    .filter(
      (v) =>
        v.id !== baseVideo.id &&
        v.eventType === baseVideo.eventType &&
        v.eventYear === baseVideo.eventYear
    )
    .slice(0, 6)
    .map((v) => localizedMap.get(v.id) ?? v);

  return {
    props: {
      ...(await serverSideTranslations(
        resolvedLocale,
        ['translation', 'videos'],
        nextI18NextConfig
      )),
      video,
      relatedMusicians,
      moreVideos,
      director,
    },
    // 비디오 콘텐츠는 거의 안 바뀌므로 1h→24h. 페이지 변형이 ~1,870개(비디오×13로케일)라
    // 짧은 revalidate 는 크롤러 트래픽이 곧바로 archive_videos 재조회(egress)로 직결된다.
    revalidate: 86400,
  };
}
