import { ROUTES } from '../../constants/routes';

export const simpleMenuItems = [
    { name: '홈', path: ROUTES.HOME },
    { name: '갤러리', path: ROUTES.GALLERY },
    { name: '비디오', path: ROUTES.VIDEOS },
    { name: '언론보도', path: ROUTES.PRESS },
];

export const campItems = [
    { name: '2023 캠프', path: ROUTES.CAMPS.CAMP_2023 },
    { name: '2025 캠프', path: ROUTES.CAMPS.CAMP_2025 },
    { name: '2026 캠프', path: ROUTES.CAMPS.CAMP_2026 },
    { name: '모든 캠프', path: ROUTES.CAMPS.ROOT },
];

export const albumItems = [
    { name: '앨범 소개', path: ROUTES.ALBUM.ABOUT },
    { name: '뮤지션', path: ROUTES.ALBUM.MUSICIANS },
    { name: '수록곡', path: ROUTES.ALBUM.TRACKS },
];
