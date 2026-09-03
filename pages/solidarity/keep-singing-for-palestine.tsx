import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import { Musician } from '@/types/musician';
import { loadLocalizedData } from '@/utils/dataLoader';
import { getSolidarityEventLineupIds } from '@/data/solidarity';
import Page from '@/pages/KeepSingingPage';

/**
 * `/solidarity/keep-singing-for-palestine` — 전용 정적 라우트.
 * 같은 slug 를 `[slug].tsx` 가 다시 만들지 않도록 `DEDICATED_ROUTE_SLUGS` 로 제외한다.
 */

const SLUG = 'keep-singing-for-palestine';

interface Props {
  initialMusicians: Musician[];
  initialLocale: string;
}

export default function WrappedPage({ initialMusicians, initialLocale }: Props) {
  return <Page initialMusicians={initialMusicians} initialLocale={initialLocale} />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale ?? 'ko';
  const lineupIds = new Set(getSolidarityEventLineupIds(SLUG));
  const allMusicians = loadLocalizedData<Musician>(lang, 'musicians.json');
  const initialMusicians = allMusicians.filter((m) => lineupIds.has(m.id));

  return {
    props: {
      ...(await serverSideTranslations(
        lang,
        ['translation', 'concert_ksfp_2026'],
        nextI18NextConfig
      )),
      initialMusicians,
      initialLocale: lang,
    },
    revalidate: 3600,
  };
}
