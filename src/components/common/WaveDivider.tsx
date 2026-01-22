import React from 'react';

interface WaveDividerProps {
    className?: string;
    direction?: 'up' | 'down';
}

/**
 * WaveDivider Component
 * 
 * Creates a wave-shaped SVG divider to be placed between sections.
 * Use text-color utility classes to set the color of the wave (e.g., text-sky-horizon).
 * 
 * To overlap the previous section (creating a shaped bottom for it), 
 * use a negative margin-top on this component (e.g., -mt-10).
 */
const WaveDivider: React.FC<WaveDividerProps> = ({
    className = '',
    direction = 'up'
}) => {
    return (
        <div className={`w-full leading-none overflow-hidden ${className}`}>
            <svg
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className={`relative block w-full h-[60px] sm:h-[100px] ${direction === 'down' ? 'transform rotate-180' : ''}`}
            >
                <path
                    d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                    className="fill-current"
                    style={{ transformOrigin: 'center', transform: 'scaleY(-1)' }} // Invert path to point up (filled at bottom)
                />
            </svg>
        </div>
    );
};

export default WaveDivider;
