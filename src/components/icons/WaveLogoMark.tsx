import React from 'react';

interface Props {
  className?: string;
}

/**
 * Signature mark for the Gangjeong Peace Music Camp wordmark.
 *
 * Two overlapping sine-wave strokes — the lower line is primary, the upper
 * line is a softer echo. Uses `currentColor` so it inherits the wordmark's
 * color (white when the nav is transparent, jeju-ocean once scrolled).
 *
 * Sized with Tailwind height utilities at call sites; `w-auto` keeps the
 * aspect ratio.
 */
const WaveLogoMark: React.FC<Props> = ({ className }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 32 20"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 13c3 0 3-6 6-6s3 6 6 6 3-6 6-6 3 6 6 6 3-6 6-6" />
    <path d="M1 6c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 6 3 3-3 6-3" opacity="0.55" />
  </svg>
);

export default WaveLogoMark;
