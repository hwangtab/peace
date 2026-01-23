import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import PageHero from '../components/common/PageHero';
import GallerySection from '../components/home/GallerySection';
import { getImageGallerySchema } from '../utils/structuredData';

const GalleryPage = () => {
    // Basic ImageGallery Schema - real images are loaded dynamically, so providing static fallback or main images
    const gallerySchema = getImageGallerySchema([
        { url: "https://peaceandmusic.net/images-webp/camps/2023/DSC00528.webp", caption: "강정피스앤뮤직캠프 현장" },
        { url: "https://peaceandmusic.net/images-webp/camps/2023/DSC00437.webp", caption: "평화를 노래하는 사람들" }
    ]);

    return (
        <PageLayout
            title="갤러리 | 강정피스앤뮤직캠프"
            description="평화를 노래하는 우리들의 순간들. 강정피스앤뮤직캠프의 생생한 현장 사진을 만나보세요."
            keywords="갤러리, 사진첩, 행사사진, 평화캠프사진, 강정마을"
            background="golden-sun"
            structuredData={gallerySchema}
            disableTopPadding={true}
        >
            <PageHero
                title="갤러리"
                subtitle="그곳에서 만난 평화"
                backgroundImage="/images-webp/camps/2023/DSC00528.webp"
            />
            <div className="pt-12">
                <GallerySection enableSectionWrapper={false} hideSectionHeader={true} />
            </div>
        </PageLayout>
    );
};

export default GalleryPage;
