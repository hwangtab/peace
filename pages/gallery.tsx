import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '../src/pages/GalleryPage';
import fs from 'fs';
import path from 'path';
import { GalleryImage } from '../src/types/gallery';

const GALLERY_SSG_PREVIEW_COUNT = 24;

export default function WrappedPage({ initialImages }: { initialImages: GalleryImage[] }) {
  return <Page initialImages={initialImages} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  // Fetch images directly from filesystem for SSG
  const categories = ['album', 'camp2023', 'camp2025'];
  let initialImages: GalleryImage[] = [];

  try {
    const results = categories.map((cat) => {
      const filePath = path.join(process.cwd(), 'public', 'data', 'gallery', `${cat}.json`);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content) as GalleryImage[];
      }
      return [];
    });
    initialImages = results
      .flat()
      .sort((a, b) => {
        if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
        return b.id - a.id;
      })
      .slice(0, GALLERY_SSG_PREVIEW_COUNT);
  } catch (error) {
    console.error('Error in getStaticProps for gallery:', error);
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ko', ['translation'], nextI18NextConfig)),
      initialImages,
    },
    revalidate: 3600, // ISR: 1 hour
  };
}
