/**
 * Camp Events Data
 * Data for all Peace & Music Camp events (2023, 2025, 2026)
 */

import { CampEvent } from '../types/camp';

export const camps: CampEvent[] = [
  {
    id: 'camp-2023',
    eventType: 'camp',
    year: 2023,
    title: '제1회 강정피스앤뮤직캠프',
    shortDescription: '강정마을의 평화를 노래하는 첫 번째 캠프',
    description: '2023년 6월 10일, 강정마을에서 개최된 첫 번째 평화음악캠프. "전쟁을 끝내자! 놀며, 춤추며, 노래하며!"라는 슬로건으로 강정 평화운동의 연대와 우정을 나누었습니다.',
    location: '강정체육공원 (제주 서귀포시 이어도로 669)',
    startDate: '2023-06-10',
    slogan: '전쟁을 끝내자! 놀며, 춤추며, 노래하며!',
    participants: [
      '리테스 마하르잔',
      '여유와 설빈',
      '출장작곡가 김동산',
      '까르',
      '오재환',
      '항아',
      '태히언'
    ],
    images: [
      '/Images/1th camp/20230600.편집.19.jpg',
      '/Images/1th camp/20230600.편집.24.jpg',
      '/Images/1th camp/20230600.편집.29.jpg',
      '/Images/1th camp/20230600.편집.32.jpg',
      '/Images/1th camp/20230600.편집.37.jpg',
      '/Images/1th camp/20230609_160722.jpg'
    ]
  },
  {
    id: 'camp-2025',
    eventType: 'camp',
    year: 2025,
    title: '제2회 강정피스앤뮤직캠프',
    shortDescription: '정전 73주년, 평화의 목소리를 높이다',
    description: '2025년 6월 14일, 제주 강정마을 일대에서 개최된 두 번째 평화음악캠프. 정전 73주년을 맞이하여 강화되는 한반도의 군사기지화에 맞서 평화의 메시지를 전했습니다.',
    location: '강정체육공원 (제주 서귀포시 강정동 2661번지) 및 강정마을 일대',
    startDate: '2025-06-14',
    endDate: '2025-06-14',
    slogan: '노래하자, 춤추자, 전쟁을 끝내자!',
    participants: [
      '까르',
      '남수',
      '모레도토요일',
      '오재환',
      '이서영',
      '자이(Jai)',
      '정진석',
      '출장작곡가 김동산',
      '태히언',
      'HANASH'
    ],
    images: [
      '/images/2th-camp/1.jpg',
      '/images/2th-camp/2.jpg',
      '/images/2th-camp/3.jpg',
      '/images/2th-camp/4.jpg',
      '/images/2th-camp/5.jpg',
      '/images/2th-camp/6.jpg',
      '/images/2th-camp/7.jpg',
      '/images/2th-camp/8.jpg',
      '/images/2th-camp/9.jpg',
      '/images/2th-camp/10.jpg',
      '/images/2th-camp/11.jpg',
      '/images/2th-camp/12.jpg'
    ]
  },
  {
    id: 'camp-2026',
    eventType: 'camp',
    year: 2026,
    title: '제3회 강정피스앤뮤직캠프',
    shortDescription: '다가올 평화음악캠프',
    description: '2026년에 개최될 예정인 제3회 강정피스앤뮤직캠프. 구체적인 일정과 프로그램은 추후 공지될 예정입니다.',
    location: '강정 (예정)',
    startDate: '2026-06-13',
    slogan: '',
    participants: [],
    images: []
  }
];
