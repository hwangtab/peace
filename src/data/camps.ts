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
      { name: '리테스 마하르잔', musicianId: 1 },
      '바투카다',
      { name: '여유와 설빈', musicianId: 9 },
      { name: '출장작곡가 김동산', musicianId: 3 },
      { name: '까르', musicianId: 5 },
      '오재환',
      '항아',
      '태히언'
    ],
    staff: [
      { role: '기획', members: ['장하나', '이상', '황경하', '자리타', '읭', '안드레아'] },
      { role: '조명', members: ['이상'] },
      { role: '무대', members: ['응'] },
      { role: '음향', members: ['황경하'] },
      { role: '진행', members: ['이상'] },
      { role: '디자인', members: ['여울', '장하나'] },
      { role: '사진', members: ['종은'] },
      { role: '스텝 및 도움 주신 분들', members: ['달해', '도토', '록키', '모레', '민상', '박용성', '산호', '성준', '소설', '여울', '영', '조은', '준후'] }
    ],
    collaborators: [
      '강정마을 해군기지 반대주민회', '강정친구들', '강정평화네트워크',
      '열린 군대를 위한 시민연대', '(재)성프란치스코평화센터',
      '정전 70년 한반도 평화행동', '정치하는 엄마들', '평화바람'
    ],
    images: [
      '/images-webp/camps/2023/DSC00451.webp',
      '/images-webp/camps/2023/20230610둘리목걸이고르는.webp',
      '/images-webp/camps/2023/20230610밤 전쟁을끝내자.webp',
      '/images-webp/camps/2023/DSC00451.webp',
      '/images-webp/camps/2023/20230610여울과2.webp',
      '/images-webp/camps/2023/20230610지슬.webp',
      '/images-webp/camps/2023/20230610평화문화셀러.webp',
      '/images-webp/camps/2023/DSC00273.webp',
      '/images-webp/camps/2023/DSC00360.webp'
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
      { name: '까르', musicianId: 5 },
      { name: '남수', musicianId: 4 },
      '블로꾸 자파리 & 뽈레뽈레',
      { name: '모레도토요일', musicianId: 7 },
      '오재환',
      { name: '이서영', musicianId: 12 },
      { name: '자이(Jai)', musicianId: 11 },
      { name: '정진석', musicianId: 2 },
      { name: '출장작곡가 김동산', musicianId: 3 },
      '태히언',
      { name: 'HANASH', musicianId: 11 }
    ],
    staff: [
      { role: '기획', members: ['장하나', '이상', '황경하'] },
      { role: '조명', members: ['이상'] },
      { role: '음향', members: ['강경덕'] },
      { role: '진행', members: ['장하나'] },
      { role: '디자인', members: ['도토'] },
      { role: '영상', members: ['황경하'] },
      { role: '사진', members: ['김동희'] },
      { role: '스텝 및 도움 주신 분들', members: ['든든', '려강', '카레', '개미', '수산', '지혜', '버들', '김성환', '이성준'] }
    ],
    collaborators: [
      '가장자리에서', '개척자들', '강정마을 해군기지 반대주민회',
      '강정친구들', '강정평화네트워크', '공간()', '(재)성프란치스코평화센터',
      '전쟁 없는 세상', '정치하는 엄마들', '핫핑크돌핀스',
      '비무장 평화의 섬 제주를 만드는 사람들'
    ],
    images: [
      '/images-webp/camps/2025/peacemusic-1.webp',
      '/images-webp/camps/2025/DSC00427.webp',
      '/images-webp/camps/2025/DSC00491.webp',
      '/images-webp/camps/2025/DSC00524.webp',
      '/images-webp/camps/2025/DSC00533.webp',
      '/images-webp/camps/2025/DSC00547.webp',
      '/images-webp/camps/2025/DSC00559.webp',
      '/images-webp/camps/2025/DSC00625.webp',
      '/images-webp/camps/2025/DSC00667.webp'
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
