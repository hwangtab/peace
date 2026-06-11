const translationFunctions = ['t', 'i18next.t'];
const namespaceFunctions = ['useTranslation', 'withTranslation'];

module.exports = {
  // 지원하는 언어 목록
  locales: ['ko', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'ja', 'zh-Hans', 'zh-Hant', 'hi', 'id'],

  // 번역 파일 출력 경로
  output: 'public/locales/$LOCALE/$NAMESPACE.json',

  // 소스 파일 경로
  input: [
    'src/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!pages/**/*.test.{ts,tsx}',
  ],

  // 기본 네임스페이스
  defaultNamespace: 'translation',

  // 네임스페이스 목록
  namespaces: [
    'translation',
    'gangjeong',
    'album',
    'faqs',
    'press',
    'videos',
    'camp_faq_2026',
    'camp_guidelines_2026',
    'camp_promote_2026',
    'camp_staff_2026',
    'about',
    'gallery',
    'timeline',
    'notFound',
  ],

  // 번역 키 추출 함수 이름
  lexers: {
    js: [
      {
        lexer: 'JavascriptLexer',
        functions: translationFunctions,
        namespaceFunctions,
      },
    ],
    jsx: [
      {
        lexer: 'JsxLexer',
        functions: translationFunctions,
        namespaceFunctions,
        componentFunctions: ['Trans'],
      },
    ],
    ts: [
      {
        lexer: 'JavascriptLexer',
        functions: translationFunctions,
        namespaceFunctions,
        parseGenerics: true,
      },
    ],
    tsx: [
      {
        lexer: 'JsxLexer',
        functions: translationFunctions,
        namespaceFunctions,
        componentFunctions: ['Trans'],
        parseGenerics: true,
      },
    ],
  },

  // 기존 번역 유지
  keepRemoved: false,

  // 정렬
  sort: true,

  // 들여쓰기
  indentation: 4,

  // 줄바꿈
  lineEnding: 'auto',

  // 기본값 설정
  defaultValue: (locale, namespace, key) => {
    return key;
  },

  // 번역 키 접두사/접미사 제거
  keySeparator: '.',
  namespaceSeparator: ':',
  nsSeparator: ':',
};
