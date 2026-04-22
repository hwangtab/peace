import React, { ReactNode } from 'react';
import classNames from 'classnames';

type PaddingLevel = 'none' | 'normal' | 'loose';

interface SectionProps {
    children: ReactNode;
    id?: string;
    className?: string;
    background?: 'white' | 'ocean-sand' | 'sky-horizon' | 'sunlight-glow' | 'seafoam' | 'light-beige' | 'transparent' | 'golden-sun';
    /**
     * Top/bottom vertical spacing.
     *
     * - `normal` (default): `pt-16 md:pt-24` / `pb-16 md:pb-24`
     * - `loose`: `pt-24 md:pt-32` / `pb-24 md:pb-32` — use when a
     *   `<SectionWave>` follows on that side and the content needs extra
     *   breathing room before the wave overlaps.
     * - `none`: no padding on that side — use when a neighbouring section
     *   bleeds directly into this one.
     */
    paddingTop?: PaddingLevel;
    paddingBottom?: PaddingLevel;
    ariaLabel?: string;
    ariaLabelledby?: string;
}

const PADDING_TOP: Record<PaddingLevel, string> = {
    none: '',
    normal: 'pt-16 md:pt-24',
    loose: 'pt-24 md:pt-32',
};

const PADDING_BOTTOM: Record<PaddingLevel, string> = {
    none: '',
    normal: 'pb-16 md:pb-24',
    loose: 'pb-24 md:pb-32',
};

const BG_CLASSES: Record<NonNullable<SectionProps['background']>, string> = {
    'white': 'bg-white',
    'ocean-sand': 'bg-ocean-sand',
    'sky-horizon': 'bg-sky-horizon',
    'sunlight-glow': 'bg-sunlight-glow',
    'seafoam': 'bg-seafoam',
    'light-beige': 'bg-light-beige',
    'transparent': 'bg-transparent',
    'golden-sun': 'bg-golden-sun',
};

/**
 * Section — standardized vertical rhythm for content sections.
 *
 * Use `paddingTop` / `paddingBottom` to tune spacing instead of adding
 * className overrides like `pb-24 md:pb-32` — the enum makes intent
 * explicit and keeps the spacing scale consistent across the site.
 */
const Section = React.forwardRef<HTMLElement, SectionProps>(({
    children,
    id,
    className,
    background = 'white',
    paddingTop = 'normal',
    paddingBottom = 'normal',
    ariaLabel,
    ariaLabelledby,
}, ref) => {
    return (
        <section
            ref={ref}
            id={id}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            className={classNames(
                PADDING_TOP[paddingTop],
                PADDING_BOTTOM[paddingBottom],
                BG_CLASSES[background],
                className
            )}
        >
            {children}
        </section >
    );
});

Section.displayName = 'Section';

export default Section;
