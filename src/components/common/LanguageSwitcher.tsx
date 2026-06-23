import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import nextI18NextConfig from '../../../next-i18next.config';

const LOCALES = nextI18NextConfig.i18n.locales;

// 언어 이름은 항상 해당 언어의 자기언어명(endonym)으로 표시
const NATIVE_LANGUAGE_NAMES: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ar: 'العربية',
  hi: 'हिन्दी',
  id: 'Bahasa Indonesia',
  pt: 'Português',
  ru: 'Русский',
};

interface LanguageSwitcherProps {
  className?: string;
  isScrolled?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  isScrolled = false,
}) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  // 색·테두리는 보이는 라벨(span)에 적용한다. 상호작용은 위에 겹친 투명 select가 받으므로
  // hover/focus는 group 기준으로 전파한다.
  const labelClasses = isScrolled
    ? 'text-jeju-ocean border-jeju-ocean group-hover:bg-jeju-ocean group-hover:text-white group-focus-within:ring-2 group-focus-within:ring-offset-2 group-focus-within:ring-jeju-ocean'
    : 'text-cloud-white border-cloud-white group-hover:bg-cloud-white group-hover:text-jeju-ocean group-focus-within:ring-2 group-focus-within:ring-offset-2 group-focus-within:ring-jeju-ocean';

  const currentLocale = router.locale || i18n.language || 'ko';

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLang = event.target.value;
    document.cookie = `NEXT_LOCALE=${nextLang}; path=/; max-age=31536000; samesite=lax`;
    router.push(router.asPath, router.asPath, { locale: nextLang });
  };

  return (
    <div className={`relative inline-flex shrink-0 group ${className}`}>
      <label className="sr-only" htmlFor="language-switcher">
        {t('nav.switch_language')}
      </label>
      {/* 보이는 라벨: 현재 언어에 딱 맞게 너비를 잡아 인증 버튼과 균형을 맞춘다 */}
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-flex items-center gap-1.5 whitespace-nowrap font-serif font-bold text-xs sm:text-sm px-3 py-2 rounded border transition-colors duration-300 bg-transparent ${labelClasses}`}
      >
        {NATIVE_LANGUAGE_NAMES[currentLocale] || currentLocale}
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
      {/* 투명 네이티브 select: 위에 겹쳐 클릭/키보드 상호작용만 담당 */}
      <select
        id="language-switcher"
        value={currentLocale}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus:outline-none"
        aria-label={t('nav.switch_language')}
      >
        {LOCALES.map((locale) => (
          <option key={locale} value={locale} className="text-deep-ocean">
            {NATIVE_LANGUAGE_NAMES[locale] || locale}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
