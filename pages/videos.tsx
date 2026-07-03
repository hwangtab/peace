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

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';

  return {
    props: {
      ...(await serverSideTranslations(
        resolvedLocale,
        ['translation', 'videos'],
        nextI18NextConfig
      )),
      initialVideos: (await loadPublishedVideos(resolvedLocale)).items,
      initialLocale: resolvedLocale,
    },
    // 비디오 목록은 거의 안 바뀌므로 1h→24h (archive_videos 재조회 빈도 축소).
    revalidate: 86400,
  };
}
