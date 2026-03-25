import React, { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import classNames from 'classnames';

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

const UTM_BASE = 'utm_source=website&utm_medium=cta&utm_campaign=gpmc3';

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
    const baseClasses = 'inline-flex items-center justify-center transition-[color,background-color,box-shadow,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean text-center whitespace-normal break-words max-w-full';

    const variantClasses = {
        primary: 'bg-jeju-ocean text-white font-medium hover:bg-ocean-mist shadow-md hover:shadow-lg',
        secondary: 'bg-ocean-mist text-white font-medium hover:bg-jeju-ocean shadow-md hover:shadow-lg',
        gold: 'bg-golden-sun text-gray-900 font-bold hover:bg-yellow-400 shadow-lg hover:shadow-xl',
        outline: 'border-2 border-jeju-ocean text-jeju-ocean font-medium hover:bg-jeju-ocean hover:text-white bg-transparent shadow-md hover:shadow-lg',
        'white-outline': 'border-2 border-cloud-white text-cloud-white font-medium hover:bg-white/10 bg-transparent shadow-md hover:shadow-lg',
        white: 'bg-white text-jeju-ocean font-bold hover:bg-gray-100 shadow-lg hover:shadow-xl',
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
            'opacity-50 cursor-not-allowed': disabled,
        },
        className
    );

    const motionProps = {
        whileHover: disabled ? {} : { scale: 1.05 },
        whileTap: disabled ? {} : { scale: 0.95 },
    };

    const resolvedHref = href && utmContent
        ? `${href}?${UTM_BASE}&utm_content=${encodeURIComponent(utmContent)}`
        : href;

    const content = <>{children}</>;

    const handleClick = disabled
        ? (e: React.MouseEvent<HTMLElement>) => { e.preventDefault(); }
        : onClick;

    if (to) {
        return (
            <motion.div {...motionProps} className={fullWidth ? 'w-full' : 'inline-block'}>
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
            </motion.div >
        );
    }

    if (resolvedHref) {
        if (external || utmContent) {
            return (
                <motion.div {...motionProps} className={fullWidth ? 'w-full' : 'inline-block'}>
                    <a
                        href={resolvedHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={combinedClasses}
                        onClick={handleClick}
                        aria-label={ariaLabel}
                        aria-disabled={disabled || undefined}
                        tabIndex={disabled ? -1 : undefined}
                    >
                        {content}
                    </a>
                </motion.div>
            );
        }
        return (
            <motion.div {...motionProps} className={fullWidth ? 'w-full' : 'inline-block'}>
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
            </motion.div>
        );
    }

    return (
        <motion.button
            {...motionProps}
            type={type}
            className={combinedClasses}
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
        >
            {content}
        </motion.button>
    );
};

export default Button;
