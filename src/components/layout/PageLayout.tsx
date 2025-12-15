import React, { ReactNode } from 'react';
import classNames from 'classnames';
import SEOHelmet, { SEOHelmetProps } from '../shared/SEOHelmet';

interface PageLayoutProps extends SEOHelmetProps {
    children: ReactNode;
    className?: string;
    background?: 'white' | 'ocean-sand' | 'seafoam' | 'sunlight-glow' | 'sky-horizon' | 'light-beige';
    disableTopPadding?: boolean;
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
    disableTopPadding = false,
    ...seoProps
}) => {
    return (
        <div className={classNames(
            'min-h-screen',
            {
                'bg-white': background === 'white',
                'bg-ocean-sand': background === 'ocean-sand',
                'bg-seafoam': background === 'seafoam',
                'bg-sunlight-glow': background === 'sunlight-glow',
                'bg-sky-horizon': background === 'sky-horizon',
                'bg-light-beige': background === 'light-beige',
            },
            // Standard top/bottom padding (formerly .page-container)
            // If disableTopPadding is true, we remove the top padding classes
            disableTopPadding ? 'pb-16 md:pb-24' : 'pt-24 pb-16 md:pt-32 md:pb-24',
            className
        )}>
            <SEOHelmet {...seoProps} />
            {children}
        </div>
    );
};

export default PageLayout;
