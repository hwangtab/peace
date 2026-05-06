import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { camps } from '@/data/camps';
import { Musician } from '@/types/musician';
import { loadLocalizedData } from '@/utils/dataLoader';
import Camp2023Page from '@/pages/Camp2023Page';
import Camp2025Page from '@/pages/Camp2025Page';
import Camp2026Page from '@/pages/Camp2026Page';
import NotFoundPage from '@/pages/NotFoundPage';

const CURRENT_CAMP_YEAR = Math.max(...camps.map((c) => c.year));

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
  if (!Component) return <NotFoundPage />;
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

  // pageProps 절감: (1) 이 캠프 참가자로 등록된 musicianId 만 추리고
  // (2) Camp 2026 은 모달 대신 전용 musician 페이지로 이동하므로 가장 무거운
  // description 필드를 제거. 다른 페이지(2023/2025)는 CampParticipants→MusicianModal
  // 에서 description 을 사용하므로 그대로 유지.
  const allMusicians = loadLocalizedData<Musician>(lang, 'musicians.json');
  const referencedIds = new Set<number>(
    (camp.participants ?? [])
      .map((p) => (typeof p === 'object' && p !== null && 'musicianId' in p ? p.musicianId : undefined))
      .filter((id): id is number => typeof id === 'number'),
  );
  const isCurrentCamp = camp.year >= CURRENT_CAMP_YEAR;
  const initialMusicians = allMusicians
    .filter((m) => referencedIds.has(m.id))
    .map((m) => (isCurrentCamp ? { ...m, description: '' } : m));

  return {
    props: {
      ...(await serverSideTranslations(
        lang,
        ['translation', 'gangjeong', 'camp_faq_2026', 'timeline', 'gallery'],
        nextI18NextConfig,
      )),
      year,
      initialMusicians,
      initialLocale: lang,
    },
    ...(isCurrentCamp && { revalidate: 3600 }),
  };
}
