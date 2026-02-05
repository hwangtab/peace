import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import nextI18NextConfig from '../../../next-i18next.config';

const LOCALES = nextI18NextConfig.i18n.locales;

interface LanguageSwitcherProps {
    className?: string;
    isScrolled?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '', isScrolled = false }) => {
    const { t, i18n } = useTranslation();
    const router = useRouter();

    const languageLabels = t('languages', { returnObjects: true }) as Record<string, string>;

    const currentLocale = router.locale || i18n.language || 'ko';

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLang = event.target.value;
        i18n.changeLanguage(nextLang);
        router.push(router.asPath, router.asPath, { locale: nextLang });
    };

    return (
        <div className={`relative ${className}`}>
            <label className="sr-only" htmlFor="language-switcher">
                {t('nav.switch_language')}
            </label>
            <select
                id="language-switcher"
                value={currentLocale}
                onChange={handleChange}
                className={`font-serif text-xs sm:text-sm px-2 py-1 border rounded transition-all duration-300 bg-transparent ${isScrolled
                    ? 'border-jeju-ocean text-jeju-ocean hover:bg-jeju-ocean hover:text-white'
                    : 'border-cloud-white text-cloud-white hover:bg-cloud-white hover:text-jeju-ocean'
                    }`}
                aria-label={t('nav.switch_language')}
            >
                {LOCALES.map((locale) => (
                    <option key={locale} value={locale} className="text-deep-ocean">
                        {languageLabels[locale] || locale}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSwitcher;
