import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import PageHero from '../components/common/PageHero';
import GallerySection from '../components/home/GallerySection';

const GalleryPage = () => {
    return (
        <PageLayout
            title="평화의 순간들 | 이름을 모르는 먼 곳의 그대에게"
            description="평화를 노래하는 우리들의 순간들"
            background="seafoam"
            disableTopPadding={true}
        >
            <PageHero
                title="갤러리"
                subtitle="평화의 순간들"
                backgroundImage="/images-webp/gallery/1.webp"
            />
            <div className="py-16 md:py-24">
                <GallerySection enableSectionWrapper={false} />
            </div>
        </PageLayout>
    );
};

export default GalleryPage;
