const path = require('path');
const stressPostProcessor = require('./src/i18n/stressPostProcessor');

const isStressEnabled = ['1', 'true'].includes(process.env.NEXT_PUBLIC_I18N_STRESS);

const locales = [
  'ko',
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'ru',
  'ar',
  'ja',
  'zh-Hans',
  'zh-Hant',
  'hi',
  'id',
];

module.exports = {
  i18n: {
    defaultLocale: 'ko',
    locales,
  },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: false,
  fallbackLng: 'ko',
  defaultNS: 'translation',
  ns: ['translation'],
  use: [stressPostProcessor],
  postProcess: isStressEnabled ? ['stress'] : [],
  serializeConfig: false,
};
