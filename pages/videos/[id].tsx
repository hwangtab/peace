import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import VideoDetailPage from '@/pages/VideoDetailPage';
import type { MoreVideoRef, VideoMusicianRef } from '@/pages/VideoDetailPage';
import { VideoItem } from '@/types/video';
import { Musician } from '@/types/musician';
import { loadLocalizedData } from '@/utils/dataLoader';
import { loadPublishedVideos } from '@/lib/archivePublicData';
import { prerenderLocales } from '@/constants/locales';

interface VideoDetailWrappedProps {
  video: VideoItem;
  relatedMusicians: VideoMusicianRef[];
  moreVideos: MoreVideoRef[];
  director: VideoMusicianRef | null;
}

// pageProps 절감: 이 라우트는 ~1,885개 변형(비디오 × 13 로케일)이라 변형당 절감이
// 그대로 누적된다. VideoDetailPage 가 실제로 읽는 필드만 내려보낸다.
// - relatedMusicians / director : id·name·imageUrl (나머지 description·genre 등 미사용)
// - moreVideos(6개)             : id·title·youtubeUrl·location·thumbnailUrl
const toMusicianRef = (m: Musician): VideoMusicianRef => ({
  id: m.id,
  name: m.name,
  imageUrl: m.imageUrl,
});

const toMoreVideoRef = (v: VideoItem): MoreVideoRef => ({
  id: v.id,
  title: v.title,
  youtubeUrl: v.youtubeUrl,
  // location·thumbnailUrl 은 타입상 필수지만 실제 데이터에 빠진 항목이 있다.
  // undefined 를 그대로 넘기면 getStaticProps 직렬화가 실패하므로 조건부로 넣는다.
  ...(v.location !== undefined ? { location: v.location } : {}),
  ...(v.thumbnailUrl !== undefined ? { thumbnailUrl: v.thumbnailUrl } : {}),
});

export default function WrappedPage(props: VideoDetailWrappedProps) {
  return <VideoDetailPage {...props} />;
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const koVideos = (await loadPublishedVideos('ko')).items;
  // 145 영상 × 13 로케일 = 1,885 변형을 전부 빌드에 구우면 278s 가 든다.
  // 주요 로케일(ko·en)만 prerender 하고 나머지는 blocking fallback 으로 첫 요청 시
  // 생성·캐시한다. 크롤러에는 서버 렌더 HTML 이 그대로 나가므로 색인 손실이 없다.
  const paths = prerenderLocales(locales).flatMap((locale) =>
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
    .filter((m): m is Musician => Boolean(m))
    .map(toMusicianRef);

  const directorMusician =
    baseVideo.directorMusicianId != null
      ? (musicians.find((m) => m.id === baseVideo.directorMusicianId) ?? null)
      : null;
  const director = directorMusician ? toMusicianRef(directorMusician) : null;

  const moreVideos = koVideos
    .filter(
      (v) =>
        v.id !== baseVideo.id &&
        v.eventType === baseVideo.eventType &&
        v.eventYear === baseVideo.eventYear
    )
    .slice(0, 6)
    .map((v) => toMoreVideoRef(localizedMap.get(v.id) ?? v));

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
  };
}
