import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/album/AlbumMusiciansPage';
import { Musician } from '@/types/musician';
import { Track } from '@/types/track';
import { loadLocalizedData } from '@/utils/dataLoader';
import { buildTrackMusicianRelation } from '@/utils/trackMusician';

interface MusiciansWrappedPageProps {
  initialMusicians: Musician[];
  initialLocale: string;
}

export default function WrappedPage({
  initialMusicians,
  initialLocale,
}: MusiciansWrappedPageProps) {
  return <Page initialMusicians={initialMusicians} initialLocale={initialLocale} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      initialMusicians: (() => {
        const canonicalTracks = loadLocalizedData<Track>('ko', 'tracks.json');
        const canonicalMusicians = loadLocalizedData<Musician>('ko', 'musicians.json');
        const canonicalRelation = buildTrackMusicianRelation(canonicalTracks, canonicalMusicians);

        const albumMusicianIds = new Set(canonicalRelation.trackByMusicianId.keys());
        const localizedMusicians = loadLocalizedData<Musician>(resolvedLocale, 'musicians.json');

        return localizedMusicians.filter((musician) => albumMusicianIds.has(musician.id));
      })(),
      initialLocale: resolvedLocale,
    },
    revalidate: 3600,
  };
}
