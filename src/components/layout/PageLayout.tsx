import React, { ReactNode } from 'react';
import classNames from 'classnames';
import SEOHelmet, { SEOHelmetProps } from '../shared/SEOHelmet';

interface PageLayoutProps extends SEOHelmetProps {
    children: ReactNode;
    className?: string;
    background?: 'white' | 'ocean-sand';
}

/**
 * PageLayout Component
 * 
 * Standardizes the top-level page layout, ensuring correct spacing for the fixed navigation bar.
 * replacing the manual `pt-24 pb-16` / `pt-32 pb-24` classes.
 * 
 * Includes SEOHelmet automatically to prevent SEO omissions.
 */
const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    className,
    background = 'ocean-sand',
    ...seoProps
}) => {
    return (
        <div className={classNames(
            'min-h-screen',
            background === 'ocean-sand' ? 'bg-ocean-sand' : 'bg-white',
            'pt-24 pb-16 md:pt-32 md:pb-24', // Standard top/bottom padding (formerly .page-container)
            className
        )}>
            <SEOHelmet {...seoProps} />
            {children}
        </div>
    );
};

export default PageLayout;
