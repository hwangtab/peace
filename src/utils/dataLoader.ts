import fs from 'fs';
import path from 'path';

type JsonArrayStatus = 'ok' | 'empty' | 'not_found';

interface JsonArrayResult<T> {
  status: JsonArrayStatus;
  data: T[];
}

const createLoaderError = (message: string, cause?: unknown): Error => {
  const error = new Error(message);
  if (cause !== undefined) {
    Object.assign(error, { cause });
  }
  return error;
};

export const readJsonArrayResult = <T>(filePath: string): JsonArrayResult<T> => {
  if (!fs.existsSync(filePath)) {
    return { status: 'not_found', data: [] };
  }

  const content = fs.readFileSync(filePath, 'utf8');

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw createLoaderError(`Invalid JSON in ${filePath}`, error);
  }

  if (!Array.isArray(parsed)) {
    throw createLoaderError(`Expected array JSON in ${filePath}`);
  }

  const data = parsed as T[];
  if (data.length === 0) {
    return { status: 'empty', data };
  }

  return { status: 'ok', data };
};

export const readJsonArray = <T>(filePath: string): T[] => {
  const result = readJsonArrayResult<T>(filePath);
  return result.data;
};

export const loadLocalizedData = <T>(locale: string, filename: string): T[] => {
  const root = path.join(process.cwd(), 'public', 'data');
  const candidates =
    locale === 'ko'
      ? [path.join(root, filename)]
      : [
          path.join(root, locale, filename),
          path.join(root, 'en', filename),
          path.join(root, filename),
        ];

  let allMissing = true;
  let sawEmptyData = false;

  for (const candidate of candidates) {
    const result = readJsonArrayResult<T>(candidate);

    if (result.status !== 'not_found') {
      allMissing = false;
    }

    if (result.status === 'ok') {
      return result.data;
    }

    if (result.status === 'empty') {
      sawEmptyData = true;
    }
  }

  if (allMissing) {
    throw createLoaderError(`No localized data file found for ${filename} (locale: ${locale})`);
  }

  if (!sawEmptyData) {
    throw createLoaderError(`Failed to resolve localized data for ${filename} (locale: ${locale})`);
  }

  return [];
};

export const loadGalleryImages = <T>(): T[] => {
  const root = path.join(process.cwd(), 'public', 'data', 'gallery');
  const categories = ['album', 'camp2023', 'camp2025', 'camp2026'];
  const allImages: T[] = [];

  for (const category of categories) {
    const filePath = path.join(root, `${category}.json`);
    const result = readJsonArrayResult<T>(filePath);
    if (result.status === 'ok' || result.status === 'empty') {
      allImages.push(...result.data);
    }
  }

  return allImages;
};
