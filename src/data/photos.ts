import { Photo } from '../types/Photo';

export const photos: Photo[] = [
  {
    id: '1',
    title: '첫 번째 공연',
    description: '마포아트센터에서의 첫 공연 현장',
    imageUrl: '/images/gallery-webp/1.webp',
    date: '2023-12-15',
    location: '마포아트센터'
  },
  {
    id: '2',
    title: '연습실에서',
    description: '공연 준비를 위한 연습 현장',
    imageUrl: '/images/gallery-webp/2.webp',
    date: '2023-12-01',
    location: '연습실'
  },
  {
    id: '3',
    title: '관객과 함께',
    description: '관객들과 함께한 특별한 순간',
    imageUrl: '/images/gallery-webp/3.webp',
    date: '2024-01-20',
    location: '부산 문화회관'
  }
];
