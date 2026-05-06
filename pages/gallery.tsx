import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/GalleryPage';
import { GalleryImage } from '@/types/gallery';
import { loadGalleryImages } from '@/utils/dataLoader';

// SSR 첫 페인트용으로 상단 N장만 보낸다. 나머지는 useGalleryImages 가 클라이언트에서
// /data/gallery/*.json 을 fetch 해 채운다. 658장 전량(약 92KB) 인라인 시 pageProps 가
// 128KB 임계를 넘기던 회귀 해소.
const SSR_PREVIEW_COUNT = 60;

interface WrappedPageProps {
  initialImages: GalleryImage[];
  totalImageCount: number;
}

export default function WrappedPage({ initialImages, totalImageCount }: WrappedPageProps) {
  return <Page initialImages={initialImages} totalImageCount={totalImageCount} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const all = loadGalleryImages<GalleryImage>()
    .sort((a, b) => {
      if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
      return b.id - a.id;
    });

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ko', ['translation', 'gallery'], nextI18NextConfig)),
      initialImages: all.slice(0, SSR_PREVIEW_COUNT),
      totalImageCount: all.length,
    },
    revalidate: 3600,
  };
}
