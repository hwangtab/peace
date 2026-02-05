export type SupportedLanguage = 'ko' | 'en';

export const getLanguageCode = (language?: string): SupportedLanguage => {
  if (!language) return 'ko';
  return language.toLowerCase().startsWith('en') ? 'en' : 'ko';
};
