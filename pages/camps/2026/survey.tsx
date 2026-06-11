import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config';
import CampSurvey2026Page from '@/pages/CampSurvey2026Page';

// 제3회 강정 피스앤뮤직캠프 뮤지션 설문 — 한국어 단일 페이지.
// 본문은 컴포넌트에 한국어로 직접 담고, translation 네임스페이스는 공통 레이아웃/SEO 용도로만 로드한다.
export default CampSurvey2026Page;

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale ?? 'ko';
  return {
    props: {
      ...(await serverSideTranslations(lang, ['translation'], nextI18NextConfig)),
    },
    revalidate: 3600,
  };
}
