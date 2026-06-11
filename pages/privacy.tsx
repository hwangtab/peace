import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';

// 개인정보처리방침 — 한국어 단일 본문. translation 네임스페이스는 공통 레이아웃/푸터용.
export default PrivacyPolicyPage;

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale ?? 'ko';
  return {
    props: {
      ...(await serverSideTranslations(lang, ['translation'], nextI18NextConfig)),
    },
    revalidate: 3600,
  };
}
