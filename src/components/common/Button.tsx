import React, { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import classNames from 'classnames';

type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'outline' | 'white-outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    children: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    href?: string;
    to?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    external?: boolean;
    fullWidth?: boolean;
    ariaLabel?: string;
}

const Button = ({
    children,
    onClick,
    href,
    to,
    variant = 'primary',
    size = 'md',
    className,
    type = 'button',
    disabled = false,
    external = false,
    fullWidth = false,
    ariaLabel,
}: ButtonProps) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jeju-ocean text-center whitespace-normal break-words max-w-full';

    const variantClasses = {
        primary: 'bg-jeju-ocean text-white hover:bg-ocean-mist',
        secondary: 'bg-ocean-mist text-white hover:bg-jeju-ocean',
        gold: 'bg-golden-sun text-jeju-ocean hover:bg-opacity-90 shadow-lg hover:shadow-xl',
        outline: 'border-2 border-jeju-ocean text-jeju-ocean hover:bg-jeju-ocean hover:text-white bg-transparent',
        'white-outline': 'border-2 border-cloud-white text-cloud-white hover:bg-white/10 bg-transparent',
    };

    const sizeClasses = {
        sm: 'px-6 py-2 text-sm',
        md: 'px-8 py-3 text-base',
        lg: 'px-12 py-4 text-lg',
    };

    const combinedClasses = classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
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

    const content = <>{children}</>;

    if (to) {
        return (
            <motion.div {...motionProps} className={fullWidth ? 'w-full' : 'inline-block'}>
                <Link
                    href={to}
                    className={combinedClasses}
                    onClick={onClick}
                    aria-label={ariaLabel}
                >
                    {content}
                </Link>
            </motion.div >
        );
    }

    if (href) {
        if (external) {
            return (
                <motion.div {...motionProps} className={fullWidth ? 'w-full' : 'inline-block'}>
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={combinedClasses}
                        onClick={onClick}
                        aria-label={ariaLabel}
                    >
                        {content}
                    </a>
                </motion.div>
            );
        }
        return (
            <motion.div {...motionProps} className={fullWidth ? 'w-full' : 'inline-block'}>
                <a
                    href={href}
                    className={combinedClasses}
                    onClick={onClick}
                    aria-label={ariaLabel}
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
