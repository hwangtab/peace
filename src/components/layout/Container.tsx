import React, { ReactNode } from 'react';
import classNames from 'classnames';

interface ContainerProps {
    children: ReactNode;
    className?: string;
    size?: 'default' | 'small' | 'large';
}

/**
 * Container Component
 * 
 * Enforces consistent horizontal constraints and padding.
 * Use this inside <Section> or <PageLayout>.
 */
const Container: React.FC<ContainerProps> = ({
    children,
    className,
    size = 'default'
}) => {
    return (
        <div className={classNames(
            'container mx-auto px-4 sm:px-6 lg:px-8',
            {
                'max-w-7xl': size === 'default',
                'max-w-4xl': size === 'small', // Good for text-heavy pages
                'max-w-screen-2xl': size === 'large', // Good for galleries
            },
            className
        )}>
            {children}
        </div>
    );
};

export default Container;
