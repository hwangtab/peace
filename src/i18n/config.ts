import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { LOCALES, DEFAULT_LOCALE } from './locales';

/**
 * public/locales/${locale}/translation.json 파일을 동적으로 로드합니다.
 * 이함수는 클라이언트 사이드에서 초기화 시 사용됩니다.
 */
const loadLocaleResources = async (locale: string) => {
    try {
        // public 폴더는 루트 기준이므로 브라우저에서는 /locales/... 로 접근 가능하지만,
        // 빌드 타임 혹은 초기화 시점의 import를 위해 상대 경로 사용
        const translation = await import(`../../public/locales/${locale}/translation.json`);
        return translation.default;
    } catch (error) {
        console.error(`Failed to load locale ${locale}:`, error);
        return {};
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: DEFAULT_LOCALE,
        supportedLngs: LOCALES,
        defaultNS: 'translation',
        ns: ['translation'],
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
        // 초기 리소스는 비워두고 addResourceBundle로 채움
        resources: {},
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator'],
            lookupQuerystring: 'lang',
            lookupCookie: 'NEXT_LOCALE',
            caches: ['cookie', 'localStorage'],
        },
    });

// 지원하는 모든 언어 리소스를 즉시 로드하여 등록
if (typeof window !== 'undefined') {
    (async () => {
        for (const locale of LOCALES) {
            const resources = await loadLocaleResources(locale);
            i18n.addResourceBundle(locale, 'translation', resources, true, true);
        }
    })();
}

export default i18n;
