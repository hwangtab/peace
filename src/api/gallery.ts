import { GalleryImage } from '../types/gallery';
import { fetchLocalData } from './client';

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  const categories = ['album', 'camp2023', 'camp2025', 'camp2026'];
  const results = await Promise.allSettled(
    categories.map((cat) => fetchLocalData<GalleryImage>(`/data/gallery/${cat}.json`))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<GalleryImage[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);
};
