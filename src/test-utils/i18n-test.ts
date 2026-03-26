import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 테스트용 번역 데이터
const resources = {
    ko: {
        translation: {
            app: {
                title: '강정피스앤뮤직캠프',
            },
            nav: {
                home: '홈',
                camp: '캠프',
                camp_2023: '2023 캠프',
                camp_2025: '2025 캠프',
                camp_2026: '2026 캠프',
                album: '앨범',
                album_about: '앨범 소개',
                musician: '뮤지션',
                track: '수록곡',
                gallery: '갤러리',
                video: '비디오',
                press: '언론보도',
            },
            common: {
                loading: '로딩 중...',
                close: '닫기',
            },
        },
    },
    en: {
        translation: {
            app: {
                title: 'Gangjeong Peace Music Camp',
            },
            nav: {
                home: 'Home',
                camp: 'Camp',
                camp_2023: 'Camp 2023',
                camp_2025: 'Camp 2025',
                camp_2026: 'Camp 2026',
                album: 'Album',
                album_about: 'About Album',
                musician: 'Musicians',
                track: 'Tracks',
                gallery: 'Gallery',
                video: 'Videos',
                press: 'Press',
            },
            common: {
                loading: 'Loading...',
                close: 'Close',
            },
        },
    },
};

// 테스트용 i18n 인스턴스 생성
i18n.use(initReactI18next).init({
    resources,
    lng: 'ko',
    fallbackLng: 'ko',
    interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: false,
    },
});

export default i18n;
