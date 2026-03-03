import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '../../src/pages/album/AlbumMusiciansPage';
import fs from 'fs';
import path from 'path';
import { Musician } from '../../src/types/musician';

interface MusiciansWrappedPageProps {
  initialMusicians: Musician[];
  initialLocale: string;
}

const readJsonArray = <T,>(filePath: string): T[] => {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content) as T[];
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

export default function WrappedPage({ initialMusicians, initialLocale }: MusiciansWrappedPageProps) {
  return <Page initialMusicians={initialMusicians} initialLocale={initialLocale} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      initialMusicians: loadLocalizedMusicians(resolvedLocale),
      initialLocale: resolvedLocale,
    },
  };
}
