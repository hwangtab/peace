import { GalleryImage } from '../types/gallery';
import { fetchArchiveItems } from './archive';
import { fetchLocalData } from './client';

export const getGalleryImages = async (language?: string): Promise<GalleryImage[]> => {
  const cmsItems = await fetchArchiveItems<GalleryImage>('gallery', language);
  if (cmsItems) return cmsItems;

  const categories = ['album', 'camp2023', 'camp2025', 'camp2026'];
  const results = await Promise.allSettled(
    categories.map((cat) => fetchLocalData<GalleryImage>(`/data/gallery/${cat}.json`))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<GalleryImage[]> => {
      if (r.status === 'rejected') {
        console.warn('[gallery] category fetch failed:', r.reason);
      }
      return r.status === 'fulfilled';
    })
    .flatMap((r) => r.value);
};
