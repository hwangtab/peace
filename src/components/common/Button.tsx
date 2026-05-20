import React, { ReactNode } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { buildUtmUrl } from '@/utils/utm';

type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'outline' | 'white-outline' | 'white' | 'ghost-white' | 'back';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonShape = 'pill' | 'rounded';

interface ButtonProps {
    children: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    href?: string;
    to?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    shape?: ButtonShape;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    external?: boolean;
    fullWidth?: boolean;
    ariaLabel?: string;
    utmContent?: string;
}

const Button = ({
    children,
    onClick,
    href,
    to,
    variant = 'primary',
    size = 'md',
    shape = 'pill',
    className,
    type = 'button',
    disabled = false,
    external = false,
    fullWidth = false,
    ariaLabel,
    utmContent,
}: ButtonProps) => {
    const baseClasses = 'inline-flex items-center justify-center transition-[color,background-color,box-shadow,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean text-center whitespace-normal break-words max-w-full active:scale-95 hover:scale-105';

    const variantClasses = {
        primary: 'bg-jeju-ocean text-white font-medium hover:bg-ocean-mist shadow-md hover:shadow-lg',
        secondary: 'bg-ocean-mist text-white font-medium hover:bg-jeju-ocean shadow-md hover:shadow-lg',
        gold: 'bg-golden-sun text-deep-ocean font-bold hover:bg-golden-sun/80 shadow-lg hover:shadow-xl',
        outline: 'border-2 border-jeju-ocean text-jeju-ocean font-medium hover:bg-jeju-ocean hover:text-white bg-transparent shadow-md hover:shadow-lg',
        'white-outline': 'border-2 border-cloud-white text-cloud-white font-medium hover:bg-white/10 bg-transparent shadow-md hover:shadow-lg',
        white: 'bg-white text-jeju-ocean font-bold hover:bg-ocean-sand shadow-lg hover:shadow-xl',
        'ghost-white': 'bg-white/15 text-white font-medium border border-white/30 hover:bg-white/25',
        back: 'bg-ocean-sand text-jeju-ocean font-medium hover:bg-ocean-mist',
    };

    const sizeClasses = {
        sm: 'px-6 py-2.5 text-sm',
        md: 'px-8 py-3 text-base',
        lg: 'px-10 py-3.5 text-lg',
    };

    const shapeClasses = {
        pill: 'rounded-full',
        rounded: 'rounded-lg',
    };

    const combinedClasses = classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        shapeClasses[shape],
        {
            'w-full': fullWidth,
            'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100': disabled,
        },
        className
    );

    const resolvedHref = href && utmContent
        ? buildUtmUrl(href, utmContent)
        : href;

    const content = children;

    const handleClick = disabled
        ? (e: React.MouseEvent<HTMLElement>) => { e.preventDefault(); }
        : onClick;

    if (to) {
        return (
            <Link
                href={to}
                className={combinedClasses}
                onClick={handleClick}
                aria-label={ariaLabel}
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : undefined}
            >
                {content}
            </Link>
        );
    }

    if (resolvedHref) {
        if (external) {
            return (
                <a
                    href={resolvedHref}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={combinedClasses}
                    onClick={handleClick}
                    aria-label={ariaLabel}
                    aria-disabled={disabled || undefined}
                    tabIndex={disabled ? -1 : undefined}
                >
                    {content}
                </a>
            );
        }
        return (
            <a
                href={resolvedHref}
                className={combinedClasses}
                onClick={handleClick}
                aria-label={ariaLabel}
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : undefined}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            type={type}
            className={combinedClasses}
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
        >
            {content}
        </button>
    );
};

export default Button;
