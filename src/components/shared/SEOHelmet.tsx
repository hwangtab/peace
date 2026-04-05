import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { config, getFullUrl } from '@/config/env';
import nextI18NextConfig from '../../../next-i18next.config';

const DEFAULT_LOCALE = nextI18NextConfig.i18n.defaultLocale;
const LOCALES = nextI18NextConfig.i18n.locales;

export interface SEOHelmetProps {
    title?: string;
    description?: string;
    ogImage?: string;
    ogType?: string;
    canonicalUrl?: string;
    structuredData?: object | object[];
}

const OG_LOCALE_MAP: Record<string, string> = {
    ko: 'ko_KR',
    en: 'en_US',
    es: 'es_ES',
    fr: 'fr_FR',
    de: 'de_DE',
    pt: 'pt_BR',
    ru: 'ru_RU',
    ar: 'ar_AR',
    ja: 'ja_JP',
    'zh-Hans': 'zh_CN',
    'zh-Hant': 'zh_TW',
    hi: 'hi_IN',
    id: 'id_ID',
};

const SEOHelmet: React.FC<SEOHelmetProps> = ({
    title,
    description,
    ogImage = getFullUrl(config.ogImage),
    ogType = "website",
    canonicalUrl,
    structuredData,
}) => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const locale = router.locale || i18n.language || DEFAULT_LOCALE;
    const finalTitle = title || t('seo.default.title');
    const finalDescription = description || t('seo.default.description');
    const asPath = (router.asPath || '/').split('?')[0] || '/';
    const pathWithoutLocale = LOCALES.some((loc) => asPath === `/${loc}` || asPath.startsWith(`/${loc}/`))
        ? asPath.replace(new RegExp(`^/(${LOCALES.join('|')})`), '') || '/'
        : asPath;
    const canonicalPath = locale === DEFAULT_LOCALE ? pathWithoutLocale : `/${locale}${pathWithoutLocale}`;
    const fullCanonicalUrl = canonicalUrl || getFullUrl(canonicalPath);

    // Ensure ogImage is a full URL (if it's a relative path, convert it)
    const fullOgImage = ogImage.startsWith('http') ? ogImage : getFullUrl(ogImage);

    // Structured Data를 배열로 변환 (단일 객체 또는 배열 모두 지원)
    const structuredDataArray = structuredData
        ? (Array.isArray(structuredData) ? structuredData : [structuredData])
        : [];

    const ogLocale = OG_LOCALE_MAP[locale] || locale.replace('-', '_');

    const alternateLinks = LOCALES.map((loc) => ({
        locale: loc,
        href: getFullUrl(loc === DEFAULT_LOCALE ? pathWithoutLocale : `/${loc}${pathWithoutLocale}`),
    }));

    return (
        <Head>
            {/* 기본 메타 태그 */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta name="author" content={t('nav.logo')} />

            {/* Canonical URL */}
            <link rel="canonical" href={fullCanonicalUrl} />
            {alternateLinks.map((link) => (
                <link key={link.locale} rel="alternate" hrefLang={link.locale} href={link.href} />
            ))}
            <link rel="alternate" hrefLang="x-default" href={getFullUrl(pathWithoutLocale)} />

            {/* 로봇 메타 태그 */}
            <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            <meta name="rating" content="general" />

            {/* 지역 SEO (강정마을, 제주) */}
            <meta name="geo.region" content="KR-49" />
            <meta name="geo.placename" content="Gangjeong Village, Seogwipo, Jeju" />
            <meta name="geo.position" content="33.2247;126.5664" />
            <meta name="ICBM" content="33.2247, 126.5664" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={fullCanonicalUrl} />
            <meta property="og:site_name" content={t('nav.logo')} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={fullOgImage} />
            <meta property="og:image:secure_url" content={fullOgImage} />
            <meta property="og:image:alt" content={finalDescription} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content={ogLocale} />
            {LOCALES.filter(loc => loc !== locale).map(loc => (
                <meta key={`og-alt-${loc}`} property="og:locale:alternate" content={OG_LOCALE_MAP[loc] || loc.replace('-', '_')} />
            ))}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullCanonicalUrl} />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={fullOgImage} />
            <meta name="twitter:image:alt" content={finalDescription} />

            {/* Structured Data (JSON-LD) */}
            {structuredDataArray.map((data, index) => (
                <script
                    key={`structured-data-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
                />
            ))}
        </Head>
    );
};

export default SEOHelmet;
