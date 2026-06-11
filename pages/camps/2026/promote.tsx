import fs from 'fs';
import path from 'path';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config';
import CampPromote2026Page, { PromoTexts } from '@/pages/CampPromote2026Page';

export default CampPromote2026Page;

/**
 * 홍보글 본문은 UI 로케일과 무관하게 한국어·영어를 한 페이지에 모두 노출해야 한다.
 * fallbackLng:false 환경에서는 t(..., { lng }) 로 반대 로케일 텍스트를 가져올 수 없으므로
 * 빌드 시점에 두 로케일 namespace JSON 을 직접 읽어 props 로 전달한다.
 */
function loadPromoTexts(locale: 'ko' | 'en'): PromoTexts {
  const file = path.join(process.cwd(), 'public', 'locales', locale, 'camp_promote_2026.json');
  const parsed = JSON.parse(fs.readFileSync(file, 'utf-8')) as {
    camp_promote_2026: { feed_text: string; story_text: string; hashtags_text: string };
  };
  const ns = parsed.camp_promote_2026;
  return { feed: ns.feed_text, story: ns.story_text, hashtags: ns.hashtags_text };
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const lang = locale ?? 'ko';

  return {
    props: {
      ...(await serverSideTranslations(
        lang,
        ['translation', 'camp_promote_2026'],
        nextI18NextConfig
      )),
      promoKo: loadPromoTexts('ko'),
      promoEn: loadPromoTexts('en'),
    },
    revalidate: 3600,
  };
}
