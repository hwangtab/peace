import { GalleryImage } from '../types/gallery';

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  try {
    const categories = ['album', 'camp2023', 'camp2025'];
    const allFetchedImages: GalleryImage[] = [];

    for (const cat of categories) {
      const response = await fetch(`/data/gallery/${cat}.json`);
      if (response.ok) {
        const data = await response.json();
        allFetchedImages.push(...data);
      }
    }

    return allFetchedImages;
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
};
