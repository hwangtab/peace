import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '../../src/pages/album/AlbumAboutPage';
import fs from 'fs';
import path from 'path';
import { VideoItem } from '../../src/types/video';
import { Musician } from '../../src/types/musician';
import { GalleryImage } from '../../src/types/gallery';

interface WrappedPageProps {
  initialVideos: VideoItem[];
  initialMusicians: Musician[];
  initialImages: GalleryImage[];
  initialLocale: string;
}

export default function WrappedPage(props: WrappedPageProps) {
  return <Page {...props} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale || 'ko';
  const dataPath = path.join(process.cwd(), 'public', 'data');

  const getLocalizedData = <T,>(filename: string): T[] => {
    try {
      let filePath = path.join(dataPath, filename);
      if (lang !== 'ko') {
        const localizedPath = path.join(dataPath, lang, filename);
        if (fs.existsSync(localizedPath)) {
          filePath = localizedPath;
        } else {
          // Fallback to English if Korean isn't the current and localized doesn't exist
          const enPath = path.join(dataPath, 'en', filename);
          if (fs.existsSync(enPath)) {
            filePath = enPath;
          }
        }
      }

      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T[];
      }
    } catch (e) {
      console.error(`Error loading ${filename}:`, e);
    }
    return [];
  };

  const initialVideos = getLocalizedData<VideoItem>('videos.json');
  const initialMusicians = getLocalizedData<Musician>('musicians.json');

  // Gallery preview for SSG payload size optimization (full data is fetched client-side)
  const categories = ['album'];
  let initialImages: GalleryImage[] = [];
  try {
    initialImages = categories.flatMap(cat => {
      const p = path.join(dataPath, 'gallery', `${cat}.json`);
      return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
    });
  } catch (e) {
    console.error('Error loading gallery images for album info:', e);
  }

  return {
    props: {
      ...(await serverSideTranslations(lang, ['translation'], nextI18NextConfig)),
      initialVideos,
      initialMusicians,
      initialImages,
      initialLocale: lang,
    },
    revalidate: 3600,
  };
}
