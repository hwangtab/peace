import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { config, getFullUrl } from '@/config/env';
import nextI18NextConfig from '../../../next-i18next.config';
import { escapeJsonLd } from '@/utils/escapeJsonLd';
import { toOgImage } from '@/utils/ogImage';

const DEFAULT_LOCALE = nextI18NextConfig.i18n.defaultLocale;
const LOCALES = nextI18NextConfig.i18n.locales;

export interface SEOHelmetProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogImageAlt?: string;
  /**
   * og:image 의 실제 픽셀 크기. 기본 OG(1200×630 제작본)는 자동으로 채워지지만,
   * 동적 이미지(뮤지션 프로필·YouTube 썸네일·포스터 등)는 비율이 제각각이라
   * 잘못된 크기를 박으면 SNS 미리보기가 크롭/왜곡된다. 정확한 크기를 아는
   * 호출처만 명시하고, 모르면 생략한다(메타 자체를 출력하지 않음).
   */
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogType?: string;
  ogAudio?: string;
  ogMusicAlbum?: string;
  ogMusicMusician?: string;
  canonicalUrl?: string;
  structuredData?: object | object[];
  noIndex?: boolean;
  datePublished?: string;
  dateModified?: string;
  /**
   * true 시 JSON-LD 스크립트는 렌더하지 않음 (PageLayout 이 본문 끝에서
   * StructuredDataScripts 로 별도 렌더할 때 사용).
   */
  omitStructuredScripts?: boolean;
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

// hreflang 값 오버라이드: 스크립트 서브태그(zh-Hans/zh-Hant)는 일부 크롤러가
// 인식하지 못하므로 BCP47 지역 코드(zh-CN/zh-TW)로 노출한다. URL 경로는 그대로다.
const HREFLANG_OVERRIDE: Record<string, string> = {
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
};

const SEOHelmet: React.FC<SEOHelmetProps> = ({
  title,
  description,
  ogImage,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
  ogType = 'website',
  ogAudio,
  ogMusicAlbum,
  ogMusicMusician,
  canonicalUrl,
  structuredData,
  noIndex = false,
  datePublished,
  dateModified,
  omitStructuredScripts = false,
}) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const locale = router.locale || i18n.language || DEFAULT_LOCALE;
  const finalTitle = title || t('seo.default.title');
  const finalDescription = description || t('seo.default.description');
  const asPath = (router.asPath || '/').split('?')[0] || '/';
  const pathWithoutLocale = LOCALES.some(
    (loc) => asPath === `/${loc}` || asPath.startsWith(`/${loc}/`)
  )
    ? asPath.replace(new RegExp(`^/(${LOCALES.join('|')})`), '') || '/'
    : asPath;
  const canonicalPath =
    locale === DEFAULT_LOCALE ? pathWithoutLocale : `/${locale}${pathWithoutLocale}`;
  const fullCanonicalUrl = canonicalUrl || getFullUrl(canonicalPath);

  // webp/avif og:image 를 카카오톡·페이스북 호환 jpg 로 정규화(파생본 없으면
  // 기본 OG 로 폴백)한 뒤 절대 URL 로 변환한다. config.ogImage 는 상대 경로이므로
  // toOgImage 를 그대로 통과한다(getFullUrl 은 마지막에 적용).
  const resolvedOgImage = toOgImage(ogImage ?? config.ogImage);
  const fullOgImage = resolvedOgImage.startsWith('http')
    ? resolvedOgImage
    : getFullUrl(resolvedOgImage);

  // generate-og-images.mjs 가 만드는 OG 산출물(/images/og/ 하위 — 제작본·_derived
  // 파생본·폴백 모두)은 전부 1200×630 으로 cover-resize 된다. 이 경우에만 크기 메타를
  // 자동으로 채우고, 외부 URL(YouTube 썸네일 480×360 등)·비표준 비율 이미지는
  // 잘못된 크기로 SNS 미리보기가 크롭/왜곡되지 않도록 호출처가 명시할 때만 출력한다.
  const isStandardOg = resolvedOgImage.startsWith('/images/og/');
  const finalOgImageWidth = ogImageWidth ?? (isStandardOg ? 1200 : undefined);
  const finalOgImageHeight = ogImageHeight ?? (isStandardOg ? 630 : undefined);

  // Derive MIME type from image extension
  const ogImageExt = fullOgImage.split('.').pop()?.toLowerCase() ?? '';
  const ogImageType =
    ogImageExt === 'webp'
      ? 'image/webp'
      : ogImageExt === 'avif'
        ? 'image/avif'
        : ogImageExt === 'png'
          ? 'image/png'
          : ogImageExt === 'gif'
            ? 'image/gif'
            : 'image/jpeg';

  // Use dedicated alt text if provided, otherwise use title for concise alt
  const finalOgImageAlt = ogImageAlt || finalTitle;

  // Structured Data를 배열로 변환 (단일 객체 또는 배열 모두 지원)
  const structuredDataArray = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  const structuredScripts = (
    <>
      {structuredDataArray.map((data, index) => {
        const json = escapeJsonLd(JSON.stringify(data));
        return (
          <script
            key={`structured-data-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: json }}
          />
        );
      })}
    </>
  );

  const ogLocale = OG_LOCALE_MAP[locale] || locale.replace('-', '_');

  const alternateLinks = LOCALES.map((loc) => ({
    locale: loc,
    hrefLang: HREFLANG_OVERRIDE[loc] ?? loc,
    href: getFullUrl(loc === DEFAULT_LOCALE ? pathWithoutLocale : `/${loc}${pathWithoutLocale}`),
  }));

  return (
    <>
      <Head>
        {/* 기본 메타 태그 */}
        <title>{finalTitle}</title>
        <meta name="description" content={finalDescription} />
        <meta name="author" content={t('nav.logo')} />

        {/* Canonical URL */}
        <link rel="canonical" href={fullCanonicalUrl} />
        {alternateLinks.map((link) => (
          <link key={link.locale} rel="alternate" hrefLang={link.hrefLang} href={link.href} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={getFullUrl(pathWithoutLocale)} />

        {/* 로봇 메타 태그 */}
        <meta
          name="robots"
          content={
            noIndex
              ? 'noindex, nofollow'
              : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
          }
        />
        <meta
          name="googlebot"
          content={
            noIndex
              ? 'noindex, nofollow'
              : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
          }
        />
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
        <meta property="og:image:type" content={ogImageType} />
        <meta property="og:image:alt" content={finalOgImageAlt} />
        {finalOgImageWidth && finalOgImageHeight && (
          <>
            <meta property="og:image:width" content={String(finalOgImageWidth)} />
            <meta property="og:image:height" content={String(finalOgImageHeight)} />
          </>
        )}
        <meta property="og:locale" content={ogLocale} />
        {LOCALES.filter((loc) => loc !== locale).map((loc) => (
          <meta
            key={`og-alt-${loc}`}
            property="og:locale:alternate"
            content={OG_LOCALE_MAP[loc] || loc.replace('-', '_')}
          />
        ))}
        {ogAudio && (
          <>
            <meta property="og:audio" content={ogAudio} />
            <meta property="og:audio:secure_url" content={ogAudio} />
            <meta property="og:audio:type" content="audio/mpeg" />
          </>
        )}
        {ogMusicAlbum && <meta property="music:album" content={ogMusicAlbum} />}
        {ogMusicMusician && <meta property="music:musician" content={ogMusicMusician} />}
        {(ogType === 'article' || ogType === 'news') && (
          <meta property="article:author" content={t('nav.logo')} />
        )}
        {(ogType === 'article' || ogType === 'news') && datePublished && (
          <meta property="article:published_time" content={datePublished} />
        )}
        {(ogType === 'article' || ogType === 'news') && dateModified && (
          <meta property="article:modified_time" content={dateModified} />
        )}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={fullCanonicalUrl} />
        <meta name="twitter:title" content={finalTitle} />
        <meta name="twitter:description" content={finalDescription} />
        <meta name="twitter:image" content={fullOgImage} />
        <meta name="twitter:image:alt" content={finalOgImageAlt} />
      </Head>
      {/*
          omitStructuredScripts=true 면 PageLayout 이 본문 끝에서 별도 렌더하므로
          여기선 생략. 호환을 위해 기본값은 false (pages/index.tsx 같이 직접
          호출하는 곳에서 기존 동작 유지).
        */}
      {!omitStructuredScripts && structuredDataArray.length > 0 && structuredScripts}
    </>
  );
};

/**
 * Wrap in `React.memo` so that when a parent page re-renders but its
 * SEO props are stable (e.g. locale unchanged), we skip the costly
 * JSON.stringify for every JSON-LD node. The memo relies on callers
 * passing a stable `structuredData` reference (use `useMemo` in the page).
 */
export default React.memo(SEOHelmet);
