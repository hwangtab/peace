import { GalleryImage } from '../types/gallery';
import { fetchLocalData } from './client';

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  // camp2026 은 아직 행사 전이라 빈 배열 — 페치 비용 절감을 위해 제외.
  // 행사 후 사진이 추가되면 다시 categories 에 포함.
  const categories = ['album', 'camp2023', 'camp2025'];
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
