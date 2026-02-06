import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import PageHero from '../components/common/PageHero';
import GallerySection from '../components/home/GallerySection';
import { getImageGallerySchema } from '../utils/structuredData';

import { useTranslation } from 'next-i18next';
// ...

import { GalleryImage } from '../types/gallery';

interface GalleryPageProps {
    initialImages?: GalleryImage[];
}

const GalleryPage = ({ initialImages = [] }: GalleryPageProps) => {
    const { t, i18n } = useTranslation();
    // Basic ImageGallery Schema - real images are loaded dynamically, so providing static fallback or main images
    const gallerySchema = getImageGallerySchema([
        { url: "https://peaceandmusic.net/images-webp/camps/2023/DSC00528.webp", caption: t('gallery.hero_subtitle') },
        { url: "https://peaceandmusic.net/images-webp/camps/2023/DSC00437.webp", caption: t('gallery.page_desc') }
    ], i18n.language);

    return (
        <PageLayout
            title={t('gallery.page_title')}
            description={t('gallery.page_desc')}
            keywords={t('gallery.keywords')}
            background="golden-sun"
            structuredData={gallerySchema}
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
                />
            </div>
        </PageLayout>
    );
};

export default GalleryPage;
