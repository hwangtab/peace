import { GetStaticPropsContext, GetStaticPathsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { camps } from '@/data/camps';
import { Musician } from '@/types/musician';
import { VideoItem } from '@/types/video';
import type { CampVideoDirector, CampVideoItem } from '@/components/camp/CampVideos';
import { loadLocalizedData } from '@/utils/dataLoader';
import Camp2023Page from '@/pages/Camp2023Page';
import Camp2025Page from '@/pages/Camp2025Page';
import Camp2026Page from '@/pages/Camp2026Page';
import NotFoundPage from '@/pages/NotFoundPage';

const CURRENT_CAMP_YEAR = Math.max(...camps.map((c) => c.year));

const pageComponents: Record<
  string,
  React.ComponentType<{
    initialMusicians?: Musician[];
    initialLocale?: string;
    isPast?: boolean;
    campVideos?: CampVideoItem[];
    campVideoDirectors?: CampVideoDirector[];
  }>
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
  campVideos: CampVideoItem[];
  campVideoDirectors: CampVideoDirector[];
}

export default function CampPage({
  year,
  initialMusicians,
  initialLocale,
  isPast,
  campVideos,
  campVideoDirectors,
}: CampPageProps) {
  const Component = pageComponents[year];
  if (!Component) return <NotFoundPage />;
  return (
    <Component
      initialMusicians={initialMusicians}
      initialLocale={initialLocale}
      isPast={isPast}
      campVideos={campVideos}
      campVideoDirectors={campVideoDirectors}
    />
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
  // (2) Camp 2026 은 모달 대신 전용 musician 페이지로 이동하므로 이 페이지가
  // 렌더/스키마에서 실제로 쓰지 않는 무거운 필드(description·genre·trackTitle)를 제거.
  // Camp 2026 이 소비하는 musician 필드는 id·name·shortDescription·imageUrl·
  // instagramUrls 뿐(타임테이블 카드 + JSON-LD sameAs/image). 다른 페이지(2023/2025)는
  // CampParticipants→MusicianModal 에서 이 필드들을 사용하므로 그대로 유지.
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
    .map((m) => (isCurrentCamp ? { ...m, description: '', genre: [], trackTitle: '' } : m));

  // CampVideos 는 마운트 후 videos.json(66KB)+musicians.json(51KB) 전체를 다시 받아
  // 해당 연도 camp 영상 3개로 추렸다. 빌드 시점에 확정되는 정적 데이터이므로 여기서
  // 계산해 내려보낸다. 넘기는 필드는 VideoCard 가 실제로 렌더하는 것만.
  // 현재 CampVideos 를 렌더하는 건 Camp2026Page 뿐이라 2026 에서만 계산한다.
  let campVideos: CampVideoItem[] = [];
  let campVideoDirectors: CampVideoDirector[] = [];
  if (year === '2026') {
    const yearVideos = loadLocalizedData<VideoItem>(lang, 'videos.json', { mergeByIdKey: 'id' })
      .filter((v) => v.eventType === 'camp' && v.eventYear === camp.year)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    campVideos = yearVideos.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      youtubeUrl: v.youtubeUrl,
      date: v.date,
      ...(v.location !== undefined ? { location: v.location } : {}),
      ...(v.thumbnailUrl !== undefined ? { thumbnailUrl: v.thumbnailUrl } : {}),
      ...(v.musicianIds !== undefined ? { musicianIds: v.musicianIds } : {}),
    }));

    const directorIds = [
      ...new Set(
        yearVideos
          .map((v) => v.directorMusicianId)
          .filter((id): id is number => typeof id === 'number')
      ),
    ];
    campVideoDirectors = directorIds
      .map((id) => allMusicians.find((m) => m.id === id))
      .filter((m): m is Musician => m !== undefined)
      .map((m) => ({ id: m.id, name: m.name }));
  }

  // camp_faq_2026 namespace 는 Camp 2026 페이지에서만 사용 — 2023/2025 페이지의
  // SSG payload 에서 제외해 13 로케일 × 1~2KB 누적 절감.
  // camp_guidelines_2026 은 본문 전체(로케일당 ~10KB)이나 이 랜딩에서 렌더되는
  // GuidelinesSummary 는 요약 키(8%)만 쓴다. 요약 전용 ns 만 로드해 최다 트래픽
  // 페이지의 __NEXT_DATA__ 에서 죽은 운영지침 본문(92%)을 제거한다.
  // gangjeong(GangjeongStorySection)·timeline(buildCamp2026Schemas 의 EventSeries)
  // 은 Camp2026Page 만 사용한다. 2023/2025 는 CampDetailPage 를 렌더하며 두 ns 의
  // 키를 전혀 쓰지 않으므로 2026 에서만 로드한다 (로케일당 ~5.9KB 절감).
  const namespaces = ['translation', 'gallery'];
  if (year === '2026') {
    namespaces.push('gangjeong');
    namespaces.push('timeline');
    namespaces.push('camp_faq_2026');
    namespaces.push('camp_guidelines_2026_summary');
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
      campVideos,
      campVideoDirectors,
    },
    revalidate: 3600,
  };
}
