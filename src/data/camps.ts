/**
 * Camp Events Data
 * Data for all Peace & Music Camp events (2023, 2025, 2026)
 */

import { CampEvent } from '../types/camp';
import { getLanguageCode } from '../utils/localization';

const campsKo: CampEvent[] = [
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
      '블로꾸 빨라지다',
      { name: '여유와 설빈', musicianId: 9 },
      { name: '출장작곡가 김동산', musicianId: 3 },
      { name: '까르', musicianId: 5 },
      '오재환',
      '항아와 민지',
      '태히언',
      'DJ 옥과',
      'DJ 조수간만',
      'Kohey'
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
      '/images-webp/camps/2023/IMG_2465.webp',
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
      { name: '블로꾸 자파리 & 뽈레뽈레', musicianId: 13 },
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
    shortDescription: '2026년 6월 5일 ~ 7일, 강정체육공원',
    description: '2026년 6월 5일(금)부터 7일(일)까지 강정체육공원에서 열리는 제3회 강정피스앤뮤직캠프. 현재 음악가 32팀 출연 확정되었으며, 약 50-60팀 출연이 예상됩니다.',
    location: '강정체육공원',
    startDate: '2026-06-05',
    endDate: '2026-06-07',
    slogan: '',
    participants: [],
    images: []
  }
];

const campsEn: CampEvent[] = [
  {
    id: 'camp-2023',
    eventType: 'camp',
    year: 2023,
    title: '1st Gangjeong Peace Music Camp',
    shortDescription: 'The first camp singing for peace in Gangjeong Village',
    description: 'The first Peace Music Camp held in Gangjeong Village on June 10, 2023. Under the slogan “End the war! Play, dance, and sing!”, we shared solidarity and friendship within the Gangjeong peace movement.',
    location: 'Gangjeong Sports Park (669 Ieodo-ro, Seogwipo-si, Jeju)',
    startDate: '2023-06-10',
    slogan: 'End the war! Play, dance, and sing!',
    participants: [
      { name: 'Project Around Surround', musicianId: 1 },
      'Bloco Palazida',
      { name: 'Yeoyu & Seolbin', musicianId: 9 },
      { name: 'Guest Composer Kim Dongsan', musicianId: 3 },
      { name: 'Caru', musicianId: 5 },
      'Oh Jaehwan',
      'Hanga & Minji',
      'Taehyeon',
      'DJ Okgwa',
      'DJ Josuganman',
      'Kohey'
    ],
    staff: [
      { role: 'Planning', members: ['Jang Hana', 'Lee Sang', 'Hwang Gyeongha', 'Jarita', 'Eung', 'Andrea'] },
      { role: 'Lighting', members: ['Lee Sang'] },
      { role: 'Stage', members: ['Eung'] },
      { role: 'Sound', members: ['Hwang Gyeongha'] },
      { role: 'Program', members: ['Lee Sang'] },
      { role: 'Design', members: ['Yeoul', 'Jang Hana'] },
      { role: 'Photography', members: ['Jongeun'] },
      { role: 'Staff and Helpers', members: ['Dalhae', 'Doto', 'Rocky', 'More', 'Minsang', 'Park Yongseong', 'Sanho', 'Seongjun', 'Soseol', 'Yeoul', 'Young', 'Joeun', 'Junhu'] }
    ],
    collaborators: [
      "Gangjeong Village Residents' Committee Against the Naval Base", 'Gangjeong Friends', 'Gangjeong Peace Network',
      'Citizens’ Solidarity for an Open Military', 'St. Francis Peace Center Foundation',
      'Korean Peninsula Peace Action for 70 Years of Armistice', 'Mothers Who Do Politics', 'Peace Breeze'
    ],
    images: [
      '/images-webp/camps/2023/IMG_2465.webp',
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
    title: '2nd Gangjeong Peace Music Camp',
    shortDescription: 'On the 73rd anniversary of the armistice, raise the voices for peace',
    description: 'The second Peace Music Camp held across Gangjeong Village, Jeju, on June 14, 2025. Marking the 73rd anniversary of the armistice, it delivered a message of peace against the intensifying militarization of the Korean Peninsula.',
    location: 'Gangjeong Sports Park (2661, Gangjeong-dong, Seogwipo-si, Jeju) and around Gangjeong Village',
    startDate: '2025-06-14',
    endDate: '2025-06-14',
    slogan: "Let’s sing, let’s dance, end the war!",
    participants: [
      { name: 'Caru', musicianId: 5 },
      { name: 'Namsu', musicianId: 4 },
      { name: 'Bloco Jafari & PollePolle', musicianId: 13 },
      { name: 'MoredoSaturday', musicianId: 7 },
      'Oh Jaehwan',
      { name: 'Lee Seoyoung', musicianId: 12 },
      { name: 'Jai', musicianId: 11 },
      { name: 'Jeong Jinseok', musicianId: 2 },
      { name: 'Guest Composer Kim Dongsan', musicianId: 3 },
      'Taehyeon',
      { name: 'HANASH', musicianId: 11 }
    ],
    staff: [
      { role: 'Planning', members: ['Jang Hana', 'Lee Sang', 'Hwang Gyeongha'] },
      { role: 'Lighting', members: ['Lee Sang'] },
      { role: 'Sound', members: ['Kang Kyungdeok'] },
      { role: 'Program', members: ['Jang Hana'] },
      { role: 'Design', members: ['Doto'] },
      { role: 'Video', members: ['Hwang Gyeongha'] },
      { role: 'Photography', members: ['Kim Donghee'] },
      { role: 'Staff and Helpers', members: ['Deundeun', 'Ryeogang', 'Kare', 'Gaemi', 'Susan', 'Jihye', 'Beodeul', 'Kim Seonghwan', 'Lee Seongjun'] }
    ],
    collaborators: [
      'At the Margins', 'Pioneers', "Gangjeong Village Residents' Committee Against the Naval Base",
      'Gangjeong Friends', 'Gangjeong Peace Network', 'Space ()', 'St. Francis Peace Center Foundation',
      'A World Without War', 'Mothers Who Do Politics', 'Hot Pink Dolphins',
      'People Creating Jeju, the Demilitarized Peace Island'
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
    title: '3rd Gangjeong Peace Music Camp',
    shortDescription: 'June 5–7, 2026, Gangjeong Sports Park',
    description: 'The 3rd Gangjeong Peace Music Camp will be held at Gangjeong Sports Park from June 5 (Fri) to June 7 (Sun), 2026. Thirty-two teams are confirmed, with about 50–60 teams expected.',
    location: 'Gangjeong Sports Park',
    startDate: '2026-06-05',
    endDate: '2026-06-07',
    slogan: '',
    participants: [],
    images: []
  }
];

export const getCamps = (language?: string): CampEvent[] => (
  getLanguageCode(language) === 'ko' ? campsKo : campsEn
);

export const camps = campsKo;
