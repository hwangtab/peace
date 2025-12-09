import { GalleryImages } from '../types/gallery';

// 총 180개의 이미지를 이벤트별로 분류
// 1-60: 2024 앨범, 61-120: 2023 캠프, 121-180: 2025 캠프
const TOTAL_IMAGES = 180;

export const galleryImages: GalleryImages = Array.from({ length: TOTAL_IMAGES }, (_, i) => {
  const imageId = i + 1;
  let eventType: 'camp' | 'album' | undefined;
  let eventYear: number | undefined;

  if (imageId <= 60) {
    eventType = 'album';
    eventYear = 2024;
  } else if (imageId <= 120) {
    eventType = 'camp';
    eventYear = 2023;
  } else {
    eventType = 'camp';
    eventYear = 2025;
  }

  return {
    id: imageId,
    url: `/gallery/${imageId}.jpeg`,
    eventType,
    eventYear,
  };
});
