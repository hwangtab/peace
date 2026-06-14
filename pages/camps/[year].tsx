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

const pageComponents: Record<
  string,
  React.ComponentType<{ initialMusicians?: Musician[]; initialLocale?: string; isPast?: boolean }>
> = {
  '2023': Camp2023Page,
  '2025': Camp2025Page,
  '2026': Camp2026Page,
};

interface CampPageProps {
  year: string;
  initialMusicians: Musician[];
  initialLocale: string;
  isPast: boolean;
}

export default function CampPage({ year, initialMusicians, initialLocale, isPast }: CampPageProps) {
  const Component = pageComponents[year];
  if (!Component) return <NotFoundPage />;
  return (
    <Component initialMusicians={initialMusicians} initialLocale={initialLocale} isPast={isPast} />
  );
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  // pageComponents 에 컴포넌트가 없는 year 는 path 에서 제외 — 누락 시 soft 404 방지
  const years = camps.map((c) => String(c.year)).filter((y) => y in pageComponents);
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
      .map((p) =>
        typeof p === 'object' && p !== null && 'musicianId' in p ? p.musicianId : undefined
      )
      .filter((id): id is number => typeof id === 'number')
  );
  const isCurrentCamp = camp.year >= CURRENT_CAMP_YEAR;
  const initialMusicians = allMusicians
    .filter((m) => referencedIds.has(m.id))
    .map((m) => (isCurrentCamp ? { ...m, description: '' } : m));

  // camp_faq_2026 namespace 는 Camp 2026 페이지에서만 사용 — 2023/2025 페이지의
  // SSG payload 에서 제외해 13 로케일 × 1~2KB 누적 절감.
  const namespaces = ['translation', 'gangjeong', 'timeline', 'gallery'];
  if (year === '2026') {
    namespaces.push('camp_faq_2026');
    namespaces.push('camp_guidelines_2026');
  }

  // 행사 종료 여부 — endDate(KST 자정) 가 빌드/리밸리데이트 시점보다 과거면 후기 모드.
  // 서버(getStaticProps)에서만 Date 를 읽어 prop 으로 내려보내므로 SSG/CSR hydration
  // 불일치가 없다. revalidate(1h) 로 종료 직후 자동 전환된다.
  const isPast =
    !!camp.endDate && new Date(`${camp.endDate}T23:59:59+09:00`).getTime() < Date.now();

  return {
    props: {
      ...(await serverSideTranslations(lang, namespaces, nextI18NextConfig)),
      year,
      initialMusicians,
      initialLocale: lang,
      isPast,
    },
    revalidate: 3600,
  };
}
