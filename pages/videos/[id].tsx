import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import VideoDetailPage from '@/pages/VideoDetailPage';
import { VideoItem } from '@/types/video';
import { Musician } from '@/types/musician';
import { loadLocalizedData } from '@/utils/dataLoader';

interface VideoDetailWrappedProps {
  video: VideoItem;
  relatedMusicians: Musician[];
  moreVideos: VideoItem[];
}

export default function WrappedPage(props: VideoDetailWrappedProps) {
  return <VideoDetailPage {...props} />;
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const koVideos = loadLocalizedData<VideoItem>('ko', 'videos.json');
  const paths = (locales || ['ko']).flatMap((locale) =>
    koVideos.map((v) => ({ params: { id: String(v.id) }, locale }))
  );
  return { paths, fallback: false };
}

export async function getStaticProps({ params, locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';
  const id = params?.id as string;

  const koVideos = loadLocalizedData<VideoItem>('ko', 'videos.json');
  const localizedVideos = loadLocalizedData<VideoItem>(resolvedLocale, 'videos.json');
  const localizedMap = new Map(localizedVideos.map((v) => [v.id, v]));

  const baseVideo = koVideos.find((v) => String(v.id) === id);
  if (!baseVideo) {
    return { notFound: true };
  }

  const video = localizedMap.get(baseVideo.id) ?? baseVideo;

  const musicians = loadLocalizedData<Musician>(resolvedLocale, 'musicians.json');
  const relatedMusicians = (baseVideo.musicianIds ?? [])
    .map((mid) => musicians.find((m) => m.id === mid))
    .filter((m): m is Musician => Boolean(m));

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
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      video,
      relatedMusicians,
      moreVideos,
    },
    revalidate: 3600,
  };
}
