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
    const toneClasses = isScrolled ? 'text-jeju-ocean' : 'text-cloud-white';
    const borderClasses = isScrolled
        ? 'border-jeju-ocean hover:bg-jeju-ocean hover:text-white'
        : 'border-cloud-white hover:bg-cloud-white hover:text-jeju-ocean';
    const arrowClasses = isScrolled
        ? 'text-jeju-ocean group-hover:text-white'
        : 'text-cloud-white group-hover:text-jeju-ocean';

    const currentLocale = router.locale || i18n.language || 'ko';

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLang = event.target.value;
        i18n.changeLanguage(nextLang);
        router.push(router.asPath, router.asPath, { locale: nextLang });
    };

    return (
        <div className={`relative group ${className}`}>
            <label className="sr-only" htmlFor="language-switcher">
                {t('nav.switch_language')}
            </label>
            <select
                id="language-switcher"
                value={currentLocale}
                onChange={handleChange}
                className={`font-serif text-xs sm:text-sm px-2 py-1 pr-8 border rounded transition-all duration-300 bg-transparent appearance-none ${toneClasses} ${borderClasses}`}
                aria-label={t('nav.switch_language')}
            >
                {LOCALES.map((locale) => (
                    <option key={locale} value={locale} className="text-deep-ocean">
                        {languageLabels[locale] || locale}
                    </option>
                ))}
            </select>
            <span
                className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${arrowClasses}`}
                aria-hidden="true"
            >
                <svg
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M6 8l4 4 4-4" />
                </svg>
            </span>
        </div>
    );
};

export default LanguageSwitcher;
