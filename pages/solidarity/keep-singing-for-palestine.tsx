import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';
import Page from '@/pages/KeepSingingPage';

/**
 * `/solidarity/keep-singing-for-palestine` — 전용 정적 라우트.
 * 같은 slug 를 `[slug].tsx` 가 다시 만들지 않도록 `DEDICATED_ROUTE_SLUGS` 로 제외한다.
 *
 * 기획 변경(2026-09-13)으로 라인업 섹션을 내리면서 뮤지션 데이터도 더 불러오지 않는다.
 * 명단이 확정되어 Lineup 을 되살릴 때 musicians.json 로딩도 함께 복원한다.
 */

export default function WrappedPage() {
  return <Page />;
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale ?? 'ko';

  return {
    props: {
      ...(await serverSideTranslations(
        lang,
        ['translation', 'concert_ksfp_2026'],
        nextI18NextConfig
      )),
    },
  };
}
