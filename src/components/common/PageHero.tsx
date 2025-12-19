import { motion } from 'framer-motion';

interface PageHeroProps {
    title: string;
    subtitle?: string;
    backgroundImage: string; // Required - no gradient fallback
}

/**
 * PageHero Component
 * 
 * 재사용 가능한 페이지 히어로 섹션 (CampHero 스타일 기반).
 * 투명 네비게이션과 함께 사용하여 일관된 페이지 헤더 제공.
 */
const PageHero: React.FC<PageHeroProps> = ({
    title,
    subtitle,
    backgroundImage,
}) => {
    // Generate responsive image paths
    const getResponsiveImagePath = (imagePath: string) => {
        const basePath = imagePath.replace('.webp', '');
        return {
            mobile: `${basePath}-mobile.webp`,
            tablet: `${basePath}-tablet.webp`,
            desktop: `${basePath}-desktop.webp`,
            original: imagePath
        };
    };

    const responsiveImages = getResponsiveImagePath(backgroundImage);

    return (
        <section
            className="relative h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center text-center overflow-hidden"
        >
            {/* Background Image */}
            <img
                src={responsiveImages.desktop}
                srcSet={`
          ${responsiveImages.mobile} 800w,
          ${responsiveImages.tablet} 1200w,
          ${responsiveImages.desktop} 1920w
        `}
                sizes="100vw"
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
            />

            {/* Dark Overlay - Same as CampHero */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

            {/* Content - Same as CampHero */}
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="typo-h1 text-white mb-4">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="typo-subtitle text-gray-100 mb-6">
                            {subtitle}
                        </p>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export default PageHero;
