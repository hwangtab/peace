import { getLanguageCode } from '../utils/localization';

type LocalDataStatus = 'ok' | 'empty' | 'not_found';

interface LocalDataResult<T> {
  status: LocalDataStatus;
  data: T[];
}

const createDataError = (message: string, cause?: unknown): Error => {
  const error = new Error(message);
  if (cause !== undefined) {
    Object.assign(error, { cause });
  }
  return error;
};

const fetchLocalDataResult = async <T>(path: string): Promise<LocalDataResult<T>> => {
  let response: Response;

  try {
    response = await fetch(path);
  } catch (error) {
    throw createDataError(`Network error while fetching ${path}`, error);
  }

  if (!response.ok) {
    if (response.status === 404) {
      return { status: 'not_found', data: [] };
    }

    throw createDataError(`Failed to fetch ${path}: HTTP ${response.status}`);
  }

  const text = await response.text();
  if (!text.trim()) {
    return { status: 'empty', data: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (parseError) {
    throw createDataError(`Invalid JSON payload at ${path}`, parseError);
  }

  if (!Array.isArray(parsed)) {
    throw createDataError(`Expected array JSON at ${path}`);
  }

  const data = parsed as T[];
  if (data.length === 0) {
    return { status: 'empty', data };
  }

  return { status: 'ok', data };
};

export async function fetchLocalData<T>(path: string): Promise<T[]> {
  const result = await fetchLocalDataResult<T>(path);
  return result.data;
}

export async function fetchLocalizedData<T>(path: string, language?: string): Promise<T[]> {
  const lang = getLanguageCode(language);

  const candidates = (() => {
    if (!path.startsWith('/data/')) {
      return [path];
    }

    if (lang === 'ko') {
      return [path];
    }

    const localizedPath = path.replace('/data/', `/data/${lang}/`);
    const englishPath = path.replace('/data/', '/data/en/');

    return lang === 'en' ? [localizedPath, path] : [localizedPath, englishPath, path];
  })();

  let allMissing = true;

  for (const candidate of candidates) {
    const result = await fetchLocalDataResult<T>(candidate);

    if (result.status !== 'not_found') {
      allMissing = false;
    }

    if (result.status === 'ok') {
      return result.data;
    }
  }

  if (allMissing) {
    throw createDataError(`No localized data file found for ${path} (language: ${lang})`);
  }

  return [];
}
