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

  // pageProps 절감: 트랙 리스트는 musician.imageUrl/name 만 사용하므로 description 제거.
  // 모달이 없는 화면이라 클라이언트 가시 영향 없음. 로케일 변경 시 useLocalizedResource 가
  // 전체 데이터를 다시 가져옴.
  const initialMusicians = loadLocalizedData<Musician>(resolvedLocale, 'musicians.json').map(
    (m) => ({ ...m, description: '' }),
  );

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      initialTracks: loadLocalizedData<Track>(resolvedLocale, 'tracks.json'),
      initialMusicians,
      initialLocale: resolvedLocale,
    },
    revalidate: 3600,
  };
}
