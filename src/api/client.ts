import { getLanguageCode } from '../utils/localization';

export async function fetchLocalData<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.warn(`Failed to fetch ${path}: ${response.status}`);
      return [];
    }
    const text = await response.text();
    try {
      return JSON.parse(text) as T[];
    } catch (parseError) {
      console.error(`JSON parse error for ${path}:`, parseError);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return [];
  }
}

export async function fetchLocalizedData<T>(path: string, language?: string): Promise<T[]> {
  const lang = getLanguageCode(language);
  if (path.startsWith('/data/')) {
    if (lang !== 'ko') {
      const localizedPath = path.replace('/data/', `/data/${lang}/`);
      const localized = await fetchLocalData<T>(localizedPath);
      if (localized.length > 0) {
        return localized;
      }
      if (lang !== 'en') {
        const englishPath = path.replace('/data/', '/data/en/');
        const english = await fetchLocalData<T>(englishPath);
        if (english.length > 0) {
          return english;
        }
      }
    }
  }
  return fetchLocalData<T>(path);
}
