import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/album/AlbumMusiciansPage';
import { Musician } from '@/types/musician';
import { Track } from '@/types/track';
import { loadLocalizedData } from '@/utils/dataLoader';

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
        const seen = new Set<string>();
        return allMusicians.filter(m => {
          if (!trackTitles.has(m.trackTitle) || seen.has(m.trackTitle)) return false;
          seen.add(m.trackTitle);
          return true;
        });
      })(),
      initialLocale: resolvedLocale,
    },
    revalidate: 3600,
  };
}
