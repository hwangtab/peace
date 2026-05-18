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

const FETCH_TIMEOUT_MS = 10_000;

const fetchLocalDataResult = async <T>(path: string): Promise<LocalDataResult<T>> => {
  let response: Response;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    response = await fetch(path, { signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw createDataError(`Request timeout after ${FETCH_TIMEOUT_MS}ms: ${path}`, error);
    }
    throw createDataError(`Network error while fetching ${path}`, error);
  } finally {
    clearTimeout(timeoutId);
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

interface FetchLocalizedOptions {
  mergeByIdKey?: string;
}

export async function fetchLocalizedData<T>(
  path: string,
  language?: string,
  options?: FetchLocalizedOptions,
): Promise<T[]> {
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

  if (!options?.mergeByIdKey) {
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

  // merge mode: all candidates fetched, earlier entries win on id collision
  const key = options.mergeByIdKey;
  const merged: T[] = [];
  const seen = new Set<unknown>();
  let anyOk = false;

  for (const candidate of candidates) {
    const result = await fetchLocalDataResult<T>(candidate);
    if (result.status === 'ok') {
      anyOk = true;
      for (const item of result.data) {
        const id = (item as Record<string, unknown>)[key];
        if (!seen.has(id)) {
          seen.add(id);
          merged.push(item);
        }
      }
    }
  }

  if (!anyOk) {
    throw createDataError(`No localized data file found for ${path} (language: ${lang})`);
  }

  return merged;
}
