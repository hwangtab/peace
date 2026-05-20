const path = require('path');
const stressPostProcessor = require('./src/i18n/stressPostProcessor');
const { LOCALES, DEFAULT_LOCALE } = require('./src/constants/locales.js');

const isStressEnabled = ['1', 'true'].includes(process.env.NEXT_PUBLIC_I18N_STRESS);

const locales = [...LOCALES];

module.exports = {
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales,
  },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: false,
  // fallbackLng 비활성화 — 13 로케일 키 parity 100% 확보 후 적용 (audit 2026-05-10).
  // 비-KO 페이지의 _nextI18Next.initialI18nStore 에 ko 번들 동봉 제거 → SSG payload
  // -30~50KB/페이지, 13 로케일 × 13 라우트 누적 빌드 캐시 -10~30%.
  // 신규 키 추가 시 13 로케일 모두 반드시 채워야 raw key 노출 회귀 방지.
  fallbackLng: /** @type {false} */ (false),
  defaultNS: 'translation',
  // 페이지 단위 SSG payload 절감을 위한 namespace 분리. 각 namespace 는 그것을
  // 사용하는 페이지의 getStaticProps 에서만 serverSideTranslations 에 명시.
  // wrapper 키 보존 방식이라 t('group.x') 호출은 그대로 동작.
  //
  // - gangjeong       : home / camps/2026 (GangjeongStorySection)
  // - album           : /album/about, /album/musicians, /album/tracks 등
  // - faqs            : home (FAQ schema)
  // - press           : /press
  // - videos          : /videos, /videos/[id], /album/about(VideoTabPanel),
  //                     /album/musicians/[id], /camps/2026/musicians/[id]
  // - camp_faq_2026   : /camps/2026
  // - camp_guidelines_2026 : /camps/2026, /camps/2026/guidelines (ko/en only)
  // - about           : home
  // - gallery         : home, /gallery, /camps/[year](CampGallery)
  // - timeline        : /camps/2026 (EventSeries schema)
  // - notFound        : /404
  ns: [
    'translation',
    'gangjeong',
    'album',
    'faqs',
    'press',
    'videos',
    'camp_faq_2026',
    'camp_guidelines_2026',
    'about',
    'gallery',
    'timeline',
    'notFound',
  ],
  // fallbackNS: t('press.x') 를 useTranslation() 만으로도 찾도록 페이지가
  // 로드한 namespace 들을 자동 탐색. wrapper 키가 보존돼 있어 group prefix
  // 가 그대로 유지됨.
  fallbackNS: [
    'gangjeong',
    'album',
    'faqs',
    'press',
    'videos',
    'camp_faq_2026',
    'camp_guidelines_2026',
    'about',
    'gallery',
    'timeline',
    'notFound',
  ],
  use: [stressPostProcessor],
  postProcess: isStressEnabled ? ['stress'] : [],
  serializeConfig: false,
};
