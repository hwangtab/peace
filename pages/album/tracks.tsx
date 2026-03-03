import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '../../src/pages/album/AlbumTracksPage';
import fs from 'fs';
import path from 'path';
import { Track } from '../../src/types/track';
import { Musician } from '../../src/types/musician';

interface TracksWrappedPageProps {
  initialTracks: Track[];
  initialMusicians: Musician[];
  initialLocale: string;
}

const readJsonArray = <T,>(filePath: string): T[] => {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content) as T[];
};

const loadLocalizedTracks = (locale: string): Track[] => {
  const root = path.join(process.cwd(), 'public', 'data');
  const candidates = locale === 'ko'
    ? [path.join(root, 'tracks.json')]
    : [
      path.join(root, locale, 'tracks.json'),
      path.join(root, 'en', 'tracks.json'),
      path.join(root, 'tracks.json'),
    ];

  for (const candidate of candidates) {
    const data = readJsonArray<Track>(candidate);
    if (data.length > 0) return data;
  }
  return [];
};

const loadLocalizedMusicians = (locale: string): Musician[] => {
  const root = path.join(process.cwd(), 'public', 'data');
  const candidates = locale === 'ko'
    ? [path.join(root, 'musicians.json')]
    : [
      path.join(root, locale, 'musicians.json'),
      path.join(root, 'en', 'musicians.json'),
      path.join(root, 'musicians.json'),
    ];

  for (const candidate of candidates) {
    const data = readJsonArray<Musician>(candidate);
    if (data.length > 0) return data;
  }
  return [];
};

export default function WrappedPage({ initialTracks, initialMusicians, initialLocale }: TracksWrappedPageProps) {
  return <Page initialTracks={initialTracks} initialMusicians={initialMusicians} initialLocale={initialLocale} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      initialTracks: loadLocalizedTracks(resolvedLocale),
      initialMusicians: loadLocalizedMusicians(resolvedLocale),
      initialLocale: resolvedLocale,
    },
  };
}
