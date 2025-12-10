export interface TimelineEvent {
  id: string;
  year: number;
  month?: number;
  date?: string;
  title: string;
  description: string;
  location?: string;
  eventType: 'camp' | 'album' | 'milestone';
  imageUrl?: string;
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'camp-2023',
    year: 2023,
    month: 6,
    date: '2023-06-10',
    title: '제1회 강정피스앤뮤직캠프',
    description: '강정마을에서 개최된 첫 번째 평화음악캠프. "전쟁을 끝내자! 놀며, 춤추며, 노래하며!"라는 슬로건으로 강정 평화운동의 연대와 우정을 나누었습니다.',
    location: '강정체육공원 (제주 서귀포시)',
    eventType: 'camp'
  },
  {
    id: 'album-2024',
    year: 2024,
    month: 11,
    date: '2024-11-02',
    title: '이름을 모르는 먼 곳의 그대에게 앨범 발매 및 공연',
    description: '12명의 뮤지션들이 참여한 평화 음악 프로젝트 음반 발매. 강정마을과 서울 홍대에서 공연이 개최되었습니다.',
    location: '서울 홍대 스페이스 한강 및 제주 강정마을',
    eventType: 'album'
  },
  {
    id: 'camp-2025',
    year: 2025,
    month: 6,
    date: '2025-06-14',
    title: '제2회 강정피스앤뮤직캠프',
    description: '정전 73주년을 맞이하여 강화되는 한반도의 군사기지화에 맞서 평화의 메시지를 전한 두 번째 캠프.',
    location: '강정체육공원 및 강정마을 일대 (제주)',
    eventType: 'camp'
  },
  {
    id: 'camp-2026',
    year: 2026,
    month: 6,
    title: '제3회 강정피스앤뮤직캠프 (예정)',
    description: '다가올 평화음악캠프. 구체적인 일정과 프로그램은 추후 공지될 예정입니다.',
    location: '강정 (예정)',
    eventType: 'camp'
  }
];
