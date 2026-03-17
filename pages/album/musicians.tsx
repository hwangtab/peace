import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '../../src/pages/album/AlbumMusiciansPage';
import { Musician } from '../../src/types/musician';
import { Track } from '../../src/types/track';
import { loadLocalizedData } from '../../src/utils/dataLoader';

interface MusiciansWrappedPageProps {
  initialMusicians: Musician[];
  initialLocale: string;
}

export default function WrappedPage({ initialMusicians, initialLocale }: MusiciansWrappedPageProps) {
  return <Page initialMusicians={initialMusicians} initialLocale={initialLocale} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      initialMusicians: (() => {
        const tracks = loadLocalizedData<Track>(resolvedLocale, 'tracks.json');
        const allMusicians = loadLocalizedData<Musician>(resolvedLocale, 'musicians.json');
        const trackTitles = new Set(tracks.map(t => t.title));
        return allMusicians.filter(m => trackTitles.has(m.trackTitle));
      })(),
      initialLocale: resolvedLocale,
    },
  };
}
