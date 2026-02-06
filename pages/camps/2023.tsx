import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '../../src/pages/Camp2023Page';
import fs from 'fs';
import path from 'path';
import { Musician } from '../../src/types/musician';

export default function WrappedPage({ initialMusicians }: { initialMusicians: Musician[] }) {
  return <Page initialMusicians={initialMusicians} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale || 'ko';
  const dataPath = path.join(process.cwd(), 'public', 'data');
  let initialMusicians: Musician[] = [];

  try {
    let filePath = path.join(dataPath, 'musicians.json');
    if (lang !== 'ko') {
      const localizedPath = path.join(dataPath, lang, 'musicians.json');
      if (fs.existsSync(localizedPath)) {
        filePath = localizedPath;
      } else {
        const enPath = path.join(dataPath, 'en', 'musicians.json');
        if (fs.existsSync(enPath)) {
          filePath = enPath;
        }
      }
    }

    if (fs.existsSync(filePath)) {
      initialMusicians = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Musician[];
    }
  } catch (e) {
    console.error('Error loading musicians for camp SSG:', e);
  }

  return {
    props: {
      ...(await serverSideTranslations(lang, ['translation'], nextI18NextConfig)),
      initialMusicians,
    },
    revalidate: 3600,
  };
}
