import { GalleryImage } from '../types/gallery';
import { fetchLocalData } from './client';

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  const categories = ['album', 'camp2023', 'camp2025'];
  const results = await Promise.all(
    categories.map((cat) => fetchLocalData<GalleryImage>(`/data/gallery/${cat}.json`))
  );
  return results.flat();
};
