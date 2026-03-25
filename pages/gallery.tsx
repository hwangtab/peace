import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/GalleryPage';
import { GalleryImage } from '@/types/gallery';
import { loadGalleryImages } from '@/utils/dataLoader';

export default function WrappedPage({ initialImages }: { initialImages: GalleryImage[] }) {
  return <Page initialImages={initialImages} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const initialImages = loadGalleryImages<GalleryImage>()
    .sort((a, b) => {
      if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
      return b.id - a.id;
    });

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ko', ['translation'], nextI18NextConfig)),
      initialImages,
    },
    revalidate: 3600,
  };
}
