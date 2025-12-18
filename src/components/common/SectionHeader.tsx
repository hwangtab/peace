import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    description?: string; // Alternative name for subtitle if needed
    align?: 'center' | 'left';
    className?: string;
    titleTag?: 'h1' | 'h2';
    useDivider?: boolean;
    inView?: boolean;
}

/**
 * SectionHeader Component
 * 
 * Standardized header for all sections of the website.
 * Provides consistent typography, spacing, and dividers.
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    description,
    align = 'center',
    className,
    titleTag = 'h2',
    useDivider = true,
    inView = true,
}) => {
    const displaySubtitle = subtitle || description;
    const TitleTag = titleTag;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className={classNames(
                'mb-12 md:mb-16',
                {
                    'text-center': align === 'center',
                    'text-left': align === 'left',
                },
                className
            )}
        >
            <TitleTag className={classNames(
                titleTag === 'h1' ? 'typo-h1' : 'typo-h2',
                'mb-4 text-gray-900'
            )}>
                {title}
            </TitleTag>

            {displaySubtitle && (
                <p
                    className="typo-subtitle mb-6 text-gray-600 max-w-2xl mx-auto"
                    style={{ textWrap: 'balance' }}
                >
                    {displaySubtitle}
                </p>
            )}

            {useDivider && (
                <div className={classNames(
                    'w-24 h-1.5 rounded-full',
                    'bg-gradient-to-r from-jeju-ocean to-emerald-500',
                    {
                        'mx-auto': align === 'center',
                        'mr-auto': align === 'left',
                    }
                )} />
            )}
        </motion.div>
    );
};

export default SectionHeader;
