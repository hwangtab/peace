import { GalleryImages } from '../types/gallery';

export const galleryImages: GalleryImages = [
  // 2024 Album Images (1-60)
  ...Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    url: `/images-webp/gallery/${i + 1}.webp`,
    eventType: 'album' as const,
    eventYear: 2024,
    description: '이름을 모르는 먼 곳의 그대에게 앨범 아트워크'
  })),

  // 2023 Camp Images (Selection)
  { id: 101, url: '/images-webp/camps/2023/20230610_195517.webp', eventType: 'camp', eventYear: 2023, description: '2023 강정피스앤뮤직캠프' },
  { id: 102, url: '/images-webp/camps/2023/20230610강정피스앤뮤직캠프현수믹.webp', eventType: 'camp', eventYear: 2023, description: '캠프 현수막' },
  { id: 103, url: '/images-webp/camps/2023/20230610리테스마하르잔.webp', eventType: 'camp', eventYear: 2023, description: '리테스 마하르잔 공연' },
  { id: 104, url: '/images-webp/camps/2023/20230610산호.webp', eventType: 'camp', eventYear: 2023, description: '강정천의 산호' },
  { id: 105, url: '/images-webp/camps/2023/20230610지슬.webp', eventType: 'camp', eventYear: 2023, description: '지슬 공연' },
  { id: 106, url: '/images-webp/camps/2023/20230610행인핫도그.webp', eventType: 'camp', eventYear: 2023, description: '행인 핫도그' },
  { id: 107, url: '/images-webp/camps/2023/DSC00226.webp', eventType: 'camp', eventYear: 2023 },
  { id: 108, url: '/images-webp/camps/2023/DSC00273.webp', eventType: 'camp', eventYear: 2023 },
  { id: 109, url: '/images-webp/camps/2023/DSC00281.webp', eventType: 'camp', eventYear: 2023 },
  { id: 110, url: '/images-webp/camps/2023/DSC00344.webp', eventType: 'camp', eventYear: 2023 },
  { id: 111, url: '/images-webp/camps/2023/DSC00402.webp', eventType: 'camp', eventYear: 2023 },
  { id: 112, url: '/images-webp/camps/2023/DSC00467.webp', eventType: 'camp', eventYear: 2023 },
  { id: 113, url: '/images-webp/camps/2023/DSC00493.webp', eventType: 'camp', eventYear: 2023 },
  { id: 114, url: '/images-webp/camps/2023/DSC00551.webp', eventType: 'camp', eventYear: 2023 },
  { id: 115, url: '/images-webp/camps/2023/IMG_2032.webp', eventType: 'camp', eventYear: 2023 },
  { id: 116, url: '/images-webp/camps/2023/IMG_2114.webp', eventType: 'camp', eventYear: 2023 },
  { id: 117, url: '/images-webp/camps/2023/IMG_2225.webp', eventType: 'camp', eventYear: 2023 },
  { id: 118, url: '/images-webp/camps/2023/IMG_2368.webp', eventType: 'camp', eventYear: 2023 },
  { id: 119, url: '/images-webp/camps/2023/IMG_2402.webp', eventType: 'camp', eventYear: 2023 },
  { id: 120, url: '/images-webp/camps/2023/IMG_2502.webp', eventType: 'camp', eventYear: 2023 },

  // 2025 Camp Images (Selection)
  { id: 201, url: '/images-webp/camps/2025/DSC00316.webp', eventType: 'camp', eventYear: 2025, description: '2025 강정피스앤뮤직캠프' },
  { id: 202, url: '/images-webp/camps/2025/DSC00323.webp', eventType: 'camp', eventYear: 2025 },
  { id: 203, url: '/images-webp/camps/2025/DSC00331.webp', eventType: 'camp', eventYear: 2025 },
  { id: 204, url: '/images-webp/camps/2025/DSC00393.webp', eventType: 'camp', eventYear: 2025 },
  { id: 205, url: '/images-webp/camps/2025/DSC00421.webp', eventType: 'camp', eventYear: 2025 },
  { id: 206, url: '/images-webp/camps/2025/DSC00460.webp', eventType: 'camp', eventYear: 2025 },
  { id: 207, url: '/images-webp/camps/2025/DSC00501.webp', eventType: 'camp', eventYear: 2025 },
  { id: 208, url: '/images-webp/camps/2025/DSC00559.webp', eventType: 'camp', eventYear: 2025 },
  { id: 209, url: '/images-webp/camps/2025/DSC00619.webp', eventType: 'camp', eventYear: 2025 },
  { id: 210, url: '/images-webp/camps/2025/DSC00629.webp', eventType: 'camp', eventYear: 2025 },
  { id: 211, url: '/images-webp/camps/2025/DSC00738.webp', eventType: 'camp', eventYear: 2025 },
  { id: 212, url: '/images-webp/camps/2025/DSC00783.webp', eventType: 'camp', eventYear: 2025 },
  { id: 213, url: '/images-webp/camps/2025/DSC00836.webp', eventType: 'camp', eventYear: 2025 },
  { id: 214, url: '/images-webp/camps/2025/DSC00921.webp', eventType: 'camp', eventYear: 2025 },
  { id: 215, url: '/images-webp/camps/2025/IMG_1892.webp', eventType: 'camp', eventYear: 2025 },
  { id: 216, url: '/images-webp/camps/2025/peacemusic-1.webp', eventType: 'camp', eventYear: 2025 },
  { id: 217, url: '/images-webp/camps/2025/peacemusic-4.webp', eventType: 'camp', eventYear: 2025 },
  { id: 218, url: '/images-webp/camps/2025/IMG_6036.webp', eventType: 'camp', eventYear: 2025 },
  { id: 219, url: '/images-webp/camps/2025/IMG_9186.webp', eventType: 'camp', eventYear: 2025 },
  { id: 220, url: '/images-webp/camps/2025/IMG_9211.webp', eventType: 'camp', eventYear: 2025 },
];
