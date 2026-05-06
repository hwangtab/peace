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
  // gangjeong: Home / Camp 2026 페이지에서만 GangjeongStorySection 이 사용하는 키 그룹.
  //   다른 페이지(/album, /gallery, /press, /videos, /404 등) 의 SSG payload 에서
  //   2.5–4KB 절감 (큰 로케일에서 더 큼). 각 페이지의 getStaticProps 가
  //   serverSideTranslations 호출 시 필요한 namespace 만 명시.
  ns: ['translation', 'gangjeong'],
  use: [stressPostProcessor],
  postProcess: isStressEnabled ? ['stress'] : [],
  serializeConfig: false,
};
