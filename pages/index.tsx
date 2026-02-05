import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import HeroSection from '../src/components/home/HeroSection';
import AboutSection from '../src/components/home/AboutSection';
import TimelineSection from '../src/components/home/TimelineSection';
import GallerySection from '../src/components/home/GallerySection';
import SEOHelmet from '../src/components/shared/SEOHelmet';
import WaveDivider from '../src/components/common/WaveDivider';
import { getWebSiteSchema, getOrganizationSchema, getFAQSchema } from '../src/utils/structuredData';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const faqItems = t('faqs.items', { returnObjects: true, defaultValue: [] }) as unknown;
  const faqs = Array.isArray(faqItems) ? (faqItems as Array<{ q: string; a: string }>) : [];
  const structuredData = [
    getWebSiteSchema(i18n.language),
    getOrganizationSchema(i18n.language),
    getFAQSchema(faqs.map(f => ({ question: f.q, answer: f.a })))
  ];

  return (
    <div>
      <SEOHelmet
        title={t('seo.default.title')}
        description={t('seo.default.description')}
        keywords={t('seo.default.keywords')}
        structuredData={structuredData}
      />
      <HeroSection imageUrl="/images-webp/camps/2023/DSC00437.webp" />
      <AboutSection />
      <WaveDivider className="text-sunlight-glow -mt-[60px] sm:-mt-[100px] relative z-10" />
      <TimelineSection />
      <WaveDivider className="text-golden-sun -mt-[60px] sm:-mt-[100px] relative z-10" />
      <GallerySection />
    </div>
  );
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ko', ['translation'], nextI18NextConfig)),
    },
  };
}
