import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import Page from '@/pages/PhotographerPage';
import { GalleryImage } from '@/types/gallery';
import { loadGalleryImages } from '@/utils/dataLoader';
import { allPhotographerSlugs } from '@/data/photographers';
import type { SlimGalleryImage } from '@/pages/PhotographerPage';

interface WrappedProps {
  slug: string;
  images: SlimGalleryImage[];
}

export default function WrappedPage({ slug, images }: WrappedProps) {
  return <Page slug={slug} images={images} />;
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

  // props 슬림화: GalleryImageItem 이 실제로 읽는 필드(url, description, eventType,
  // eventYear)만 내려보낸다. id·photographer 는 이 페이지에서 사용하지 않으므로 제거해
  // getStaticProps 페이로드를 줄인다(261 kB → ~220 kB).
  const images: SlimGalleryImage[] = loadGalleryImages<GalleryImage>()
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
      images,
    },
    revalidate: 3600,
  };
}
