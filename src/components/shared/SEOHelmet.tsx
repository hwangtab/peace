import React from 'react';
import { Helmet } from 'react-helmet';

export interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    canonicalUrl?: string;
    structuredData?: object | object[];
}

const SEOHelmet: React.FC<SEOProps> = ({
    title = "강정피스앤뮤직캠프 | 평화를 노래하는 음악가들의 만남",
    description = "강정마을에서 시작되는 평화를 위한 음악 프로젝트. 전세계 분쟁 지역의 평화를 염원하는 음악가들이 함께 노래하는 강정피스앤뮤직캠프입니다.",
    keywords = "강정, 평화, 음악, 캠프, 뮤지션, 평화운동, 음악운동, 강정캠프, 피스앤뮤직, 평화음악, 음악축제",
    ogImage = "https://peaceandmusic.net/og-image.png",
    ogType = "website",
    canonicalUrl,
    structuredData,
}) => {
    const siteUrl = "https://peaceandmusic.net";
    const fullCanonicalUrl = canonicalUrl || window.location.href;

    // Structured Data를 배열로 변환 (단일 객체 또는 배열 모두 지원)
    const structuredDataArray = structuredData
        ? (Array.isArray(structuredData) ? structuredData : [structuredData])
        : [];

    return (
        <Helmet>
            {/* 기본 메타 태그 */}
            <html lang="ko" />
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content="강정피스앤뮤직캠프" />

            {/* Canonical URL */}
            <link rel="canonical" href={fullCanonicalUrl} />

            {/* 로봇 메타 태그 */}
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
            <meta name="rating" content="general" />

            {/* 지역 및 언어 */}
            <meta name="geo.region" content="KR" />
            <meta name="geo.placename" content="South Korea" />
            <meta name="language" content="Korean" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={fullCanonicalUrl} />
            <meta property="og:site_name" content="강정피스앤뮤직캠프" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content="ko_KR" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullCanonicalUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

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
