import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import Page from '@/pages/PhotographerPage';
import { GalleryImage } from '@/types/gallery';
import { loadGalleryImages } from '@/utils/dataLoader';
import { allPhotographerSlugs } from '@/data/photographers';
import type { SlimGalleryImage } from '@/pages/PhotographerPage';

// SSR 첫 페인트용으로 상단 N장만 보낸다. 나머지는 PhotographerPage 가 마운트 후
// /data/gallery/*.json 을 fetch 해 작가 필터를 적용해 채운다. kwdh(2,015장) 등
// 전량 인라인 시 페이지 데이터가 로케일당 ~200KB 로 128KB 임계를 넘기던 회귀 해소.
// gallery.tsx 의 SSR_PREVIEW_COUNT 와 동일 값(60)으로 맞춘다.
const SSR_PREVIEW_COUNT = 60;

interface WrappedProps {
  slug: string;
  initialImages: SlimGalleryImage[];
  /** SSR preview 외 전체 이미지 수 — schema numberOfItems 정확도용 */
  totalImageCount: number;
}

export default function WrappedPage({ slug, initialImages, totalImageCount }: WrappedProps) {
  return <Page slug={slug} initialImages={initialImages} totalImageCount={totalImageCount} />;
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const slugs = allPhotographerSlugs();
  const paths = (locales || ['ko']).flatMap((locale) =>
    slugs.map((slug) => ({ params: { slug }, locale }))
  );
  return { paths, fallback: false };
}

export async function getStaticProps({ params, locale }: GetStaticPropsContext) {
  const slug = params?.slug as string;
  if (!allPhotographerSlugs().includes(slug)) {
    return { notFound: true };
  }

  // props 슬림화 2단계:
  // (1) 필드 슬림 — GalleryImageItem 이 실제로 읽는 필드(url, description, eventType,
  //     eventYear)만 남긴다. id·photographer 는 이 페이지에서 렌더에 쓰지 않는다.
  // (2) 개수 슬림 — 전량(kwdh 2,015장 ≈ 200KB) 을 인라인하지 않고 상단 60장만 SSR 로
  //     내려보낸다. 나머지는 PhotographerPage 가 클라이언트에서 fetch(gallery.tsx 패턴).
  const all: SlimGalleryImage[] = loadGalleryImages<GalleryImage>()
    .filter((img) => img.photographer === slug)
    .sort((a, b) => {
      if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
      return b.id - a.id;
    })
    .map(({ url, description, eventType, eventYear }) => ({
      url,
      // description 이 없는 이미지가 많다. undefined 는 getStaticProps 직렬화가
      // 불가능하므로 키를 생략한다(optional 필드라 누락 가능).
      ...(description !== undefined && { description }),
      eventType,
      eventYear,
    }));

  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? 'ko',
        ['translation', 'gallery'],
        nextI18NextConfig
      )),
      slug,
      initialImages: all.slice(0, SSR_PREVIEW_COUNT),
      totalImageCount: all.length,
    },
    revalidate: 3600,
  };
}
