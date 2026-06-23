import type { NextApiResponse } from 'next';
import { DEFAULT_LOCALE, LOCALES } from '@/constants/locales';
import type { AdminCollection } from './adminArchive';

const localePath = (path: string, locale: string) =>
  locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;

const allLocalePaths = (path: string) => LOCALES.map((locale) => localePath(path, locale));

const unique = (paths: string[]) => Array.from(new Set(paths));

export const getArchiveRevalidationPaths = (
  collection: AdminCollection,
  payload: Record<string, unknown>
): string[] => {
  if (collection === 'videos') {
    const publicId = payload.public_id;
    return unique([
      ...allLocalePaths('/videos'),
      ...(typeof publicId === 'number' ? allLocalePaths(`/videos/${publicId}`) : []),
      '/video-sitemap.xml',
    ]);
  }

  if (collection === 'gallery') {
    return unique([...allLocalePaths('/gallery'), '/image-sitemap.xml']);
  }

  if (collection === 'press') {
    return allLocalePaths('/press');
  }

  return [];
};

export const revalidateArchivePaths = async (
  res: NextApiResponse,
  collection: AdminCollection,
  payload: Record<string, unknown>
) => {
  const paths = getArchiveRevalidationPaths(collection, payload);
  const results = await Promise.allSettled(paths.map((path) => res.revalidate(path)));

  return results
    .map((result, index) => ({ result, path: paths[index] }))
    .filter(({ result }) => result.status === 'rejected')
    .map(({ path, result }) => ({
      path,
      error: result.status === 'rejected' ? String(result.reason) : '',
    }));
};
