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
  initialLocale: string;
}

export default function WrappedPage(props: WrappedPageProps) {
  return <Page {...props} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale || 'ko';

  const initialVideos = loadLocalizedData<VideoItem>(lang, 'videos.json');
  const initialMusicians = loadLocalizedData<Musician>(lang, 'musicians.json');
  const canonicalTracks = loadLocalizedData<Track>('ko', 'tracks.json');
  const canonicalMusicians = loadLocalizedData<Musician>('ko', 'musicians.json');
  const canonicalRelation = buildTrackMusicianRelation(canonicalTracks, canonicalMusicians);
  const initialAlbumMusicianIds = [...canonicalRelation.trackByMusicianId.keys()];

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
      initialLocale: lang,
    },
    revalidate: 3600,
  };
}
