import { ROUTES } from '@/constants/routes';

export const simpleMenuItems = [
  { nameKey: 'nav.home', path: ROUTES.HOME },
  { nameKey: 'nav.gallery', path: ROUTES.GALLERY },
  { nameKey: 'nav.video', path: ROUTES.VIDEOS },
  { nameKey: 'nav.press', path: ROUTES.PRESS },
];

// '연대 활동'은 게시판이 아닌 정적 페이지지만, 최상위 메뉴 항목 수를 줄여 가로 내비를
// 넉넉하게 두기 위해 커뮤니티 드롭다운 맨 위에 고정 노출한다(useCommunityBoards에서 prepend).
export const solidarityNavItem = { nameKey: 'nav.solidarity', path: ROUTES.SOLIDARITY };

export const campItems = [
  { nameKey: 'nav.camp_2023', path: ROUTES.CAMPS.CAMP_2023 },
  { nameKey: 'nav.camp_2025', path: ROUTES.CAMPS.CAMP_2025 },
  { nameKey: 'nav.camp_2026', path: ROUTES.CAMPS.CAMP_2026 },
];

export const albumItems = [
  { nameKey: 'nav.album_about', path: ROUTES.ALBUM.ABOUT },
  { nameKey: 'nav.musician', path: ROUTES.ALBUM.MUSICIANS },
  { nameKey: 'nav.track', path: ROUTES.ALBUM.TRACKS },
];

// 커뮤니티(게시판) 드롭다운의 폴백 목록. 실제 헤더는 useCommunityBoards가 활성 게시판을
// DB에서 불러와 자동 표시하며(관리자에서 추가/변경 시 자동 반영), 이 목록은 첫 렌더(SSR/초기)
// 와 조회 실패 시의 기본값으로만 쓰인다. 게시판 이름은 boards 테이블의 raw 한국어 이름과 맞춘다.
export const communityItems = [
  { label: '자유게시판', path: `${ROUTES.BOARD}/free` },
  { label: '후기', path: `${ROUTES.BOARD}/reviews` },
  { label: '공연 소식', path: `${ROUTES.BOARD}/shows` },
];
