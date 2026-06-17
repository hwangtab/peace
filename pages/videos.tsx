import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/VideosPage';
import { VideoItem } from '@/types/video';
import { loadPublishedVideos, loadSiteContentMap } from '@/lib/archivePublicData';
import type { SiteContentMap } from '@/types/cms';

interface VideosWrappedPageProps {
  initialVideos: VideoItem[];
  initialLocale: string;
  siteContent: SiteContentMap;
}

export default function WrappedPage({
  initialVideos,
  initialLocale,
  siteContent,
}: VideosWrappedPageProps) {
  return (
    <Page initialVideos={initialVideos} initialLocale={initialLocale} siteContent={siteContent} />
  );
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
      siteContent: await loadSiteContentMap(resolvedLocale, '/videos'),
    },
    revalidate: 3600,
  };
}
