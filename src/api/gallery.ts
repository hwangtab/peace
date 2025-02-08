import { GalleryImage } from '../types/gallery';

export const getGalleryImages = async (): Promise<GalleryImage[]> => {
  // 정적으로 이미지 목록 생성 (1부터 180까지)
  const imageCount = 180;
  const images: GalleryImage[] = [];
  
  // 내림차순으로 생성 (180부터 1까지)
  for (let i = imageCount; i >= 1; i--) {
    images.push({
      id: i,
      url: `/gallery/${i}.jpeg`
    });
  }
  
  return images;
};
