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
    (v) => v.eventType === 'album' && v.eventYear === 2024
  );
  // pageProps 절감: AlbumAboutPage 는 alwaysRefetch=true 로 마운트 직후 풀 musician
  // 데이터를 다시 가져오므로, SSG 단계에서는 SEO 검색 봇과 첫 페인트에 필요한 최소
  // 필드(id/name/imageUrl/trackTitle/trackId) 만 인라인. 무거운 description /
  // shortDescription / genre / instagramUrls / youtubeUrl 등은 비워서 보낸다 (대형
  // 로케일에서 30–55KB 절감).
  const initialMusicians: Musician[] = loadLocalizedData<Musician>(lang, 'musicians.json').map(
    (m) => ({
      id: m.id,
      name: m.name,
      imageUrl: m.imageUrl,
      trackTitle: m.trackTitle,
      ...(m.trackId !== undefined ? { trackId: m.trackId } : {}),
      shortDescription: '',
      description: '',
      genre: [],
      instagramUrls: [],
    })
  );
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
      ...(await serverSideTranslations(
        lang,
        ['translation', 'album', 'videos'],
        nextI18NextConfig
      )),
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
