import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import Page from '@/pages/PhotographerPage';
import { GalleryImage } from '@/types/gallery';
import { loadGalleryImages } from '@/utils/dataLoader';
import { allPhotographerSlugs } from '@/data/photographers';

interface WrappedProps {
  slug: string;
  images: GalleryImage[];
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

  const images = loadGalleryImages<GalleryImage>()
    .filter((img) => img.photographer === slug)
    .sort((a, b) => {
      if (a.eventYear !== b.eventYear) return (b.eventYear || 0) - (a.eventYear || 0);
      return b.id - a.id;
    });

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
