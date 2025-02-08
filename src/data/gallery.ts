import { GalleryImages } from '../types/gallery';

// 실제로 추가된 이미지의 개수를 여기서 설정하세요
const TOTAL_IMAGES = 12; // 예: 1.jpeg부터 12.jpeg까지 있다면 12로 설정

export const galleryImages: GalleryImages = Array.from({ length: TOTAL_IMAGES }, (_, i) => ({
  id: i + 1,
  url: `/gallery/${i + 1}.jpeg`,
}));
