import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Button from '@/components/common/Button';
import PageHero from '@/components/common/PageHero';
import GallerySection from '@/components/home/GallerySection';
import { getImageGallerySchema, getBreadcrumbSchema } from '@/utils/structuredData';
import { getCamps } from '@/data/camps';
import { getFullUrl } from '@/config/env';

import { useTranslation } from 'next-i18next';
// ...

import { GalleryImage } from '@/types/gallery';

interface GalleryPageProps {
  initialImages?: GalleryImage[];
}

const GalleryPage = ({ initialImages = [] }: GalleryPageProps) => {
  const { t, i18n } = useTranslation();
  const camp2026 = getCamps(i18n.language, t).find((c) => c.id === 'camp-2026');
  const schemaImages = initialImages.slice(0, 20).map((img) => ({
    url: getFullUrl(img.url),
    caption: t('gallery.hero_subtitle'),
  }));
  if (schemaImages.length === 0) {
    schemaImages.push(
      { url: getFullUrl('/images-webp/camps/2023/DSC00528.webp'), caption: t('gallery.hero_subtitle') },
      { url: getFullUrl('/images-webp/camps/2023/DSC00437.webp'), caption: t('gallery.page_desc') }
    );
  }
  const gallerySchema = getImageGallerySchema(schemaImages, i18n.language, t);
  const breadcrumbs = [
    { name: t('nav.home'), url: getFullUrl('/') },
    { name: t('gallery.page_title'), url: getFullUrl('/gallery') },
  ];

  return (
    <PageLayout
      title={t('gallery.page_title')}
      description={t('gallery.page_desc')}
      ogImage="/images-webp/camps/2023/DSC00528.webp"
      background="golden-sun"
      structuredData={[gallerySchema, getBreadcrumbSchema(breadcrumbs)]}
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
    >
      <PageHero
        title={t('gallery.hero_title')}
        subtitle={t('gallery.hero_subtitle')}
        backgroundImage="/images-webp/camps/2023/DSC00528.webp"
      />
      <div className="pt-12">
        <GallerySection
          enableSectionWrapper={false}
          hideSectionHeader={true}
          initialImages={initialImages}
          skipClientFetch={true}
        />
      </div>

      {/* Camp 2026 CTA */}
      {camp2026?.fundingUrl && (
        <div className="bg-jeju-ocean py-10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-white text-lg font-medium mb-4 break-words">
              {t('camp.title_2026')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button to="/camps/2026" variant="ghost-white" size="sm">
                {t('camp.view_detail')}
              </Button>
              <Button
                href={camp2026.fundingUrl}
                variant="gold"
                size="sm"
                external
                utmContent="gallery"
              >
                {t('camp.ticketing_2026')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default GalleryPage;
