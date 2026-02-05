const path = require('path');

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
};
