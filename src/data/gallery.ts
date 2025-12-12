import { GalleryImages } from '../types/gallery';

// 2024 앨범 이미지 (18장) - 존재하는 파일만 매핑
// gallery 폴더의 파일명이 불규칙적이므로 (1.webp, 10.webp... 등), 실제 존재하는 파일명으로 수정해야 함
// 우선 확인된 파일들과 캠프 사진들을 조합
const galleryDirFiles = [
  '1.webp', '10.webp', '100.webp', '101.webp', '102.webp',
  '103.webp', '104.webp', '105.webp', '106.webp', '107.webp', '108.webp'
  // 추가 확인 필요하지만 우선 404 방지를 위해 확인된 것만 포함
];

const albumImages: GalleryImages = galleryDirFiles.map((filename, i) => ({
  id: i + 1, // Temporary ID
  url: `/images-webp/gallery/${filename}`,
  description: '2024 앨범 쇼케이스',
  eventType: 'album',
  eventYear: 2024
}));

// 2023 Camp Images
const camp2023Images: GalleryImages = [
  { id: 101, url: '/images-webp/camps/2023/IMG_3095.webp', eventType: 'camp', eventYear: 2023 },
  { id: 102, url: '/images-webp/camps/2023/IMG_3334.webp', eventType: 'camp', eventYear: 2023 },
  { id: 103, url: '/images-webp/camps/2023/IMG_2380.webp', eventType: 'camp', eventYear: 2023 },
  { id: 104, url: '/images-webp/camps/2023/IMG_2064.webp', eventType: 'camp', eventYear: 2023 },
  { id: 105, url: '/images-webp/camps/2023/IMG_2440.webp', eventType: 'camp', eventYear: 2023 },
  { id: 106, url: '/images-webp/camps/2023/IMG_2806.webp', eventType: 'camp', eventYear: 2023 },
  { id: 107, url: '/images-webp/camps/2023/IMG_2300.webp', eventType: 'camp', eventYear: 2023 },
  { id: 108, url: '/images-webp/camps/2023/IMG_2936.webp', eventType: 'camp', eventYear: 2023 },
  { id: 109, url: '/images-webp/camps/2023/IMG_3635.webp', eventType: 'camp', eventYear: 2023 },
  { id: 110, url: '/images-webp/camps/2023/IMG_2508.webp', eventType: 'camp', eventYear: 2023 },
  { id: 111, url: '/images-webp/camps/2023/DSC00478.webp', eventType: 'camp', eventYear: 2023 },
  { id: 112, url: '/images-webp/camps/2023/IMG_2697.webp', eventType: 'camp', eventYear: 2023 },
  { id: 113, url: '/images-webp/camps/2023/IMG_2053.webp', eventType: 'camp', eventYear: 2023 },
  { id: 114, url: '/images-webp/camps/2023/DSC00536.webp', eventType: 'camp', eventYear: 2023 },
  { id: 115, url: '/images-webp/camps/2023/IMG_3197.webp', eventType: 'camp', eventYear: 2023 },
  { id: 116, url: '/images-webp/camps/2023/IMG_2707.webp', eventType: 'camp', eventYear: 2023 },
  { id: 117, url: '/images-webp/camps/2023/IMG_2459.webp', eventType: 'camp', eventYear: 2023 },
  { id: 118, url: '/images-webp/camps/2023/IMG_2719.webp', eventType: 'camp', eventYear: 2023 },
  { id: 119, url: '/images-webp/camps/2023/IMG_3692.webp', eventType: 'camp', eventYear: 2023 },
  { id: 120, url: '/images-webp/camps/2023/IMG_2557.webp', eventType: 'camp', eventYear: 2023 },
];

// 2025 Camp Images
const camp2025Images: GalleryImages = [
  { id: 201, url: '/images-webp/camps/2025/DSC08846.webp', eventType: 'camp', eventYear: 2025 },
  { id: 202, url: '/images-webp/camps/2025/DSC00399.webp', eventType: 'camp', eventYear: 2025 },
  { id: 203, url: '/images-webp/camps/2025/DSC00993.webp', eventType: 'camp', eventYear: 2025 },
  { id: 204, url: '/images-webp/camps/2025/DSC08837.webp', eventType: 'camp', eventYear: 2025 },
  { id: 205, url: '/images-webp/camps/2025/IMG_9244.webp', eventType: 'camp', eventYear: 2025 },
  { id: 206, url: '/images-webp/camps/2025/DSC01073.webp', eventType: 'camp', eventYear: 2025 },
  { id: 207, url: '/images-webp/camps/2025/DSC08857.webp', eventType: 'camp', eventYear: 2025 },
  { id: 208, url: '/images-webp/camps/2025/DSC00807.webp', eventType: 'camp', eventYear: 2025 },
  { id: 209, url: '/images-webp/camps/2025/DSC00767.webp', eventType: 'camp', eventYear: 2025 },
  { id: 210, url: '/images-webp/camps/2025/DSC00786.webp', eventType: 'camp', eventYear: 2025 },
  { id: 211, url: '/images-webp/camps/2025/DSC01081.webp', eventType: 'camp', eventYear: 2025 },
  { id: 212, url: '/images-webp/camps/2025/DSC08809.webp', eventType: 'camp', eventYear: 2025 },
  { id: 213, url: '/images-webp/camps/2025/DSC08879.webp', eventType: 'camp', eventYear: 2025 },
  { id: 214, url: '/images-webp/camps/2025/DSC00547.webp', eventType: 'camp', eventYear: 2025 },
  { id: 215, url: '/images-webp/camps/2025/DSC00501.webp', eventType: 'camp', eventYear: 2025 },
  { id: 216, url: '/images-webp/camps/2025/DSC01007.webp', eventType: 'camp', eventYear: 2025 },
  { id: 217, url: '/images-webp/camps/2025/photo_2025-06-06_15-23-05.webp', eventType: 'camp', eventYear: 2025 },
  { id: 218, url: '/images-webp/camps/2025/DSC00976.webp', eventType: 'camp', eventYear: 2025 },
  { id: 219, url: '/images-webp/camps/2025/IMG_6027.webp', eventType: 'camp', eventYear: 2025 },
  { id: 220, url: '/images-webp/camps/2025/DSC01027.webp', eventType: 'camp', eventYear: 2025 },
];

export const galleryImages: GalleryImages = [
  ...albumImages,
  ...camp2023Images,
  ...camp2025Images
].map((img, index) => ({
  ...img,
  id: index + 1
}));
