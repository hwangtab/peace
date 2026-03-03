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
  ns: ['translation'],
  use: [stressPostProcessor],
  postProcess: isStressEnabled ? ['stress'] : [],
  serializeConfig: false,
};
