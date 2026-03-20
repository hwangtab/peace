import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/album/AlbumTracksPage';
import { Track } from '@/types/track';
import { Musician } from '@/types/musician';
import { loadLocalizedData } from '@/utils/dataLoader';

interface TracksWrappedPageProps {
  initialTracks: Track[];
  initialMusicians: Musician[];
  initialLocale: string;
}

export default function WrappedPage({ initialTracks, initialMusicians, initialLocale }: TracksWrappedPageProps) {
  return <Page initialTracks={initialTracks} initialMusicians={initialMusicians} initialLocale={initialLocale} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      initialTracks: loadLocalizedData<Track>(resolvedLocale, 'tracks.json'),
      initialMusicians: loadLocalizedData<Musician>(resolvedLocale, 'musicians.json'),
      initialLocale: resolvedLocale,
    },
  };
}
