import { ROUTES } from '@/constants/routes';

export const simpleMenuItems = [
  { nameKey: 'nav.home', path: ROUTES.HOME },
  { nameKey: 'nav.solidarity', path: ROUTES.SOLIDARITY },
  { nameKey: 'nav.gallery', path: ROUTES.GALLERY },
  { nameKey: 'nav.video', path: ROUTES.VIDEOS },
  { nameKey: 'nav.press', path: ROUTES.PRESS },
];

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

// 커뮤니티(게시판) 드롭다운 — '커뮤니티'를 누르면 인덱스를 거치지 않고 각 게시판으로 바로 이동.
// 게시판 이름은 boards 테이블의 raw 한국어 이름과 동일하게 둔다. 다국어 대상이 아니므로
// (i18n:check가 비-KO 로케일의 한국어 값을 금지) locale JSON이 아닌 여기서 label로 직접 지정한다.
// boards 테이블이 바뀌면(추가/이름변경/비활성) 이 목록도 함께 갱신할 것.
export const communityItems = [
  { label: '후기', path: `${ROUTES.BOARD}/reviews` },
  { label: '자유게시판', path: `${ROUTES.BOARD}/free` },
  { label: '공연 소식', path: `${ROUTES.BOARD}/shows` },
];
