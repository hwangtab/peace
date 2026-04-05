import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../next-i18next.config';
import { GetStaticPropsContext } from 'next';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import SEOHelmet from '@/components/shared/SEOHelmet';
import WaveDivider from '@/components/common/WaveDivider';

const GangjeongStorySection = dynamic(() => import('@/components/camp/GangjeongStorySection'), {
  ssr: false,
  loading: () => <div className="h-96" />,
});
const GallerySection = dynamic(() => import('@/components/home/GallerySection'));
import { getWebSiteSchema, getOrganizationSchema, getFAQSchema, getWebPageSchema } from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';
import { GalleryImage } from '@/types/gallery';
import { loadGalleryImages } from '@/utils/dataLoader';

interface HomePageProps {
  initialGalleryImages?: GalleryImage[];
}

export default function HomePage({ initialGalleryImages }: HomePageProps) {
  const { t, i18n } = useTranslation();
  const faqItems = t('faqs.items', { returnObjects: true, defaultValue: [] }) as unknown;
  const faqs = Array.isArray(faqItems) ? (faqItems as Array<{ q: string; a: string }>) : [];
  const structuredData = [
    getWebSiteSchema(i18n.language, t),
    getOrganizationSchema(i18n.language, t),
    getFAQSchema(faqs.map(f => ({ question: f.q, answer: f.a }))),
    getWebPageSchema({
      name: t('seo.default.title'),
      description: t('seo.default.description'),
      url: getFullUrl('/'),
    }),
  ];

  return (
    <div>
      <SEOHelmet
        title={t('seo.default.title')}
        description={t('seo.default.description')}
        structuredData={structuredData}
      />
      <HeroSection imageUrl="/images-webp/camps/2023/DSC00437.webp" />
      <AboutSection />
      <WaveDivider className="text-sky-horizon -mb-[60px] sm:-mb-[100px] relative z-10" direction="down" />
      <GangjeongStorySection variant="home" />
      <WaveDivider className="text-golden-sun -mt-[60px] sm:-mt-[100px] relative z-10" />
      <GallerySection initialImages={initialGalleryImages} skipClientFetch />
    </div>
  );
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const resolvedLocale = locale ?? 'ko';
  const allImages = loadGalleryImages<GalleryImage>();

  return {
    props: {
      ...(await serverSideTranslations(resolvedLocale, ['translation'], nextI18NextConfig)),
      initialGalleryImages: allImages.slice(0, 24),
    },
    revalidate: 3600,
  };
}
