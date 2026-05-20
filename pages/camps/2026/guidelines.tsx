import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config';
import CampGuidelines2026Page from '@/pages/CampGuidelines2026Page';

export default CampGuidelines2026Page;

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale ?? 'ko';

  // 운영지침은 ko/en 로케일에서만 제공. 나머지 로케일은 404.
  if (lang !== 'ko' && lang !== 'en') {
    return { notFound: true };
  }

  return {
    props: {
      ...(await serverSideTranslations(lang, ['translation', 'camp_guidelines_2026'], nextI18NextConfig)),
    },
    revalidate: 3600,
  };
}
