import { GetStaticPathsContext, GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { Musician } from '@/types/musician';
import { loadLocalizedData } from '@/utils/dataLoader';
import { getSolidarityEventSlugs, getSolidarityEventLineupIds } from '@/data/solidarity';
import Page from '@/pages/SolidarityEventPage';

interface Props {
  slug: string;
  initialMusicians: Musician[];
  initialLocale: string;
}

export default function WrappedPage({ slug, initialMusicians, initialLocale }: Props) {
  return <Page slug={slug} initialMusicians={initialMusicians} initialLocale={initialLocale} />;
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const slugs = getSolidarityEventSlugs();
  const paths = (locales || ['ko']).flatMap((locale) =>
    slugs.map((slug) => ({ params: { slug }, locale }))
  );
  return { paths, fallback: false };
}

export async function getStaticProps({ params, locale }: GetStaticPropsContext) {
  const lang = locale ?? 'ko';
  const slug = params?.slug as string;

  const slugs = getSolidarityEventSlugs();
  if (!slugs.includes(slug)) {
    return { notFound: true };
  }

  const lineupIds = new Set(getSolidarityEventLineupIds(slug));
  const allMusicians = loadLocalizedData<Musician>(lang, 'musicians.json');
  const initialMusicians =
    lineupIds.size > 0 ? allMusicians.filter((m) => lineupIds.has(m.id)) : [];

  return {
    props: {
      ...(await serverSideTranslations(lang, ['translation'], nextI18NextConfig)),
      slug,
      initialMusicians,
      initialLocale: lang,
    },
    revalidate: 3600,
  };
}
