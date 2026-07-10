import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import SEOHelmet from '@/components/shared/SEOHelmet';
import StructuredDataScripts from '@/components/shared/StructuredDataScripts';
import SectionWave from '@/components/layout/SectionWave';
import WidgetErrorBoundary from '@/components/common/WidgetErrorBoundary';

const GangjeongStorySection = dynamic(() => import('@/components/camp/GangjeongStorySection'), {
  // HookStatement(min-h-[50vh]) + ImpactNumbers + GangjeongTimeline + CTA 섹션 합산.
  // 실측 기준 데스크탑 ~1400px, 모바일 ~1800px — 1200px 로 보수적 근사해 CLS 완화.
  loading: () => <div className="min-h-[1200px]" />,
});
const GallerySection = dynamic(() => import('@/components/home/GallerySection'), {
  // 홈 프리뷰 16장(4열 4행) + SectionHeader + EventFilter + 링크 + 섹션 패딩.
  // 데스크탑 ~1300px, 모바일 ~1600px — 1000px 로 근사해 CLS 완화.
  loading: () => <div className="min-h-[1000px]" />,
});
import {
  getWebSiteSchema,
  getOrganizationSchema,
  getFAQSchema,
  getWebPageSchema,
  getHowToSchema,
  getMusicGroupSchema,
} from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';
import { GalleryImage } from '@/types/gallery';
import { loadGalleryImages, selectHomeGalleryPreviewImages } from '@/utils/dataLoader';

interface HomePageProps {
  initialGalleryImages?: GalleryImage[];
}

export default function HomePage({ initialGalleryImages }: HomePageProps) {
  const { t, i18n } = useTranslation();
  const structuredData = useMemo(() => {
    const faqItems = t('items', { ns: 'faqs', returnObjects: true, defaultValue: [] }) as unknown;
    const faqs = Array.isArray(faqItems) ? (faqItems as Array<{ q: string; a: string }>) : [];
    return [
      getWebSiteSchema(i18n.language, t),
      getOrganizationSchema(i18n.language, t),
      ...(faqs.length > 0 ? [getFAQSchema(faqs.map((f) => ({ question: f.q, answer: f.a })))] : []),
      getHowToSchema(i18n.language, t),
      getMusicGroupSchema(i18n.language, t),
      getWebPageSchema({
        name: t('seo.default.title'),
        description: t('seo.default.description'),
        url: getFullUrl('/'),
        datePublished: '2024-01-01',
        keywords: [
          '강정피스앤뮤직캠프',
          'Gangjeong Peace Music Camp',
          '평화음악',
          '제주 음악 페스티벌',
          'peace music',
          'Jeju festival',
          '인디 음악',
          'Korean indie music',
          '반전 음악',
          'anti-war music',
          '제주 강정마을',
          'Gangjeong Village',
        ],
      }),
    ];
  }, [i18n.language, t]);

  return (
    <div>
      <SEOHelmet
        title={t('seo.default.title')}
        description={t('seo.default.description')}
        structuredData={structuredData}
        omitStructuredScripts
      />
      <HeroSection imageUrl="/images-webp/camps/2023/DSC00437.webp" />
      <AboutSection />
      <SectionWave color="sky-horizon" />
      <GangjeongStorySection variant="home" />
      <SectionWave color="golden-sun" flow="up" />
      {/* home 의 갤러리는 fold 아래에 위치. priorityFirstImages=false 로
          첫 8개 타일의 preload 링크를 끊어 Hero H1 의 LCP element render delay
          (이전에 ~2.5s) 를 해소. */}
      {/* 갤러리 섹션 격리(D2): 이미지/라이트박스 예외가 홈 전체를 덮지 않도록. */}
      <WidgetErrorBoundary>
        <GallerySection
          initialImages={initialGalleryImages}
          skipClientFetch
          priorityFirstImages={false}
        />
      </WidgetErrorBoundary>
      {/* JSON-LD 는 메인 콘텐츠 뒤로 — preload scanner 와 LCP H1 paint 가
          앞단에서 빨리 처리되도록. SEO 영향 없음. */}
      <StructuredDataScripts data={structuredData} />
    </div>
  );
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';
  const allImages = loadGalleryImages<GalleryImage>();

  return {
    props: {
      ...(await serverSideTranslations(
        resolvedLocale,
        ['translation', 'gangjeong', 'faqs', 'about', 'gallery'],
        nextI18NextConfig
      )),
      initialGalleryImages: selectHomeGalleryPreviewImages(allImages),
    },
    revalidate: 3600,
  };
}
