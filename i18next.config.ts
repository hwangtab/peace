import { defineConfig } from 'i18next-cli';

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

export default defineConfig({
  locales,
  extract: {
    input: [
      'src/**/*.{ts,tsx}',
      'pages/**/*.{ts,tsx}',
      '!src/**/*.test.{ts,tsx}',
      '!pages/**/*.test.{ts,tsx}',
    ],
    output: process.env.I18NEXT_OUTPUT ?? 'public/locales/{{language}}/{{namespace}}.json',
    defaultNS: 'translation',
    keySeparator: '.',
    nsSeparator: ':',
    functions: ['t', '*.t', 'i18next.t'],
    transComponents: ['Trans'],
    useTranslationNames: ['useTranslation', 'withTranslation'],
    removeUnusedKeys: false,
    sort: true,
    indentation: 4,
    defaultValue: (key) => key,
    primaryLanguage: 'ko',
    secondaryLanguages: locales.filter((locale) => locale !== 'ko'),
  },
  types: {
    input: ['public/locales/ko/*.json'],
    output: 'src/types/i18next.d.ts',
  },
});
