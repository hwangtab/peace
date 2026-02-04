import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { config, getFullUrl } from '../../config/env';

export interface SEOHelmetProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    canonicalUrl?: string;
    structuredData?: object | object[];
}

const SEOHelmet: React.FC<SEOHelmetProps> = ({
    title,
    description,
    keywords,
    ogImage = getFullUrl(config.ogImage),
    ogType = "website",
    canonicalUrl,
    structuredData,
}) => {
    const { t, i18n } = useTranslation();
    const finalTitle = title || t('seo.default.title');
    const finalDescription = description || t('seo.default.description');
    const finalKeywords = keywords || t('seo.default.keywords');
    const fullCanonicalUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : config.siteUrl);

    // Ensure ogImage is a full URL (if it's a relative path, convert it)
    const fullOgImage = ogImage.startsWith('http') ? ogImage : getFullUrl(ogImage);

    // Structured Data를 배열로 변환 (단일 객체 또는 배열 모두 지원)
    const structuredDataArray = structuredData
        ? (Array.isArray(structuredData) ? structuredData : [structuredData])
        : [];

    return (
        <Helmet>
            {/* 기본 메타 태그 */}
            <html lang={i18n.language} />
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta name="keywords" content={finalKeywords} />
            <meta name="author" content={t('nav.logo')} />

            {/* Canonical URL */}
            <link rel="canonical" href={fullCanonicalUrl} />

            {/* 로봇 메타 태그 */}
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
            <meta name="rating" content="general" />

            {/* 지역 및 언어 */}
            <meta name="geo.region" content={i18n.language === 'ko' ? 'KR' : 'US'} />
            <meta name="geo.placename" content={i18n.language === 'ko' ? 'South Korea' : 'USA'} />
            <meta name="language" content={i18n.language === 'ko' ? 'Korean' : 'English'} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={fullCanonicalUrl} />
            <meta property="og:site_name" content={t('nav.logo')} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={fullOgImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content={i18n.language === 'ko' ? 'ko_KR' : 'en_US'} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullCanonicalUrl} />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={fullOgImage} />

            {/* Structured Data (JSON-LD) */}
            {structuredDataArray.map((data, index) => (
                <script key={`structured-data-${index}`} type="application/ld+json">
                    {JSON.stringify(data)}
                </script>
            ))}
        </Helmet>
    );
};

export default SEOHelmet;
