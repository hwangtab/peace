import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/album/AlbumAboutPage';
import path from 'path';
import { VideoItem } from '@/types/video';
import { Musician } from '@/types/musician';
import { GalleryImage } from '@/types/gallery';
import { Track } from '@/types/track';
import { loadLocalizedData, readJsonArray } from '@/utils/dataLoader';
import { buildTrackMusicianRelation } from '@/utils/trackMusician';

interface WrappedPageProps {
  initialVideos: VideoItem[];
  initialMusicians: Musician[];
  initialImages: GalleryImage[];
  initialAlbumMusicianIds: number[];
  initialMusicianTrackIds: Record<number, number>;
  initialLocale: string;
}

export default function WrappedPage(props: WrappedPageProps) {
  return <Page {...props} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale || 'ko';

  // pageProps 절감: AlbumAboutPage 는 album+2024 비디오만 필터해서 노출하므로
  // SSG 단계에서 같은 조건으로 미리 추린다 (143개→6개, 약 40KB↓).
  // 클라이언트가 useLocalizedResource 로 로케일 변경 시 전체 비디오를 다시 가져온다.
  const initialVideos = loadLocalizedData<VideoItem>(lang, 'videos.json').filter(
    (v) => v.eventType === 'album' && v.eventYear === 2024,
  );
  // pageProps 절감: musician.description (35–55KB 차지) 을 제거. AlbumAboutPage 가
  // alwaysRefetch=true 로 마운트 후 풀 데이터를 가져와 모달에서 정상 표시.
  const initialMusicians = loadLocalizedData<Musician>(lang, 'musicians.json').map((m) => ({
    ...m,
    description: '',
  }));
  const canonicalTracks = loadLocalizedData<Track>('ko', 'tracks.json');
  const canonicalMusicians = loadLocalizedData<Musician>('ko', 'musicians.json');
  const canonicalRelation = buildTrackMusicianRelation(canonicalTracks, canonicalMusicians);
  const initialAlbumMusicianIds = [...canonicalRelation.trackByMusicianId.keys()];
  const initialMusicianTrackIds: Record<number, number> = Object.fromEntries(
    [...canonicalRelation.trackByMusicianId.entries()].map(([mid, track]) => [mid, track.id])
  );

  // Gallery preview for SSG payload size optimization (full data is fetched client-side)
  const initialImages = readJsonArray<GalleryImage>(
    path.join(process.cwd(), 'public', 'data', 'gallery', 'album.json')
  );

  return {
    props: {
      ...(await serverSideTranslations(lang, ['translation'], nextI18NextConfig)),
      initialVideos,
      initialMusicians,
      initialImages,
      initialAlbumMusicianIds,
      initialMusicianTrackIds,
      initialLocale: lang,
    },
    revalidate: 3600,
  };
}
