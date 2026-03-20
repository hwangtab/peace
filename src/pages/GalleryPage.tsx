import React from 'react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/common/PageHero';
import GallerySection from '@/components/home/GallerySection';
import { getImageGallerySchema, getBreadcrumbSchema } from '@/utils/structuredData';
import { getCamps } from '@/data/camps';

import { useTranslation } from 'next-i18next';
// ...

import { GalleryImage } from '@/types/gallery';

interface GalleryPageProps {
    initialImages?: GalleryImage[];
}

const GalleryPage = ({ initialImages = [] }: GalleryPageProps) => {
    const { t, i18n } = useTranslation();
    const camp2026 = getCamps(i18n.language).find(c => c.id === 'camp-2026');
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
            ogImage="/images-webp/camps/2023/DSC00528.webp"
            background="golden-sun"
            structuredData={[
                gallerySchema,
                getBreadcrumbSchema([
                    { name: t('nav.home'), url: "https://peaceandmusic.net/" },
                    { name: t('gallery.page_title'), url: "https://peaceandmusic.net/gallery" }
                ])
            ]}
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

            {/* Camp 2026 CTA */}
            {camp2026?.fundingUrl && (
                <div className="bg-jeju-ocean py-10">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-white text-lg font-medium mb-4 break-words">{t('camp.title_2026')}</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/camps/2026"
                                className="inline-flex items-center px-5 py-2.5 bg-white/15 text-white font-medium rounded-full text-sm border border-white/30 hover:bg-white/25 transition-colors"
                            >
                                {t('camp.view_detail')}
                            </Link>
                            <a
                                href={`${camp2026.fundingUrl}?utm_source=website&utm_medium=cta&utm_campaign=gpmc3&utm_content=gallery`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-5 py-2.5 bg-golden-sun text-gray-900 font-bold rounded-full text-sm hover:bg-yellow-400 transition-colors"
                            >
                                {t('camp.ticketing_2026')}
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default GalleryPage;
