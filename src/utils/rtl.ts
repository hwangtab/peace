/**
 * RTL (Right-to-Left) utility functions for handling text direction
 */

/**
 * Get text direction based on locale
 * @param locale - The locale code
 * @returns 'rtl' for Arabic, 'ltr' for all other languages
 */
export const getTextDirection = (locale: string): 'rtl' | 'ltr' =>
  locale === 'ar' ? 'rtl' : 'ltr';
