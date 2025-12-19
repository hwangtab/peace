import { GalleryImage } from '../types/gallery';

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  try {
    const categories = ['album', 'camp2023', 'camp2025'];

    // Promise.all로 병렬 처리 + 개별 에러 처리
    const results = await Promise.all(
      categories.map(async (cat) => {
        try {
          const response = await fetch(`/data/gallery/${cat}.json`);
          if (!response.ok) {
            console.warn(`Failed to fetch gallery/${cat}.json: ${response.status}`);
            return [];
          }

          const text = await response.text();
          try {
            return JSON.parse(text) as GalleryImage[];
          } catch (parseError) {
            console.error(`JSON parse error for ${cat}:`, parseError);
            return [];
          }
        } catch (fetchError) {
          console.error(`Fetch error for ${cat}:`, fetchError);
          return [];
        }
      })
    );

    return results.flat();
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
};
