import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/VideosPage';
import { VideoItem } from '@/types/video';
import { loadPublishedVideos } from '@/lib/archivePublicData';

interface VideosWrappedPageProps {
  initialVideos: VideoItem[];
  initialLocale: string;
}

export default function WrappedPage({ initialVideos, initialLocale }: VideosWrappedPageProps) {
  return <Page initialVideos={initialVideos} initialLocale={initialLocale} />;
}

/**
 * pageProps 절감: /videos 는 145개 전량을 내려받지만 첫 화면에 카드로 그리는 건
 * VIDEOS_CONFIG.INITIAL_VISIBLE_COUNT(12)개뿐이고, 나머지는 스크롤 도달 시 카드로
 * 승격되기 전까지 제목 텍스트 링크로만 렌더된다. 그래서
 *
 *  1) thumbnailUrl 은 전량 제거 — VideoCard 가 youtubeUrl 에서 img.youtube.com
 *     썸네일 URL 을 직접 만들고(onError 로 maxres→hq 폴백) 있어 값이 없어도 동일한
 *     이미지가 나온다. (약 9.6KB)
 *  2) directorMusicianId / directorName 은 이 페이지 어디에서도 읽지 않는다.
 *
 * description 은 스크롤로 승격되는 카드에도 그대로 노출되므로 트리밍하지 않는다
 * (빈 blurb 가 보이는 시각적 퇴행 > 수 KB 절감).
 *
 * 필터·정렬(eventType·eventYear·date)과 JSON-LD 에 필요한 필드는 전량 유지한다.
 * 로케일을 바꾸면 useLocalizedResource 가 클라이언트에서 풀 데이터를 다시 가져온다.
 */
export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';
  const allVideos = (await loadPublishedVideos(resolvedLocale)).items;

  const initialVideos: VideoItem[] = allVideos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    youtubeUrl: v.youtubeUrl,
    date: v.date,
    // location 은 타입상 필수지만 실데이터 145건 중 122건이 비어 있다.
    // undefined 를 그대로 props 에 넣으면 getStaticProps 직렬화가 실패한다.
    ...(v.location !== undefined ? { location: v.location } : {}),
    ...(v.eventType !== undefined ? { eventType: v.eventType } : {}),
    ...(v.eventYear !== undefined ? { eventYear: v.eventYear } : {}),
    ...(v.duration !== undefined ? { duration: v.duration } : {}),
    ...(v.musicianIds !== undefined ? { musicianIds: v.musicianIds } : {}),
  }));

  return {
    props: {
      ...(await serverSideTranslations(
        resolvedLocale,
        ['translation', 'videos'],
        nextI18NextConfig
      )),
      initialVideos,
      initialLocale: resolvedLocale,
    },
  };
}
