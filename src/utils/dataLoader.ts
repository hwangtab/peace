import fs from 'fs';
import path from 'path';

export const readJsonArray = <T,>(filePath: string): T[] => {
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

export const loadLocalizedData = <T>(locale: string, filename: string): T[] => {
  const root = path.join(process.cwd(), 'public', 'data');
  const candidates = locale === 'ko'
    ? [path.join(root, filename)]
    : [
      path.join(root, locale, filename),
      path.join(root, 'en', filename),
      path.join(root, filename),
    ];

  for (const candidate of candidates) {
    const data = readJsonArray<T>(candidate);
    if (data.length > 0) return data;
  }
  return [];
};

export const loadGalleryImages = <T>(): T[] => {
  const root = path.join(process.cwd(), 'public', 'data', 'gallery');
  const categories = ['album', 'camp2023', 'camp2025', 'camp2026'];
  const allImages: T[] = [];

  for (const category of categories) {
    const filePath = path.join(root, `${category}.json`);
    const images = readJsonArray<T>(filePath);
    allImages.push(...images);
  }

  return allImages;
};
