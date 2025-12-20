import React, { ReactNode } from 'react';
import classNames from 'classnames';

interface SectionProps {
    children: ReactNode;
    id?: string;
    className?: string; // For additional custom styles if absolutely necessary
    background?: 'white' | 'ocean-sand' | 'sky-horizon' | 'sunlight-glow' | 'seafoam' | 'light-beige' | 'transparent' | 'golden-sun';
}

/**
 * Section Component
 * 
 * Enforces consistent vertical padding (py-16 md:py-24) across the website.
 * Use this for all content sections within pages.
 */
const Section = React.forwardRef<HTMLElement, SectionProps>(({
    children,
    id,
    className,
    background = 'white'
}, ref) => {
    const bgClasses = {
        'white': 'bg-white',
        'ocean-sand': 'bg-ocean-sand',
        'sky-horizon': 'bg-sky-horizon',
        'sunlight-glow': 'bg-sunlight-glow',
        'seafoam': 'bg-seafoam',
        'light-beige': 'bg-light-beige',
        'transparent': 'bg-transparent',
        'golden-sun': 'bg-golden-sun'
    };

    return (
        <section
            ref={ref}
            id={id}
            className={classNames(
                // The core consistent padding rule (formerly .section)
                'py-16 md:py-24',
                bgClasses[background],
                className
            )}
        >
            {children}
        </section >
    );
});

Section.displayName = 'Section';

export default Section;
