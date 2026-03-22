import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { camps } from '@/data/camps';
import { Musician } from '@/types/musician';
import { loadLocalizedData } from '@/utils/dataLoader';
import Camp2023Page from '@/pages/Camp2023Page';
import Camp2025Page from '@/pages/Camp2025Page';
import Camp2026Page from '@/pages/Camp2026Page';

const CURRENT_CAMP_YEAR = 2026;

const pageComponents: Record<string, React.ComponentType<{ initialMusicians?: Musician[]; initialLocale?: string }>> = {
  '2023': Camp2023Page,
  '2025': Camp2025Page,
  '2026': Camp2026Page,
};

interface CampPageProps {
  year: string;
  initialMusicians: Musician[];
  initialLocale: string;
}

export default function CampPage({ year, initialMusicians, initialLocale }: CampPageProps) {
  const Component = pageComponents[year];
  if (!Component) return null;
  return <Component initialMusicians={initialMusicians} initialLocale={initialLocale} />;
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const years = camps.map((c) => String(c.year));
  const paths = (locales || ['ko']).flatMap((locale) =>
    years.map((year) => ({ params: { year }, locale }))
  );
  return { paths, fallback: false };
}

export async function getStaticProps({ params, locale }: GetStaticPropsContext) {
  const year = params?.year as string;
  const lang = locale || 'ko';
  const camp = camps.find((c) => c.year === Number(year));

  if (!camp || !pageComponents[year]) {
    return { notFound: true };
  }

  const initialMusicians = loadLocalizedData<Musician>(lang, 'musicians.json');

  return {
    props: {
      ...(await serverSideTranslations(lang, ['translation'], nextI18NextConfig)),
      year,
      initialMusicians,
      initialLocale: lang,
    },
    ...(camp.year >= CURRENT_CAMP_YEAR && { revalidate: 3600 }),
  };
}
