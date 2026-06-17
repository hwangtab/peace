import type { NextApiRequest, NextApiResponse } from 'next';
import {
  loadPublishedGallery,
  loadPublishedPress,
  loadPublishedVideos,
  type ArchiveSource,
} from '@/lib/archivePublicData';
import { normalizePressItems } from '@/api/press';

type ArchiveCollection = 'videos' | 'gallery' | 'press';

const isArchiveCollection = (value: string): value is ArchiveCollection =>
  ['videos', 'gallery', 'press'].includes(value);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const collection = String(req.query.collection ?? '');
  if (!isArchiveCollection(collection)) {
    res.status(404).json({ error: 'unknown_archive_collection' });
    return;
  }

  const locale = typeof req.query.locale === 'string' ? req.query.locale : 'ko';
  let result: { source: ArchiveSource; items: unknown[] };

  if (collection === 'videos') {
    result = await loadPublishedVideos(locale);
  } else if (collection === 'gallery') {
    result = await loadPublishedGallery(locale);
  } else {
    const press = await loadPublishedPress(locale);
    result = { source: press.source, items: normalizePressItems(press.items) };
  }

  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600');
  res.status(200).json(result);
}
