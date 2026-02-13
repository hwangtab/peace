import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '../src/components/press/PressPage';
import fs from 'fs';
import path from 'path';
import { PressItem } from '../src/types/press';

interface PressWrappedPageProps {
  initialPressItems: PressItem[];
  initialLocale: string;
}

const readJsonArray = <T,>(filePath: string): T[] => {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content) as T[];
};

const loadLocalizedPress = (locale: string): PressItem[] => {
  const root = path.join(process.cwd(), 'public', 'data');
  const candidates = locale === 'ko'
    ? [path.join(root, 'press.json')]
    : [
      path.join(root, locale, 'press.json'),
      path.join(root, 'en', 'press.json'),
      path.join(root, 'press.json'),
    ];

  for (const candidate of candidates) {
    const data = readJsonArray<PressItem>(candidate);
    if (data.length > 0) return data;
  }
  return [];
};

export default function WrappedPage({ initialPressItems, initialLocale }: PressWrappedPageProps) {
  return <Page initialPressItems={initialPressItems} initialLocale={initialLocale} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      initialPressItems: loadLocalizedPress(resolvedLocale),
      initialLocale: resolvedLocale,
    },
  };
}
