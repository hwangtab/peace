import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
    className?: string;
    isScrolled?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '', isScrolled = false }) => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const currentLang = i18n.language;
        const nextLang = currentLang.startsWith('ko') ? 'en' : 'ko';
        i18n.changeLanguage(nextLang);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('lang', nextLang);
            window.history.replaceState(null, '', url.toString());
        }
    };

    const isKo = i18n.language.startsWith('ko');

    return (
        <button
            onClick={toggleLanguage}
            className={`font-serif text-sm px-2 py-1 border rounded transition-all duration-300 ${className} ${isScrolled
                ? 'border-jeju-ocean text-jeju-ocean hover:bg-jeju-ocean hover:text-white'
                : 'border-cloud-white text-cloud-white hover:bg-cloud-white hover:text-jeju-ocean'
                }`}
            aria-label={isKo ? t('nav.switch_en') : t('nav.switch_ko')}
        >
            {isKo ? 'EN' : 'KO'}
        </button>
    );
};

export default LanguageSwitcher;
