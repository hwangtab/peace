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

  // pageProps 절감: 트랙 리스트는 buildTrackMusicianRelation 으로 트랙↔뮤지션을
  // 매핑한 뒤 musician.imageUrl 만 화면에 그린다 (모달 없음). 매핑에 필요한 5개
  // 필드 외 description / shortDescription / genre / instagramUrls / youtubeUrl 등
  // 무거운 필드는 제거. 로케일 변경 시 useLocalizedResource 가 풀 데이터를 다시
  // 가져옴.
  const initialMusicians: Musician[] = loadLocalizedData<Musician>(
    resolvedLocale,
    'musicians.json',
  ).map((m) => ({
    id: m.id,
    name: m.name,
    imageUrl: m.imageUrl,
    trackTitle: m.trackTitle,
    ...(m.trackId !== undefined ? { trackId: m.trackId } : {}),
    shortDescription: '',
    description: '',
    genre: [],
    instagramUrls: [],
  }));

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation', 'album'], nextI18NextConfig)),
      initialTracks: loadLocalizedData<Track>(resolvedLocale, 'tracks.json'),
      initialMusicians,
      initialLocale: resolvedLocale,
    },
    revalidate: 3600,
  };
}
