import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import Page from '@/pages/GalleryPage';
import { GalleryImage } from '@/types/gallery';
import { loadPublishedGallery } from '@/lib/archivePublicData';

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
  const resolvedLocale = locale ?? 'ko';
  const all = (await loadPublishedGallery(resolvedLocale)).items.sort((a, b) => {
    if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
    return b.id - a.id;
  });

  return {
    props: {
      ...(await serverSideTranslations(
        resolvedLocale,
        ['translation', 'gallery'],
        nextI18NextConfig
      )),
      initialImages: all.slice(0, SSR_PREVIEW_COUNT),
      totalImageCount: all.length,
    },
    // ISR 미적용 — 이 페이지의 데이터는 레포 정적 JSON(public/data/**)이 단일 출처라
    // 재생성해도 바이트 동일한 결과가 나온다. 콘텐츠는 배포 시점에만 바뀌므로
    // revalidate 는 람다 호출과 cold TTFB 만 추가할 뿐이다. (참조: src/lib/archivePublicData.ts)
  };
}
