import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '../src/components/videos/VideoPage';
import fs from 'fs';
import path from 'path';
import { VideoItem } from '../src/types/video';

interface VideosWrappedPageProps {
  initialVideos: VideoItem[];
  initialLocale: string;
}

const readJsonArray = <T,>(filePath: string): T[] => {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content) as T[];
};

const loadLocalizedVideos = (locale: string): VideoItem[] => {
  const root = path.join(process.cwd(), 'public', 'data');
  const candidates = locale === 'ko'
    ? [path.join(root, 'videos.json')]
    : [
      path.join(root, locale, 'videos.json'),
      path.join(root, 'en', 'videos.json'),
      path.join(root, 'videos.json'),
    ];

  for (const candidate of candidates) {
    const data = readJsonArray<VideoItem>(candidate);
    if (data.length > 0) return data;
  }
  return [];
};

export default function WrappedPage({ initialVideos, initialLocale }: VideosWrappedPageProps) {
  return <Page initialVideos={initialVideos} initialLocale={initialLocale} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      initialVideos: loadLocalizedVideos(resolvedLocale),
      initialLocale: resolvedLocale,
    },
  };
}
