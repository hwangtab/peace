import React, { useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { m as motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/layout/Section';
import Container from '@/components/layout/Container';
import Button from '@/components/common/Button';
import GalleryImageItem from '@/components/gallery/GalleryImageItem';
import ImageLightbox, { LightboxImage } from '@/components/common/ImageLightbox';
import { GalleryImage } from '@/types/gallery';
import { photographerNameKey, findPhotographer } from '@/data/photographers';
import {
  getImageGallerySchema,
  getBreadcrumbSchema,
  getWebPageSchema,
} from '@/utils/structuredData';
import { getFullUrl } from '@/config/env';

interface PhotographerPageProps {
  slug: string;
  images: GalleryImage[];
}

const FALLBACK_HERO = '/images-webp/camps/2026/kdh-DSC08498.webp';

const PhotographerPage: React.FC<PhotographerPageProps> = ({ slug, images }) => {
  const { t, i18n } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const name = t(photographerNameKey(slug));
  const bio = t(`gallery.photographers.${slug}.bio`);
  const credit = t('gallery.photo_credit', { name });
  const profileImage = findPhotographer(slug)?.image;
  const heroImage = profileImage || images[0]?.url || FALLBACK_HERO;

  const breadcrumbs = useMemo(
    () => [
      { name: t('nav.home'), url: getFullUrl('/') },
      { name: t('gallery.page_title'), url: getFullUrl('/gallery') },
      { name, url: getFullUrl(`/photographers/${slug}`) },
    ],
    [t, name, slug]
  );

  const structuredData = useMemo(() => {
    const schemaImages = images.slice(0, 20).map((img) => ({
      url: getFullUrl(img.url),
      caption: credit,
    }));
    return [
      getImageGallerySchema(schemaImages, i18n.language, t, images.length),
      getBreadcrumbSchema(breadcrumbs),
      getWebPageSchema({
        name: t('gallery.photographer_page_title', { name }),
        description: bio,
        url: getFullUrl(`/photographers/${slug}`),
      }),
    ];
  }, [images, credit, i18n.language, t, breadcrumbs, name, bio, slug]);

  return (
    <PageLayout
      title={t('gallery.photographer_page_title', { name })}
      description={bio}
      ogImage={heroImage}
      ogImageAlt={name}
      background="golden-sun"
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      disableTopPadding={true}
      disableBottomPadding={true}
    >
      <PageHero
        title={name}
        subtitle={t('gallery.photographers_heading')}
        backgroundImage={heroImage}
      />

      <Section background="white" paddingTop="normal" paddingBottom="tight">
        <Container size="content">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-jeju-ocean font-bold mb-3">
              {t('gallery.photographers_heading')}
            </p>
            <h2 className="typo-h3 text-deep-ocean mb-4">{name}</h2>
            <p className="typo-body text-coastal-gray whitespace-pre-line break-words max-w-2xl">
              {bio}
            </p>
          </motion.div>
        </Container>
      </Section>

      <Section background="white" paddingTop="tight" paddingBottom="loose">
        <Container size="wide">
          {images.length === 0 ? (
            <p className="text-center text-coastal-gray py-16">{t('gallery.no_images')}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image, idx) => (
                <div
                  key={image.url}
                  className="aspect-square relative bg-ocean-sand rounded-lg overflow-hidden"
                >
                  <GalleryImageItem
                    image={image}
                    priority={idx < 8}
                    onClick={(_img) => setSelectedIndex(idx)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button to={`/gallery?filter=camp-${images[0]?.eventYear ?? 2026}`} variant="outline">
              {t('gallery.photographer_back')}
            </Button>
          </div>
        </Container>
      </Section>

      <ImageLightbox
        show={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        maxHeight="85vh"
        images={images.map(
          (img): LightboxImage => ({
            src: img.url,
            alt: img.description || credit,
            credit,
          })
        )}
        index={selectedIndex ?? 0}
        onIndexChange={setSelectedIndex}
      />
    </PageLayout>
  );
};

export default PhotographerPage;
