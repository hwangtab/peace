import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import PageHero from '../components/common/PageHero';
import GallerySection from '../components/home/GallerySection';

const GalleryPage = () => {
    return (
        <PageLayout
            title="평화의 순간들 | 이름을 모르는 먼 곳의 그대에게"
            description="평화를 노래하는 우리들의 순간들"
            background="golden-sun"
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
