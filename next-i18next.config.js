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
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'translation',
  // 페이지 단위 SSG payload 절감을 위한 namespace 분리. 각 namespace 는 그것을
  // 사용하는 페이지의 getStaticProps 에서만 serverSideTranslations 에 명시.
  // - gangjeong : home / camps/2026 (GangjeongStorySection)
  // - album     : /album/about, /album/musicians, /album/tracks, /album/tracks/[id],
  //               /album/musicians/[id]
  ns: ['translation', 'gangjeong', 'album'],
  use: [stressPostProcessor],
  postProcess: isStressEnabled ? ['stress'] : [],
  serializeConfig: false,
};
