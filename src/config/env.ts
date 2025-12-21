/**
 * Environment configuration
 * Centralized access to environment variables with fallbacks
 */

export const config = {
    // Site
    siteUrl: process.env.REACT_APP_SITE_URL || 'https://peaceandmusic.net',
    siteName: process.env.REACT_APP_SITE_NAME || '강정피스앤뮤직캠프',

    // External Links
    smartstoreUrl: process.env.REACT_APP_SMARTSTORE_URL || 'https://smartstore.naver.com/peaceandmusic',
    instagramUrl: process.env.REACT_APP_INSTAGRAM_URL || 'https://www.instagram.com/peace_music_in_gangjeong',

    // Images
    ogImage: process.env.REACT_APP_OG_IMAGE || '/images-webp/camps/2023/DSC00437.webp',
} as const;

// Helper function for full URLs
export const getFullUrl = (path: string): string => {
    const baseUrl = config.siteUrl.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};
