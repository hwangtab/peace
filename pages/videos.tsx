import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/components/videos/VideoPage';
import { VideoItem } from '@/types/video';
import { loadLocalizedData } from '@/utils/dataLoader';

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
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      initialVideos: loadLocalizedData<VideoItem>(resolvedLocale, 'videos.json'),
      initialLocale: resolvedLocale,
    },
    revalidate: 3600,
  };
}
